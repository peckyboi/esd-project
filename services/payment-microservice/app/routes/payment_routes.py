from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import Payment, PaymentStatus
from app.schemas import (
    HoldPaymentRequest,
    ReleasePaymentRequest,
    RefundPaymentRequest,
    PaymentResponse
)
from app import stripe_client, rabbitmq

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/hold", response_model=PaymentResponse, status_code=201)
def hold_payment(request: HoldPaymentRequest, db: Session = Depends(get_db)):
    """
    Hold payment in escrow via Stripe PaymentIntent.
    Called by composite service when client places an order.
    Returns payment hold result to caller (UI/composite orchestrates next step).
    """
    # Create payment record with pending status first
    payment = Payment(
        order_id=request.order_id,
        client_id=request.client_id,
        freelancer_id=request.freelancer_id,
        amount=request.amount,
        status=PaymentStatus.failed,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Call Stripe to hold payment
    result = stripe_client.create_payment_intent(amount=request.amount)

    if result["success"]:
        payment.status = PaymentStatus.held
        payment.stripe_payment_intent_id = result["payment_intent_id"]
        db.commit()
        db.refresh(payment)
        try:
            rabbitmq.publish_payment_success(
                order_id=payment.order_id,
                payment_id=payment.payment_id,
                amount=float(payment.amount),
            )
        except Exception as err:
            print(f"Failed to publish PaymentSuccess event: {err}")

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Stripe payment failed: {result.get('error')}"
        )

    return payment


@router.patch("/release", response_model=PaymentResponse)
def release_payment(request: ReleasePaymentRequest, db: Session = Depends(get_db)):
    """
    Release held payment to freelancer via Stripe capture.
    Called after order is completed and approved.
    Returns released status to caller.
    """
    payment = db.query(Payment).filter(Payment.payment_id == request.payment_id).first()

    if not payment:
        raise HTTPException(status_code=404, detail=f"Payment {request.payment_id} not found")

    if payment.status != PaymentStatus.held:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot release payment with status: {payment.status}"
        )

    # Call Stripe to capture (release) the payment
    result = stripe_client.capture_payment_intent(payment.stripe_payment_intent_id)

    if result["success"]:
        payment.status = PaymentStatus.released
        db.commit()
        db.refresh(payment)
        try:
            rabbitmq.publish_payment_completed(
                order_id=payment.order_id,
                payment_id=payment.payment_id,
                status=str(payment.status),
                client_id=payment.client_id,
                freelancer_id=payment.freelancer_id,
            )
        except Exception as err:
            print(f"Failed to publish payment.completed event: {err}")

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Stripe release failed: {result.get('error')}"
        )

    return payment


@router.patch("/refund", response_model=PaymentResponse)
def refund_payment(request: RefundPaymentRequest, db: Session = Depends(get_db)):
    """
    Refund held payment back to client via Stripe refund.
    Called when dispute is resolved in client's favour.
    Returns refunded status to caller.
    """
    payment = db.query(Payment).filter(Payment.payment_id == request.payment_id).first()

    if not payment:
        raise HTTPException(status_code=404, detail=f"Payment {request.payment_id} not found")

    if payment.status != PaymentStatus.held:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot refund payment with status: {payment.status}"
        )

    # Call Stripe to refund the payment
    result = stripe_client.refund_payment_intent(payment.stripe_payment_intent_id)

    if result["success"]:
        payment.status = PaymentStatus.refunded
        db.commit()
        db.refresh(payment)
        try:
            rabbitmq.publish_payment_completed(
                order_id=payment.order_id,
                payment_id=payment.payment_id,
                status=str(payment.status),
                client_id=payment.client_id,
                freelancer_id=payment.freelancer_id,
            )
        except Exception as err:
            print(f"Failed to publish payment.completed event: {err}")

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Stripe refund failed: {result.get('error')}"
        )

    return payment


@router.get("/", response_model=list[PaymentResponse])
def list_payments(db: Session = Depends(get_db)):
    """
    List all payment records, newest first.
    """
    return db.query(Payment).order_by(Payment.payment_id.desc()).all()


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    """
    Get payment details by payment_id.
    """
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()

    if not payment:
        raise HTTPException(status_code=404, detail=f"Payment {payment_id} not found")

    return payment
