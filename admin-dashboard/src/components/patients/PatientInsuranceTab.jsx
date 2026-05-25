import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { canAccess } from '../../auth/permissions';
import { ROUTE_PERMISSIONS as P } from '../../auth/permissions';
import DetailsSection from '../ui/DetailsSection';
import DetailItem from '../ui/DetailItem';
import Badge from '../ui/Badge';
import DataTable from '../ui/DataTable';
import { Shield, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import FilePreviewer from '../ui/FilePreviewer';

export default function PatientInsuranceTab({ patientId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { permissions, role } = useAuth();

  const canVerify = canAccess({ permissions, role }, { permission: P.patientsInsuranceVerify });
  const canReadCases = canAccess({ permissions, role }, { permission: P.insurance });

  const { data: insurancesRes, isLoading: loadingInsurances } = useQuery({
    queryKey: ['patient-insurances', patientId],
    queryFn: () => api.get(`/admin/patients/${patientId}/insurances`).then((r) => r.data),
    enabled: !!patientId,
  });

  const { data: casesRes, isLoading: loadingCases } = useQuery({
    queryKey: ['patient-insurance-cases', patientId],
    queryFn: () => api.get('/admin/insurance-cases', { params: { patientId, limit: 50 } }).then((r) => r.data),
    enabled: !!patientId && canReadCases,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ insuranceId, verificationStatus }) =>
      api.patch(`/admin/patients/${patientId}/insurances/${insuranceId}/verify`, { verificationStatus }),
    onSuccess: () => {
      toast.success(t('messages.saved'));
      qc.invalidateQueries(['patient-insurances', patientId]);
      qc.invalidateQueries(['patient', patientId]);
    },
  });

  const insurances = insurancesRes?.data || [];
  const cases = casesRes?.data || [];

  const caseColumns = [
    { header: '#', accessorKey: 'id' },
    { header: t('insurance.provider'), accessorKey: 'provider.nameAr' },
    {
      header: t('insurance.request_source'),
      cell: ({ row }) =>
        row.original.appointmentId
          ? t('insurance.source_appointment')
          : row.original.homeServiceRequestId
            ? t('insurance.source_home_service')
            : '—',
    },
    {
      header: t('common.status'),
      accessorKey: 'status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'APPROVED' ? 'success' : row.original.status === 'REJECTED' ? 'danger' : 'warning'}>
          {t(`status.${row.original.status?.toLowerCase()}`) || row.original.status}
        </Badge>
      ),
    },
    {
      header: t('insurance.approved_amount'),
      cell: ({ row }) => row.original.approvals?.[0]?.approvedAmount ?? '—',
    },
  ];

  if (loadingInsurances) {
    return <div className="p-8 text-center text-[var(--text-muted)]">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <DetailsSection title={t('patients.insurance_info')} icon={Shield}>
        {insurances.length === 0 ? (
          <p className="col-span-full text-center text-[var(--text-muted)] py-6">{t('common.no_data')}</p>
        ) : (
          insurances.map((ins) => (
            <div
              key={ins.id}
              className="col-span-full p-4 rounded-xl border border-[var(--border-color)] bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{ins.provider?.nameAr || ins.provider?.nameEn}</span>
                <Badge variant={ins.verificationStatus === 'VERIFIED' ? 'success' : ins.verificationStatus === 'REJECTED' ? 'danger' : 'warning'}>
                  {ins.verificationStatus}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailItem label={t('insurance.policy_number')} value={ins.policyNumber || ins.memberId} />
                <DetailItem label={t('insurance.expiry_date')} value={ins.expiryDate ? new Date(ins.expiryDate).toLocaleDateString() : '—'} />
                <DetailItem label={t('insurance.member_id')} value={ins.memberId} />
                <DetailItem label={t('insurance.primary')} value={ins.isPrimary ? t('common.yes') : t('common.no')} />
              </div>
              {ins.attachmentUrl && (
                <FilePreviewer url={ins.attachmentUrl} title={t('insurance.card_image')} />
              )}
              {canVerify && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {['VERIFIED', 'PENDING', 'REJECTED', 'EXPIRED'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={verifyMutation.isPending || ins.verificationStatus === status}
                      onClick={() => verifyMutation.mutate({ insuranceId: ins.id, verificationStatus: status })}
                      className="btn btn-secondary text-xs py-1 px-3"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </DetailsSection>

      {canReadCases && (
        <DetailsSection title={t('insurance.requests')} icon={FileText}>
          <div className="col-span-full">
            <DataTable
              columns={caseColumns}
              data={cases}
              isLoading={loadingCases}
              onView={(item) => navigate(`/insurance-cases/${item.id}`)}
            />
          </div>
        </DetailsSection>
      )}
    </div>
  );
}
