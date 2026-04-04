import { createServiceClient } from "@/api/createServiceClient";

const NOTIFICATION_API_BASE_URL =
  import.meta.env.VITE_NOTIFICATION_API_BASE_URL || "http://localhost:8005";
const notificationClient = createServiceClient(NOTIFICATION_API_BASE_URL);

export async function getNotificationsByUser(userId) {
  return notificationClient.get(`/notifications/${userId}`);
}
