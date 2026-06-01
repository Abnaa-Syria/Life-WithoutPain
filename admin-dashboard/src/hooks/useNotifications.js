import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getDashboardSocket } from '../services/dashboardSocket';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notificationApi';
import useLanguage from './useLanguage';

const NOTIFICATIONS_KEY = ['notifications'];
const UNREAD_KEY = ['notifications', 'unread-count'];

export default function useNotifications() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const toastShownRef = useRef(new Set());

  const { data: listResponse, isLoading } = useQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'list'],
    queryFn: () => fetchNotifications({ page: 1, limit: 30 }),
    staleTime: 30_000,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: UNREAD_KEY,
    queryFn: fetchUnreadCount,
    staleTime: 15_000,
  });

  const notifications = listResponse?.data ?? [];

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    queryClient.invalidateQueries({ queryKey: UNREAD_KEY });
  }, [queryClient]);

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
  });

  const getLocalizedText = useCallback(
    (notification, field) => {
      const arKey = `${field}Ar`;
      const enKey = `${field}En`;
      if (language === 'ar') return notification[arKey] || notification[enKey];
      return notification[enKey] || notification[arKey];
    },
    [language],
  );

  useEffect(() => {
    const socket = getDashboardSocket();
    if (!socket) return undefined;

    const handleNew = (payload) => {
      const notification = payload?.notification;
      if (!notification?.id) return;

      if (toastShownRef.current.has(notification.id)) return;
      toastShownRef.current.add(notification.id);

      const title = getLocalizedText(notification, 'title');
      const body = getLocalizedText(notification, 'body');
      toast(`${title}\n${body}`, { icon: '🔔', duration: 5000 });

      queryClient.setQueryData(UNREAD_KEY, (prev) => (typeof prev === 'number' ? prev + 1 : 1));
      queryClient.setQueryData([...NOTIFICATIONS_KEY, 'list'], (old) => {
        if (!old?.data) return old;
        const exists = old.data.some((n) => n.id === notification.id);
        if (exists) return old;
        return {
          ...old,
          data: [notification, ...old.data].slice(0, 30),
          meta: old.meta
            ? { ...old.meta, total: (old.meta.total ?? old.data.length) + 1 }
            : old.meta,
        };
      });
    };

    socket.on('notification:new', handleNew);
    return () => {
      socket.off('notification:new', handleNew);
    };
  }, [queryClient, getLocalizedText]);

  const markRead = useCallback(
    (id) => markReadMutation.mutate(id),
    [markReadMutation],
  );

  const markAllRead = useCallback(
    () => markAllReadMutation.mutate(),
    [markAllReadMutation],
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    isMarkingAll: markAllReadMutation.isPending,
    getLocalizedText,
    emptyLabel: t('notifications.empty'),
    markAllLabel: t('notifications.mark_all_read'),
    titleLabel: t('notifications.title'),
  };
}
