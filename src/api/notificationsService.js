import api from "./client";

export async function getUserNotifications(userId) {
  const { data } = await api.get(`/notifications/user/${Number(userId)}`);
  return data;
}

export async function getNotificationsByUser(userId) {
  return getUserNotifications(userId);
}

export async function markNotificationAsRead(notificationId) {
  await api.put(`/notifications/${Number(notificationId)}/read`);
}
