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
import { Shield, User, FileText, CheckCircle } from 'lucide-react';

export default function InsuranceCaseDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: response, isLoading } = useQuery({
    queryKey: ['insurance-case', id],
    queryFn: () => api.get(`/admin/insurance-cases/${id}`).then(res => res.data),
  });

  if (isLoading) return <LoadingSkeleton type="table" />;
  const icase = response?.data;

  if (!icase) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DetailsHeader 
        title={`${t('sidebar.insurance_cases')} #${icase.id}`}
        subtitle={icase.caseType}
        backPath="/insurance-cases"
        badges={[{ label: t(`status.${icase.status?.toLowerCase()}`), className: 'bg-indigo-100 text-indigo-700' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailsSection title={t('insurance.provider')} icon={Shield}>
          <DetailItem label={t('insurance.name')} value={icase.provider?.nameAr} />
          <DetailItem label={t('insurance.code')} value={icase.provider?.code} />
        </DetailsSection>

        <DetailsSection title={t('appointments.patient')} icon={User}>
          <DetailItem label={t('patients.name')} value={icase.patient?.user?.fullName} />
          <DetailItem label={t('patients.phone')} value={icase.patient?.user?.phone} />
        </DetailsSection>

        <DetailsSection title={t('insurance.case_details') || 'Case Details'} icon={FileText}>
          <DetailItem label={t('insurance.case_type')} value={icase.caseType} />
          <DetailItem label={t('common.status')} value={icase.status} />
          <DetailItem 
            label={t('insurance.submitted_at') || 'Submitted At'} 
            value={icase.submittedAt || icase.createdAt ? new Date(icase.submittedAt || icase.createdAt).toLocaleString() : '-'} 
          />
          <DetailItem label={t('common.notes')} value={icase.notes || 'No notes'} fullWidth />
        </DetailsSection>

        <DetailsSection title={t('insurance.approvals') || 'Approvals & History'} icon={CheckCircle}>
          {icase.approvals?.map((app, idx) => (
            <div key={idx} className="col-span-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-color)] space-y-2">
              <div className="flex justify-between">
                <span className="font-bold">{app.status}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {app.createdAt ? new Date(app.createdAt).toLocaleString() : '-'}
                </span>
              </div>
              <p className="text-sm">{app.notes}</p>
            </div>
          )) || <div className="col-span-full text-center text-[var(--text-muted)] py-4">{t('common.no_data')}</div>}
        </DetailsSection>
      </div>
    </div>
  );
}
