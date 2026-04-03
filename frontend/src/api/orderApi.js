import { createServiceClient } from "@/api/createServiceClient";

const ORDER_API_BASE_URL = import.meta.env.VITE_ORDER_API_BASE_URL || "http://localhost:8000";
const orderClient = createServiceClient(ORDER_API_BASE_URL);

export async function listOrders({ clientId, freelancerId, statusFilter } = {}) {
  const params = {};
  if (clientId) params.client_id = clientId;
  if (freelancerId) params.freelancer_id = freelancerId;
  if (statusFilter) params.status_filter = statusFilter;
  return orderClient.get("/orders", { params });
}

export async function createOrder({
  clientId,
  freelancerId,
  gigId,
  price,
  orderDescription,
}) {
  return orderClient.post("/orders", {
    client_id: clientId,
    freelancer_id: freelancerId,
    gig_id: gigId,
    price,
    order_description: orderDescription || null,
  });
}

export async function updateOrderPaymentResult({
  orderId,
  paymentId,
  paymentStatus, // held | failed
}) {
  return orderClient.patch(`/orders/${orderId}/payment-result`, {
    payment_id: paymentId,
    payment_status: paymentStatus,
  });
}

export async function updateOrderPaymentReleaseResult({
  orderId,
  paymentId,
  paymentStatus, // released
}) {
  return orderClient.patch(`/orders/${orderId}/payment-release-result`, {
    payment_id: paymentId,
    payment_status: paymentStatus,
  });
}

export async function deliverOrder(orderId) {
  return orderClient.patch(`/orders/${orderId}/deliver`);
}

export async function approveOrder(orderId) {
  return orderClient.patch(`/orders/${orderId}/approve`);
}

export async function disputeOrder(orderId, disputeReason) {
  return orderClient.patch(`/orders/${orderId}/dispute`, {
    dispute_reason: disputeReason,
  });
}
