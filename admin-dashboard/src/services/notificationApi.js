import api from './api';

export async function fetchNotifications({ page = 1, limit = 20, isRead } = {}) {
  const params = { page, limit };
  if (isRead !== undefined) params.isRead = isRead;
  const res = await api.get(`/admin/notifications`, { params });
  return { data: res.data.data ?? [], meta: res.data.meta };
}

export async function fetchUnreadCount() {
  const res = await api.get(`/admin/notifications/unread-count`);
  return res.data?.data?.count ?? 0;
}

export async function markNotificationRead(id) {
  const res = await api.patch(`/admin/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await api.patch(`/admin/notifications/read-all`);
  return res.data;
}
