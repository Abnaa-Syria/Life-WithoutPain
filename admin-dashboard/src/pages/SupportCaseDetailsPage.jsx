import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import DetailsHeader from '../components/ui/DetailsHeader';
import DetailsSection from '../components/ui/DetailsSection';
import DetailItem from '../components/ui/DetailItem';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { Headphones, MessageSquare, User, Clock } from 'lucide-react';

export default function SupportCaseDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: response, isLoading } = useQuery({
    queryKey: ['support-case', id],
    queryFn: () => api.get(`/admin/support-cases/${id}`).then(res => res.data),
  });

  if (isLoading) return <LoadingSkeleton type="table" />;
  const scase = response?.data;

  if (!scase) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DetailsHeader 
        title={scase.subject}
        subtitle={`${t('support.case')} #${scase.id}`}
        backPath="/support-cases"
        badges={[
          ...(scase.status ? [{ status: scase.status }] : []),
          { label: scase.priority, className: scase.priority === 'HIGH' ? 'badge-danger' : 'badge-secondary' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <DetailsSection title={t('appointments.patient')} icon={User}>
            <DetailItem label={t('patients.name')} value={scase.patient?.user?.fullName} />
            <DetailItem label={t('patients.phone')} value={scase.patient?.user?.phone} />
          </DetailsSection>

          <DetailsSection title={t('support.assignment') || 'Assignment'} icon={Headphones}>
            <DetailItem label={t('support.assignee') || 'Assigned Agent'} value={scase.assignee?.fullName || 'Unassigned'} />
          </DetailsSection>

          <DetailsSection title={t('common.audit_info')} icon={Clock}>
            <DetailItem label={t('common.created_at')} value={new Date(scase.createdAt).toLocaleString()} />
            <DetailItem label={t('support.resolved_at') || 'Resolved At'} value={scase.resolvedAt ? new Date(scase.resolvedAt).toLocaleString() : 'N/A'} />
          </DetailsSection>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <DetailsSection
            title={t('support.conversation') || 'Conversation History'}
            icon={MessageSquare}
            contentClassName="!p-0"
            layout="stack"
          >
            <div className="flex flex-col gap-4 p-6 bg-[var(--surface-secondary)] min-h-[400px] w-full">
              {scase.messages?.length > 0 ? scase.messages.map((msg, idx) => {
                const isSystem = msg.sender?.role === 'SYSTEM';
                const isAdmin = ['SUPER_ADMIN', 'SUPPORT_STAFF'].includes(msg.sender?.role);
                
                return (
                  <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} w-full`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm border ${
                      isAdmin 
                        ? 'bg-primary-500 text-white border-primary-400 rounded-tr-none' 
                        : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-color)] rounded-tl-none'
                    }`}>
                      {!isAdmin && <p className="text-[10px] font-bold opacity-60 uppercase mb-1">{msg.sender?.fullName}</p>}
                      <p className="text-sm leading-relaxed">{msg.body}</p>
                      <p className={`text-[10px] mt-2 opacity-60 ${isAdmin ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)]">
                  <MessageSquare size={48} className="opacity-20 mb-4" />
                  <p>{t('support.no_messages') || 'No messages in this case yet'}</p>
                </div>
              )}
            </div>
          </DetailsSection>
        </div>
      </div>
    </div>
  );
}
