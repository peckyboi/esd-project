import os
import stripe

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_placeholder")

# Stripe test payment method (simulates a valid card)
TEST_PAYMENT_METHOD = "pm_card_visa"


def create_payment_intent(amount: float, currency: str = "usd") -> dict:
    """
    Create a Stripe PaymentIntent with capture_method=manual.
    This holds the payment in escrow without capturing immediately.
    Amount is in cents for Stripe.
    """
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Stripe uses cents
            currency=currency,
            capture_method="manual",  # Hold in escrow
            payment_method=TEST_PAYMENT_METHOD,
            confirm=True,  # Confirm immediately with test card
            automatic_payment_methods={
                "enabled": True,
                "allow_redirects": "never"  # No redirect-based payment methods
            }
        )
        return {"success": True, "payment_intent_id": intent.id, "status": intent.status}
    except stripe.error.StripeError as e:
        return {"success": False, "error": str(e)}


def capture_payment_intent(payment_intent_id: str) -> dict:
    """
    Capture (release) a held PaymentIntent.
    This releases the funds to complete the payment.
    """
    try:
        intent = stripe.PaymentIntent.capture(payment_intent_id)
        return {"success": True, "payment_intent_id": intent.id, "status": intent.status}
    except stripe.error.StripeError as e:
        return {"success": False, "error": str(e)}


def refund_payment_intent(payment_intent_id: str) -> dict:
    """
    Refund/cancel a held PaymentIntent back to the client.
    For uncaptured (held) payments, we cancel the PaymentIntent
    instead of issuing a refund directly.
    """
    try:
        # Cancel the PaymentIntent instead of refunding
        # This is correct for uncaptured (held) payments
        intent = stripe.PaymentIntent.cancel(payment_intent_id)
        return {"success": True, "payment_intent_id": intent.id, "status": intent.status}
    except stripe.error.StripeError as e:
        return {"success": False, "error": str(e)}
