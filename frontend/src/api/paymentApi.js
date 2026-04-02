import { createServiceClient } from "@/api/createServiceClient";

const PAYMENT_API_BASE_URL = import.meta.env.VITE_PAYMENT_API_BASE_URL || "http://localhost:8002";
const paymentClient = createServiceClient(PAYMENT_API_BASE_URL); //basically pre-creates the whole long api call to a short interceptor

export async function holdPayment({
  orderId,
  clientId,
  freelancerId,
  amount,
}) {
  return paymentClient.post("/payments/hold", {
    order_id: orderId,
    client_id: clientId,
    freelancer_id: freelancerId,
    amount,
  });
}

export async function releasePayment({ paymentId }) {
  return paymentClient.patch("/payments/release", {
    payment_id: paymentId,
  });
}

export async function refundPayment({ paymentId }) {
  return paymentClient.patch("/payments/refund", {
    payment_id: paymentId,
  });
}

export async function listPayments() {
  return paymentClient.get("/payments");
}
