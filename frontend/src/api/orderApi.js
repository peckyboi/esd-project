import { createServiceClient } from "@/api/createServiceClient";

const ORDER_API_BASE_URL = import.meta.env.VITE_ORDER_API_BASE_URL || "http://localhost:8000";
const orderClient = createServiceClient(ORDER_API_BASE_URL);

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
