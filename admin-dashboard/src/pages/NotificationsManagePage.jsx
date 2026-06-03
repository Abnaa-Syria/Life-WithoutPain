import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Bell, Send, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import {
  fetchManualNotifications,
  fetchManualNotification,
  sendManualNotification,
  resendManualNotification,
  searchNotificationUsers,
} from '../services/notificationApi';

const NOTIF_TYPES = [
  'SYSTEM', 'APPOINTMENT', 'PAYMENT', 'INSURANCE', 'VERIFICATION',
  'SUPPORT', 'CHAT', 'LAB_RESULT', 'PRESCRIPTION', 'REPORT', 'REVIEW', 'USER',
];

const AUDIENCE_OPTIONS = [
  { value: 'PATIENT', labelKey: 'notifications.audience.patient' },
  { value: 'DOCTOR', labelKey: 'notifications.audience.doctor' },
  { value: 'STAFF', labelKey: 'notifications.audience.staff' },
  { value: 'ROLE:SUPER_ADMIN', labelKey: 'notifications.audience.super_admin' },
  { value: 'ROLE:MEDICAL_ADMIN', labelKey: 'notifications.audience.medical_admin' },
  { value: 'ROLE:INSURANCE_STAFF', labelKey: 'notifications.audience.insurance_staff' },
  { value: 'ROLE:SUPPORT_STAFF', labelKey: 'notifications.audience.support_staff' },
  { value: 'ROLE:ACCOUNTANT', labelKey: 'notifications.audience.accountant' },
];

const EMPTY_FORM = {
  titleAr: '',
  titleEn: '',
  bodyAr: '',
  bodyEn: '',
  type: 'SYSTEM',
  targetMode: 'audience',
  targetAudience: 'PATIENT',
  userId: '',
};

export default function NotificationsManagePage() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [sendOpen, setSendOpen] = useState(false);
  const [viewId, setViewId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: listRes, isLoading } = useQuery({
    queryKey: ['admin-notifications-manual'],
    queryFn: () => fetchManualNotifications({ page: 1, limit: 50 }),
  });

  const { data: viewData, isLoading: viewLoading } = useQuery({
    queryKey: ['admin-notification-manual', viewId],
    queryFn: () => fetchManualNotification(viewId),
    enabled: !!viewId,
  });

  const { data: userSearchRes } = useQuery({
    queryKey: ['notification-user-search', userSearch],
    queryFn: () => searchNotificationUsers({ q: userSearch, limit: 10 }),
    enabled: form.targetMode === 'user' && userSearch.length >= 2,
  });

  const sendMutation = useMutation({
    mutationFn: sendManualNotification,
    onSuccess: () => {
      toast.success(t('notifications.sent_success'));
      qc.invalidateQueries({ queryKey: ['admin-notifications-manual'] });
      setSendOpen(false);
      setForm(EMPTY_FORM);
      setSelectedUser(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || t('messages.error')),
  });

  const resendMutation = useMutation({
    mutationFn: resendManualNotification,
    onSuccess: () => {
      toast.success(t('notifications.resent_success'));
      qc.invalidateQueries({ queryKey: ['admin-notifications-manual'] });
      setViewId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || t('messages.error')),
  });

  const rows = listRes?.data ?? [];

  const audienceLabel = useCallback((aud) => {
    if (!aud) return '—';
    if (aud.startsWith('USER:')) return t('notifications.audience.specific_user');
    const opt = AUDIENCE_OPTIONS.find((o) => o.value === aud);
    return opt ? t(opt.labelKey) : aud;
  }, [t]);

  const columns = useMemo(() => [
    { header: '#', accessorKey: 'id' },
    {
      header: t('common.title'),
      accessorKey: 'title',
      cell: ({ row }) => (i18n.language === 'ar' ? row.original.titleAr : row.original.titleEn) || row.original.titleEn,
    },
    {
      header: t('notifications.target_audience'),
      accessorKey: 'targetAudience',
      cell: ({ row }) => audienceLabel(row.original.targetAudience),
    },
    {
      header: t('notifications.recipient'),
      accessorKey: 'user',
      cell: ({ row }) => row.original.user?.fullName || '—',
    },
    { header: t('common.type'), accessorKey: 'type', cell: ({ row }) => <Badge variant="info">{row.original.type}</Badge> },
    {
      header: t('common.created_at'),
      accessorKey: 'createdAt',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
  ], [t, i18n.language, audienceLabel]);

  const handleSend = (e) => {
    e.preventDefault();
    const payload = {
      titleAr: form.titleAr,
      titleEn: form.titleEn,
      bodyAr: form.bodyAr,
      bodyEn: form.bodyEn,
      type: form.type,
    };
    if (form.targetMode === 'user') {
      if (!selectedUser?.id) {
        toast.error(t('notifications.select_user'));
        return;
      }
      payload.userId = selectedUser.id;
    } else {
      payload.targetAudience = form.targetAudience;
    }
    sendMutation.mutate(payload);
  };

  const localized = (n, field) => (i18n.language === 'ar' ? n?.[`${field}Ar`] : n?.[`${field}En`]) || n?.[`${field}En`];

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('sidebar.notifications')}
        subtitle={t('notifications.manual_only')}
        action={
          <button type="button" className="btn btn-primary" onClick={() => setSendOpen(true)}>
            <Send size={18} />
            {t('notifications.send')}
          </button>
        }
      />

      <Card>
        <DataTable
          data={rows}
          columns={columns}
          isLoading={isLoading}
          onView={(row) => setViewId(row.id)}
        />
      </Card>

      <Modal isOpen={sendOpen} onClose={() => setSendOpen(false)} title={t('notifications.send')} size="lg">
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">{t('common.title_ar')}</span>
              <input className="input w-full mt-1" required value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t('common.title_en')}</span>
              <input className="input w-full mt-1" required value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium">{t('common.body_ar')}</span>
            <textarea className="input w-full mt-1" rows={3} required value={form.bodyAr} onChange={(e) => setForm({ ...form, bodyAr: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t('common.body_en')}</span>
            <textarea className="input w-full mt-1" rows={3} required value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t('common.type')}</span>
            <select className="input w-full mt-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {NOTIF_TYPES.map((type) => (
                <option key={type} value={type}>{t(`notifications.types.${type.toLowerCase()}`, { defaultValue: type })}</option>
              ))}
            </select>
          </label>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{t('notifications.target_audience')}</legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" checked={form.targetMode === 'audience'} onChange={() => setForm({ ...form, targetMode: 'audience' })} />
                {t('notifications.by_user_type')}
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={form.targetMode === 'user'} onChange={() => setForm({ ...form, targetMode: 'user' })} />
                {t('notifications.specific_user')}
              </label>
            </div>
          </fieldset>
          {form.targetMode === 'audience' ? (
            <select className="input w-full" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}>
              {AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
              ))}
            </select>
          ) : (
            <div className="space-y-2">
              <input
                className="input w-full"
                placeholder={t('notifications.search_user')}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              {selectedUser && (
                <p className="text-sm text-primary-600">{selectedUser.fullName} ({selectedUser.email})</p>
              )}
              <ul className="border border-[var(--border-color)] rounded-xl divide-y max-h-40 overflow-y-auto">
                {(userSearchRes?.data ?? []).map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      className="w-full text-start px-4 py-2 hover:bg-[var(--surface-secondary)]"
                      onClick={() => { setSelectedUser(u); setUserSearch(u.fullName); }}
                    >
                      {u.fullName} — {u.role}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="btn btn-secondary" onClick={() => setSendOpen(false)}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={sendMutation.isPending}>{t('notifications.send')}</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!viewId}
        onClose={() => setViewId(null)}
        title={viewLoading ? t('common.loading') : localized(viewData, 'title')}
        size="md"
      >
        {viewData && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              {t('notifications.target_audience')}: {audienceLabel(viewData.targetAudience)}
            </p>
            <p className="text-sm">{t('notifications.recipient')}: {viewData.user?.fullName}</p>
            <p className="whitespace-pre-wrap">{localized(viewData, 'body')}</p>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--divider)]">
              <button type="button" className="btn btn-secondary" onClick={() => setViewId(null)}>
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-primary inline-flex items-center gap-2"
                disabled={resendMutation.isPending}
                onClick={() => resendMutation.mutate(viewId)}
              >
                <RotateCcw size={18} />
                {t('notifications.resend')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
