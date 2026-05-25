import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import useSupportTicketSocket from '../hooks/useSupportTicketSocket';
import { useTranslation } from 'react-i18next';
import DetailsHeader from '../components/ui/DetailsHeader';
import DetailsSection from '../components/ui/DetailsSection';
import DetailItem from '../components/ui/DetailItem';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { Headphones, MessageSquare, User, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

export default function SupportTicketDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const qc = useQueryClient();
  const [reply, setReply] = useState('');
  const [files, setFiles] = useState([]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['support-ticket', id],
    queryFn: () => api.get(`/admin/support/tickets/${id}`).then((res) => res.data),
  });

  const { data: staffUsers } = useQuery({
    queryKey: ['admin-users-support'],
    queryFn: () => api.get('/admin/users').then((r) => r.data?.data || []),
  });

  const ticket = response?.data;

  useSupportTicketSocket(id, {
    onMessage: (payload) => {
      qc.setQueryData(['support-ticket', id], (old) => {
        if (!old?.data) return old;
        const exists = old.data.messages?.some((m) => m.id === payload.message?.id);
        if (exists) return old;
        return {
          ...old,
          data: {
            ...old.data,
            messages: [...(old.data.messages || []), payload.message],
            unreadCount: 0,
            lastActivityAt: payload.message?.createdAt || old.data.lastActivityAt,
          },
        };
      });
      qc.invalidateQueries({ queryKey: ['admin-support-tickets'] });
    },
    onStatus: (payload) => {
      if (payload.ticket) {
        qc.setQueryData(['support-ticket', id], (old) => ({
          ...old,
          data: { ...old?.data, ...payload.ticket },
        }));
      } else if (payload.status) {
        qc.setQueryData(['support-ticket', id], (old) => ({
          ...old,
          data: { ...old?.data, status: payload.status },
        }));
      }
      qc.invalidateQueries({ queryKey: ['admin-support-tickets'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => api.patch(`/admin/support/tickets/${id}/status`, { status }),
    onSuccess: () => {
      toast.success(t('messages.saved'));
      qc.invalidateQueries(['support-ticket', id]);
      qc.invalidateQueries(['admin-support-tickets']);
    },
  });

  const assignMutation = useMutation({
    mutationFn: (assignedAdminId) => api.patch(`/admin/support/tickets/${id}/assign`, { assignedAdminId }),
    onSuccess: () => {
      toast.success(t('messages.saved'));
      qc.invalidateQueries(['support-ticket', id]);
    },
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append('message', reply);
      files.forEach((f) => form.append('files', f));
      return api.post(`/admin/support/tickets/${id}/messages`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (res) => {
      setReply('');
      setFiles([]);
      toast.success(t('messages.saved'));
      const newMsg = res?.data?.data;
      if (newMsg) {
        qc.setQueryData(['support-ticket', id], (old) => {
          if (!old?.data) return old;
          const exists = old.data.messages?.some((m) => m.id === newMsg.id);
          if (exists) return old;
          return {
            ...old,
            data: {
              ...old.data,
              messages: [...(old.data.messages || []), newMsg],
            },
          };
        });
      }
      qc.invalidateQueries({ queryKey: ['admin-support-tickets'] });
    },
    onError: () => toast.error(t('messages.error')),
  });

  if (isLoading) return <LoadingSkeleton type="table" />;
  if (!ticket) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  const supportStaff = (staffUsers || []).filter((u) =>
    ['SUPER_ADMIN', 'SUPPORT_STAFF'].includes(u.role),
  );

  const creatorName = ticket.patient?.fullName || ticket.doctor?.fullName || ticket.creator?.fullName;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DetailsHeader
        title={ticket.subject}
        subtitle={`${t('support.case')} #${ticket.id}`}
        backPath="/support/tickets"
        badges={[
          { label: t(`status.${ticket.status?.toLowerCase()}`) || ticket.status, className: 'bg-indigo-100 text-indigo-700' },
          { label: ticket.priority, className: ticket.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700' },
          ticket.unreadCount > 0 ? { label: `${ticket.unreadCount} ${t('support.unread')}`, className: 'bg-amber-100 text-amber-800' } : null,
        ].filter(Boolean)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <DetailsSection title={t('support.user')} icon={User}>
            <DetailItem label={t('patients.name')} value={creatorName} />
            <DetailItem label={t('common.role')} value={ticket.creatorRole} />
            <DetailItem label={t('support.category')} value={ticket.category} />
          </DetailsSection>

          <DetailsSection title={t('support.assignment')} icon={Headphones} layout="stack">
            <div className="space-y-2">
              <label className="label">{t('support.assignee')}</label>
              <select
                className="input"
                value={ticket.assignedAdminId || ''}
                onChange={(e) => e.target.value && assignMutation.mutate(Number(e.target.value))}
              >
                <option value="">{t('support.unassigned') || 'Unassigned'}</option>
                {supportStaff.map((u) => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </div>
          </DetailsSection>

          <DetailsSection title={t('common.status')} icon={Clock} layout="stack">
            <div className="space-y-2">
              <label className="label">{t('common.status')}</label>
              <select
                className="input"
                value={ticket.status}
                onChange={(e) => statusMutation.mutate(e.target.value)}
              >
                <option value="OPEN">{t('status.open')}</option>
                <option value="IN_PROGRESS">{t('status.in_progress') || 'In Progress'}</option>
                <option value="RESOLVED">{t('status.resolved')}</option>
                <option value="CLOSED">{t('status.closed')}</option>
              </select>
            </div>
            <DetailItem label={t('common.created_at')} value={new Date(ticket.createdAt).toLocaleString()} />
          </DetailsSection>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {ticket.attachments?.length > 0 && (
            <Card bodyClassName="space-y-2">
              <p className="text-sm font-semibold">{t('support.attachments') || 'Attachments'}</p>
              <ul className="space-y-1 text-sm">
                {ticket.attachments.map((a) => (
                  <li key={a.id}>
                    <a href={`${API_BASE}${a.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                      {a.fileName || a.fileUrl}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <DetailsSection
            title={t('support.conversation')}
            icon={MessageSquare}
            contentClassName="!p-0"
            layout="stack"
          >
            <div className="flex flex-col gap-4 p-6 bg-slate-50 dark:bg-slate-900/50 min-h-[320px] max-h-[480px] overflow-y-auto w-full">
              {ticket.messages?.length > 0 ? (
                ticket.messages.map((msg) => {
                  const isAdmin = ['SUPER_ADMIN', 'SUPPORT_STAFF', 'MEDICAL_ADMIN'].includes(msg.senderRole);
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} w-full`}>
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl shadow-sm border ${
                          isAdmin
                            ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none'
                            : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-color)] rounded-tl-none'
                        }`}
                      >
                        {!isAdmin && (
                          <p className="text-[10px] font-bold opacity-60 uppercase mb-1">{msg.senderName}</p>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        {msg.attachments?.map((a) => (
                          <a
                            key={a.id}
                            href={`${API_BASE}${a.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`block text-xs mt-2 underline ${isAdmin ? 'text-indigo-100' : 'text-indigo-600'}`}
                          >
                            {a.fileName || 'Attachment'}
                          </a>
                        ))}
                        <p className={`text-[10px] mt-2 opacity-60 ${isAdmin ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-[var(--text-muted)]">{t('support.no_messages')}</p>
              )}
            </div>
          </DetailsSection>

          {ticket.status !== 'CLOSED' && (
            <Card bodyClassName="space-y-3">
              <textarea
                className="input min-h-[100px] py-3"
                placeholder={t('support.reply_placeholder') || 'Type your reply...'}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="text-sm" />
              <button
                type="button"
                className="btn btn-primary flex items-center gap-2"
                disabled={!reply.trim() || replyMutation.isPending}
                onClick={() => replyMutation.mutate()}
              >
                <Send size={16} />
                {replyMutation.isPending ? t('common.saving') : t('support.send_reply') || 'Send reply'}
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
