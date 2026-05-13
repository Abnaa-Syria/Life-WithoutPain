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
import { History, User, Database, Clock } from 'lucide-react';

export default function AuditLogDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: response, isLoading } = useQuery({
    queryKey: ['audit-log', id],
    queryFn: () => api.get(`/admin/audit-logs/${id}`).then(res => res.data),
  });

  if (isLoading) return <LoadingSkeleton type="table" />;
  const log = response?.data;

  if (!log) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DetailsHeader 
        title={`${t('sidebar.audit_logs')} #${log.id}`}
        subtitle={`${log.action} on ${log.entityType}`}
        backPath="/audit-logs"
        badges={[{ label: log.action, className: 'bg-indigo-100 text-indigo-700' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailsSection title={t('audit.actor') || 'Actor Information'} icon={User}>
          <DetailItem label={t('users.full_name')} value={log.actor?.fullName} />
          <DetailItem label={t('users.email')} value={log.actor?.email} />
          <DetailItem label={t('users.role')} value={log.actor?.role} />
        </DetailsSection>

        <DetailsSection title={t('audit.metadata') || 'Event Metadata'} icon={History}>
          <DetailItem label={t('audit.entity_type') || 'Entity Type'} value={log.entityType} />
          <DetailItem label={t('audit.entity_id') || 'Entity ID'} value={log.entityId} />
          <DetailItem label={t('audit.action')} value={log.action} />
          <DetailItem label={t('common.date')} value={new Date(log.createdAt).toLocaleString()} />
        </DetailsSection>

        <DetailsSection title={t('audit.details')} icon={Database} className="lg:col-span-2">
          <div className="col-span-full">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('audit.payload') || 'Data Changes'}</p>
            <pre className="p-6 bg-slate-900 text-slate-100 rounded-2xl overflow-auto text-xs leading-relaxed border border-slate-800">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        </DetailsSection>
      </div>
    </div>
  );
}
