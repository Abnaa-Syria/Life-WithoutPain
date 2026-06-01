import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { canAccess, ROUTE_PERMISSIONS as P } from '../auth/permissions';
import DetailsHeader from '../components/ui/DetailsHeader';
import DetailsSection from '../components/ui/DetailsSection';
import DetailItem from '../components/ui/DetailItem';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Badge from '../components/ui/Badge';
import { Shield, User, FileText, CheckCircle, Calendar, Home } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InsuranceCaseDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const qc = useQueryClient();
  const { permissions, role } = useAuth();
  const canDecide = canAccess({ permissions, role }, { permission: P.insuranceDecide, roles: ['INSURANCE_STAFF', 'SUPER_ADMIN'] });

  const [approvedAmount, setApprovedAmount] = useState('');
  const [notes, setNotes] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['insurance-case', id],
    queryFn: () => api.get(`/admin/insurance-cases/${id}`).then((res) => res.data),
  });

  const icase = response?.data;
  const pendingApproval = icase?.approvals?.find((a) => a.approvalStatus === 'PENDING') || icase?.approvals?.[0];

  React.useEffect(() => {
    if (pendingApproval?.approvedAmount != null) {
      setApprovedAmount(String(pendingApproval.approvedAmount));
    } else if (icase?.requestedAmount != null) {
      setApprovedAmount(String(icase.requestedAmount));
    }
  }, [icase?.id, pendingApproval?.approvedAmount, icase?.requestedAmount]);

  const invalidate = () => {
    qc.invalidateQueries(['insurance-case', id]);
    qc.invalidateQueries(['admin-insurance-cases']);
  };

  const approveMutation = useMutation({
    mutationFn: () =>
      api.patch(`/admin/insurance-cases/${id}/approve`, {
        notes: notes || undefined,
        approvalData: {
          procedure: pendingApproval?.requestedProcedure,
          requestedAmount: pendingApproval?.requestedAmount ?? icase?.requestedAmount,
          approvedAmount: parseFloat(approvedAmount) || undefined,
          approvalStatus: 'APPROVED',
        },
      }),
    onSuccess: () => { toast.success(t('messages.approved')); invalidate(); },
  });

  const rejectMutation = useMutation({
    mutationFn: () => api.patch(`/admin/insurance-cases/${id}/reject`, { notes: notes || t('insurance.rejected_default') }),
    onSuccess: () => { toast.success(t('messages.rejected')); invalidate(); },
  });

  const requestInfoMutation = useMutation({
    mutationFn: () => api.patch(`/admin/insurance-cases/${id}/request-info`, { notes }),
    onSuccess: () => { toast.success(t('messages.saved')); invalidate(); },
  });

  const updatePriceMutation = useMutation({
    mutationFn: () =>
      api.patch(`/admin/insurance-cases/${id}/approval`, {
        notes,
        approvalData: {
          approvedAmount: parseFloat(approvedAmount),
          approvalStatus: 'PARTIALLY_APPROVED',
        },
      }),
    onSuccess: () => { toast.success(t('messages.saved')); invalidate(); },
  });

  if (isLoading) return <LoadingSkeleton type="table" />;
  if (!icase) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  const isPending = ['OPEN', 'UNDER_REVIEW', 'MORE_INFO_REQUESTED'].includes(icase.status);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DetailsHeader
        title={`${t('sidebar.insurance_cases')} #${icase.id}`}
        subtitle={icase.caseType}
        backPath="/insurance-cases"
        badges={[
          {
            label: t(`status.${icase.status?.toLowerCase()}`) || icase.status,
            className: 'bg-primary-100 text-primary-700',
          },
        ]}
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

        <DetailsSection title={t('patients.insurance_info')} icon={Shield}>
          {(icase.patient?.insurances || []).map((ins) => (
            <div key={ins.id} className="col-span-full text-sm space-y-1 border-b border-[var(--border-color)] pb-2 last:border-0">
              <div className="font-medium">{ins.provider?.nameAr}</div>
              <div className="text-[var(--text-muted)]">
                {ins.policyNumber || ins.memberId} — {ins.verificationStatus}
                {ins.isPrimary ? ` (${t('insurance.primary')})` : ''}
              </div>
            </div>
          ))}
          {icase.patientInsurance && (
            <DetailItem
              label={t('insurance.policy_used')}
              value={`${icase.patientInsurance.provider?.nameAr} — ${icase.patientInsurance.policyNumber || icase.patientInsurance.memberId}`}
              fullWidth
            />
          )}
        </DetailsSection>

        <DetailsSection
          title={icase.appointmentId ? t('insurance.linked_appointment') : t('insurance.linked_home_service')}
          icon={icase.appointmentId ? Calendar : Home}
        >
          {icase.appointment ? (
            <>
              <DetailItem label={t('appointments.date')} value={new Date(icase.appointment.appointmentDate).toLocaleDateString()} />
              <DetailItem label={t('appointments.time')} value={`${icase.appointment.startTime} - ${icase.appointment.endTime}`} />
              <DetailItem label={t('insurance.requested_amount')} value={icase.appointment.amount} />
              <DetailItem label={t('insurance.doctor')} value={icase.appointment.doctor?.user?.fullName} />
            </>
          ) : icase.homeServiceRequest ? (
            <>
              <DetailItem label={t('insurance.service')} value={icase.homeServiceRequest.service?.nameAr} />
              <DetailItem label={t('insurance.visit_address')} value={icase.homeServiceRequest.visitAddress} fullWidth />
              <DetailItem
                label={t('insurance.preferred_date')}
                value={new Date(icase.homeServiceRequest.preferredDate).toLocaleDateString()}
              />
            </>
          ) : (
            <DetailItem label="—" value={t('common.no_data')} />
          )}
          <DetailItem label={t('insurance.requested_amount')} value={icase.requestedAmount ?? pendingApproval?.requestedAmount} />
        </DetailsSection>

        <DetailsSection title={t('insurance.case_details')} icon={FileText}>
          <DetailItem label={t('insurance.case_type')} value={icase.caseType} />
          <DetailItem label={t('common.status')} value={icase.status} />
          <DetailItem
            label={t('insurance.submitted_at')}
            value={icase.submittedAt ? new Date(icase.submittedAt).toLocaleString() : '-'}
          />
          <DetailItem label={t('common.notes')} value={icase.notes || '—'} fullWidth />
        </DetailsSection>

        <DetailsSection title={t('insurance.approvals')} icon={CheckCircle}>
          {icase.approvals?.map((app) => (
            <div key={app.id} className="col-span-full p-4 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-color)] space-y-2">
              <div className="flex justify-between">
                <span className="font-bold">{app.approvalStatus}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {app.decidedAt ? new Date(app.decidedAt).toLocaleString() : '-'}
                </span>
              </div>
              <p className="text-sm">{app.requestedProcedure}</p>
              <p className="text-sm text-[var(--text-muted)]">
                {t('insurance.requested_amount')}: {app.requestedAmount ?? '—'} / {t('insurance.approved_amount')}: {app.approvedAmount ?? '—'}
              </p>
              {app.decisionNotes && <p className="text-sm">{app.decisionNotes}</p>}
            </div>
          )) || <div className="col-span-full text-center text-[var(--text-muted)] py-4">{t('common.no_data')}</div>}
        </DetailsSection>
      </div>

      {canDecide && isPending && (
        <DetailsSection title={t('insurance.decision_panel')} icon={CheckCircle}>
          <div className="col-span-full space-y-4">
            <div>
              <label className="label">{t('insurance.approved_amount')}</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="label">{t('common.notes')}</label>
              <textarea className="input h-24 py-3" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn btn-primary"
                disabled={approveMutation.isPending}
                onClick={() => approveMutation.mutate()}
              >
                {t('common.approve')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={updatePriceMutation.isPending}
                onClick={() => updatePriceMutation.mutate()}
              >
                {t('insurance.update_price')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={requestInfoMutation.isPending}
                onClick={() => requestInfoMutation.mutate()}
              >
                {t('insurance.request_info')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={rejectMutation.isPending}
                onClick={() => rejectMutation.mutate()}
              >
                {t('common.reject')}
              </button>
            </div>
          </div>
        </DetailsSection>
      )}
    </div>
  );
}
