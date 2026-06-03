import api from './api';

export async function fetchNotifications({ page = 1, limit = 20, isRead } = {}) {
  const params = { page, limit };
  if (isRead !== undefined) params.isRead = isRead;
  const res = await api.get('/notifications', { params });
  return { data: res.data.data ?? [], meta: res.data.meta };
}

export async function fetchUnreadCount() {
  const res = await api.get('/notifications/unread-count');
  return res.data?.data?.count ?? 0;
}

export async function markNotificationRead(id) {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await api.patch('/notifications/read-all');
  return res.data;
}

export async function fetchManualNotifications({ page = 1, limit = 20 } = {}) {
  const res = await api.get('/admin/notifications/manual', { params: { page, limit } });
  return { data: res.data.data ?? [], meta: res.data.meta };
}

export async function fetchManualNotification(id) {
  const res = await api.get(`/admin/notifications/manual/${id}`);
  return res.data?.data;
}

export async function sendManualNotification(payload) {
  const res = await api.post('/admin/notifications/send', payload);
  return res.data;
}

export async function resendManualNotification(id) {
  const res = await api.post(`/admin/notifications/manual/${id}/resend`);
  return res.data;
}

export async function deleteManualNotification(id) {
  const res = await api.delete(`/admin/notifications/manual/${id}`);
  return res.data;
}

export async function searchNotificationUsers({ q, role, page = 1, limit = 20 } = {}) {
  const res = await api.get('/admin/notifications/users/search', {
    params: { q, role, page, limit },
  });
  return { data: res.data.data ?? [], meta: res.data.meta };
}
