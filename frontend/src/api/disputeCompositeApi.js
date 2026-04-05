import { createServiceClient } from "@/api/createServiceClient";

const DISPUTE_COMPOSITE_BASE_URL =
  import.meta.env.VITE_DISPUTE_COMPOSITE_API_BASE_URL || "http://localhost:8091";

const disputeClient = createServiceClient(DISPUTE_COMPOSITE_BASE_URL);

export async function startDispute({ orderId, actorUserId, reason }) {
  return disputeClient.post("/disputes/start", {
    order_id: orderId,
    actor_user_id: actorUserId,
    reason,
  });
}

export async function fetchChatInbox(userId) {
  return disputeClient.get("/chat/inbox", {
    params: { user_id: userId },
  });
}

export async function fetchChatBootstrap(chatId, userId) {
  return disputeClient.get(`/chat/${chatId}/bootstrap`, {
    params: { user_id: userId },
  });
}

export async function createSettlementProposal(orderId, payload) {
  return disputeClient.post(`/disputes/${orderId}/settlement/proposals`, payload);
}

export async function getLatestSettlementProposal(orderId) {
  return disputeClient.get(`/disputes/${orderId}/settlement/proposals/latest`);
}

export async function acceptSettlementProposal(orderId, proposalId, responderId) {
  return disputeClient.post(
    `/disputes/${orderId}/settlement/proposals/${proposalId}/accept`,
    { responder_id: responderId },
  );
}

export async function rejectSettlementProposal(orderId, proposalId, responderId, rejectionReason) {
  return disputeClient.post(
    `/disputes/${orderId}/settlement/proposals/${proposalId}/reject`,
    {
      responder_id: responderId,
      rejection_reason: rejectionReason || null,
    },
  );
}
