import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import useNotifications from '../../hooks/useNotifications';
import useLanguage from '../../hooks/useLanguage';
import { getNotificationLink } from '../../utils/notificationLinks';

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { isRTL, language } = useLanguage();
  const {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    isMarkingAll,
    getLocalizedText,
    emptyLabel,
    markAllLabel,
    titleLabel,
  } = useNotifications();

  const dateLocale = language === 'ar' ? ar : enUS;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }
    const link = getNotificationLink(notification);
    setOpen(false);
    if (link) navigate(link);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative p-2.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-secondary)] transition-all ${open ? 'bg-[var(--surface-secondary)] text-[var(--primary)]' : ''}`}
        aria-label={titleLabel}
        aria-expanded={open}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 end-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-[var(--danger)] rounded-full border-2 border-[var(--bg-card)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 w-[min(100vw-2rem,380px)] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl z-[60] overflow-hidden
            ${isRTL ? 'left-0' : 'right-0'}
          `}
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--divider)]">
            <h3 className="text-body font-semibold">{titleLabel}</h3>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                disabled={isMarkingAll || unreadCount === 0}
                className="flex items-center gap-1 text-helper text-[var(--primary)] hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {isMarkingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                {markAllLabel}
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-center text-[var(--text-muted)] text-body py-10 px-4">{emptyLabel}</p>
            ) : (
              <ul className="divide-y divide-[var(--divider)]">
                {notifications.map((notification) => {
                  const title = getLocalizedText(notification, 'title');
                  const body = getLocalizedText(notification, 'body');
                  const timeAgo = notification.createdAt
                    ? formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: dateLocale,
                      })
                    : '';

                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-start px-4 py-3 hover:bg-[var(--surface-secondary)] transition-colors
                          ${!notification.isRead ? 'bg-[var(--primary-bg)]/30' : ''}
                        `}
                      >
                        <div className="flex items-start gap-2">
                          {!notification.isRead && (
                            <span className="mt-2 w-2 h-2 shrink-0 rounded-full bg-[var(--primary)]" />
                          )}
                          <div className={`flex-1 min-w-0 ${notification.isRead ? 'ps-4' : ''}`}>
                            <p className="text-body font-semibold truncate">{title}</p>
                            <p className="text-helper text-[var(--text-muted)] line-clamp-2 mt-0.5">{body}</p>
                            <p className="text-helper text-[var(--text-muted)] mt-1">{timeAgo}</p>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
