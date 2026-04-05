from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.clients import CHAT_WS_BASE_URL, ServiceClient
from app.database import get_db
from app.models import DisputeCase, SettlementProposal
from app.schemas import (
    ChatBootstrapResponse,
    CreateProposalRequest,
    DecideProposalRequest,
    InboxItem,
    ProposalResponse,
    SettleResult,
    StartDisputeRequest,
    StartDisputeResponse,
)

router = APIRouter(tags=["disputes"])


def _get_dispute_case_or_404(db: Session, order_id: int) -> DisputeCase:
    case = db.query(DisputeCase).filter(DisputeCase.order_id == order_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Dispute case for order {order_id} not found")
    return case


def _get_latest_proposal(db: Session, order_id: int) -> SettlementProposal | None:
    return (
        db.query(SettlementProposal)
        .filter(SettlementProposal.order_id == order_id)
        .order_by(desc(SettlementProposal.created_at), desc(SettlementProposal.id))
        .first()
    )

#returns the chat + wsUrl
@router.post("/disputes/start", response_model=StartDisputeResponse)
async def start_dispute(payload: StartDisputeRequest, db: Session = Depends(get_db)):
    existing = db.query(DisputeCase).filter(DisputeCase.order_id == payload.order_id).first()
    if existing:
        order = await ServiceClient.get_order(payload.order_id)
        return StartDisputeResponse(
            order=order,
            chat={"chat_id": existing.chat_id},
            ws_url=f"{CHAT_WS_BASE_URL}/{existing.chat_id}",
        )

    order = await ServiceClient.get_order(payload.order_id)

    client_id = int(order.get("client_id"))
    freelancer_id = int(order.get("freelancer_id"))
    if payload.actor_user_id not in {client_id, freelancer_id}:
        raise HTTPException(status_code=403, detail="Actor is not part of this order")

    disputed_order = await ServiceClient.mark_disputed(payload.order_id, payload.reason)
    chat = await ServiceClient.create_or_get_chat(
        order_id=payload.order_id,
        client_id=client_id,
        freelancer_id=freelancer_id,
    )

    case = DisputeCase(
        order_id=payload.order_id,
        chat_id=int(chat["chat_id"]),
        client_id=client_id,
        freelancer_id=freelancer_id,
        reason=payload.reason,
        status="OPEN",
    )
    db.add(case)
    db.commit()

    return StartDisputeResponse(
        order=disputed_order,
        chat=chat,
        ws_url=f"{CHAT_WS_BASE_URL}/{chat['chat_id']}",
    )


@router.get("/chat/inbox", response_model=list[InboxItem])
async def get_chat_inbox(user_id: int, db: Session = Depends(get_db)):
    cases = (
        db.query(DisputeCase)
        .filter((DisputeCase.client_id == user_id) | (DisputeCase.freelancer_id == user_id))
        .order_by(desc(DisputeCase.updated_at), desc(DisputeCase.id))
        .all()
    )

    results: list[InboxItem] = []
    for case in cases:
        order = await ServiceClient.get_order(case.order_id)
        other_user_id = case.freelancer_id if user_id == case.client_id else case.client_id
        latest = _get_latest_proposal(db, case.order_id)
        results.append(
            InboxItem(
                order_id=case.order_id,
                chat_id=case.chat_id,
                other_user_id=other_user_id,
                chat_status="OPEN" if case.status == "OPEN" else "CLOSED",
                order_status=str(order.get("status", "unknown")),
                latest_proposal_status=latest.status if latest else None,
            )
        )
    return results

#returns chatid, messages and wsUrl
@router.get("/chat/{chat_id}/bootstrap", response_model=ChatBootstrapResponse)
async def get_chat_bootstrap(chat_id: int, user_id: int, db: Session = Depends(get_db)):
    case = db.query(DisputeCase).filter(DisputeCase.chat_id == chat_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Dispute chat {chat_id} not found")
    if user_id not in {case.client_id, case.freelancer_id}:
        raise HTTPException(status_code=403, detail="Forbidden")

    messages = await ServiceClient.get_chat_messages(chat_id)
    latest = _get_latest_proposal(db, case.order_id)

    return ChatBootstrapResponse(
        order_id=case.order_id,
        chat_id=chat_id,
        ws_url=f"{CHAT_WS_BASE_URL}/{chat_id}",
        messages=messages,
        chat_status="OPEN" if case.status == "OPEN" else "CLOSED",
        latest_proposal=ProposalResponse.model_validate(latest) if latest else None,
    )


#Creates PENDING proposal (REFUND or RELEASE), enforces only one pending proposal per order
@router.post("/disputes/{order_id}/settlement/proposals", response_model=ProposalResponse, status_code=201)
def create_settlement_proposal(order_id: int, payload: CreateProposalRequest, db: Session = Depends(get_db)):
    case = _get_dispute_case_or_404(db, order_id)
    if case.status != "OPEN":
        raise HTTPException(status_code=409, detail="Dispute is already closed")
    if payload.proposer_id not in {case.client_id, case.freelancer_id}:
        raise HTTPException(status_code=403, detail="Proposer is not part of this dispute")

    existing_pending = (
        db.query(SettlementProposal)
        .filter(SettlementProposal.order_id == order_id, SettlementProposal.status == "PENDING")
        .first()
    )
    if existing_pending:
        raise HTTPException(status_code=409, detail="An active settlement proposal already exists")

    proposal = SettlementProposal(
        order_id=order_id,
        proposer_id=payload.proposer_id,
        action=payload.action,
        amount=payload.amount,
        status="PENDING",
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal


@router.get("/disputes/{order_id}/settlement/proposals/latest", response_model=ProposalResponse)
def get_latest_settlement_proposal(order_id: int, db: Session = Depends(get_db)):
    proposal = _get_latest_proposal(db, order_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="No settlement proposal found")
    return proposal

#mark as rejected
@router.post(
    "/disputes/{order_id}/settlement/proposals/{proposal_id}/reject",
    response_model=ProposalResponse,
)
def reject_settlement_proposal(
    order_id: int,
    proposal_id: int,
    payload: DecideProposalRequest,
    db: Session = Depends(get_db),
):
    case = _get_dispute_case_or_404(db, order_id)
    proposal = (
        db.query(SettlementProposal)
        .filter(SettlementProposal.id == proposal_id, SettlementProposal.order_id == order_id)
        .first()
    )
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
    if proposal.status != "PENDING":
        raise HTTPException(status_code=409, detail="Proposal is not pending")
    if payload.responder_id not in {case.client_id, case.freelancer_id}:
        raise HTTPException(status_code=403, detail="Responder is not part of this dispute")
    if payload.responder_id == proposal.proposer_id:
        raise HTTPException(status_code=403, detail="Proposer cannot reject own proposal")

    proposal.status = "REJECTED"
    proposal.responder_id = payload.responder_id
    proposal.rejection_reason = payload.rejection_reason
    proposal.decided_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(proposal)
    return proposal

#ensures proposer is not the one that accepts
@router.post(
    "/disputes/{order_id}/settlement/proposals/{proposal_id}/accept",
    response_model=SettleResult,
)
async def accept_settlement_proposal(
    order_id: int,
    proposal_id: int,
    payload: DecideProposalRequest,
    db: Session = Depends(get_db),
):
    case = _get_dispute_case_or_404(db, order_id)
    if case.status != "OPEN":
        raise HTTPException(status_code=409, detail="Dispute is already closed")

    proposal = (
        db.query(SettlementProposal)
        .filter(SettlementProposal.id == proposal_id, SettlementProposal.order_id == order_id)
        .first()
    )
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
    if proposal.status != "PENDING":
        raise HTTPException(status_code=409, detail="Proposal is not pending")
    if payload.responder_id not in {case.client_id, case.freelancer_id}:
        raise HTTPException(status_code=403, detail="Responder is not part of this dispute")
    if payload.responder_id == proposal.proposer_id:
        raise HTTPException(status_code=403, detail="Proposer cannot accept own proposal")

    payment_record = await ServiceClient.resolve_payment_for_order(order_id)
    payment_id = int(payment_record["payment_id"])

    if proposal.action == "REFUND":
        payment_result = await ServiceClient.refund_payment(payment_id)
    else:
        payment_result = await ServiceClient.release_payment(payment_id)

    settle_amount = float(proposal.amount) if proposal.amount is not None else None
    order_result = await ServiceClient.settle_order(order_id, proposal.action, settle_amount)

    proposal.status = "EXECUTED"
    proposal.responder_id = payload.responder_id
    proposal.decided_at = datetime.now(timezone.utc)
    proposal.payment_id = payment_id
    proposal.payment_status = str(payment_result.get("status"))

    case.status = "CLOSED"
    case.final_action = proposal.action

    db.commit()
    db.refresh(proposal)

    return SettleResult(
        order=order_result,
        payment=payment_result,
        proposal=ProposalResponse.model_validate(proposal),
    )
