import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import DataTable from '../components/ui/DataTable';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { canAccess, ROUTE_PERMISSIONS as P } from '../auth/permissions';
import { Shield, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InsuranceCasesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { permissions, role } = useAuth();
  const canDecide = canAccess({ permissions, role }, { permission: P.insuranceDecide, roles: ['INSURANCE_STAFF', 'SUPER_ADMIN'] });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [filter, setFilter] = useState('');

  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-insurance-cases', filter],
    queryFn: () => api.get('/admin/insurance-cases', { params: { status: filter || undefined, limit: 100 } }).then((r) => r.data),
  });

  const { register, handleSubmit, setValue } = useForm();

  const list = data?.data || [];
  const underReviewCount = useMemo(
    () => list.filter((c) => c.status === 'UNDER_REVIEW' || c.status === 'OPEN').length,
    [list],
  );

  const updateMutation = useMutation({
    mutationFn: (payload) => api.put(`/admin/insurance-cases/${editingCase.id}`, payload),
    onSuccess: () => {
      toast.success(t('messages.saved'));
      setIsModalOpen(false);
      qc.invalidateQueries(['admin-insurance-cases']);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (item) =>
      api.patch(`/admin/insurance-cases/${item.id}/approve`, {
        notes: t('insurance.quick_approve_note'),
        approvalData: {
          approvedAmount: item.approvals?.[0]?.requestedAmount ?? item.requestedAmount,
          approvalStatus: 'APPROVED',
        },
      }),
    onSuccess: () => {
      toast.success(t('messages.approved'));
      qc.invalidateQueries(['admin-insurance-cases']);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/insurance-cases/${id}/reject`, { notes: t('insurance.quick_reject_note') }),
    onSuccess: () => {
      toast.success(t('messages.rejected'));
      qc.invalidateQueries(['admin-insurance-cases']);
    },
  });

  const openEdit = (item) => {
    setEditingCase(item);
    setValue('status', item.status);
    setValue('notes', item.notes || '');
    setIsModalOpen(true);
  };

  const columns = [
    { header: t('insurance.patient'), accessorKey: 'patient.user.fullName' },
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
    { header: t('insurance.case_type'), accessorKey: 'caseType' },
    {
      header: t('common.status'),
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variants = {
          OPEN: 'primary',
          UNDER_REVIEW: 'warning',
          APPROVED: 'success',
          REJECTED: 'danger',
          CLOSED: 'secondary',
          ESCALATED: 'danger',
          MORE_INFO_REQUESTED: 'warning',
        };
        return <Badge variant={variants[status]}>{t(`status.${status.toLowerCase()}`) || status}</Badge>;
      },
    },
    {
      header: t('insurance.amounts'),
      cell: ({ row }) => {
        const a = row.original.approvals?.[0];
        const req = row.original.requestedAmount ?? a?.requestedAmount;
        const app = a?.approvedAmount;
        return `${req ?? '—'} / ${app ?? '—'}`;
      },
    },
    {
      header: t('insurance.date'),
      accessorKey: 'submittedAt',
      cell: ({ row }) => new Date(row.original.submittedAt || row.original.createdAt).toLocaleDateString(),
    },
  ];

  const renderActions = (item) =>
    canDecide &&
    (item.status === 'OPEN' || item.status === 'UNDER_REVIEW' || item.status === 'MORE_INFO_REQUESTED') && (
      <div className="flex gap-1 border-r border-[var(--border-color)] mr-2 pr-2 rtl:mr-0 rtl:ml-2 rtl:pr-0 rtl:pl-2 rtl:border-r-0 rtl:border-l">
        <button
          type="button"
          onClick={() => approveMutation.mutate(item)}
          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
        >
          <CheckCircle size={16} />
        </button>
        <button
          type="button"
          onClick={() => rejectMutation.mutate(item.id)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <XCircle size={16} />
        </button>
      </div>
    );

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('sidebar.insurance_cases')}
        breadcrumbs={[
          { label: t('sidebar.dashboard'), path: '/' },
          { label: t('sidebar.insurance_cases'), path: '/insurance-cases' },
        ]}
        action={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-48 h-10">
            <option value="">{t('common.all_statuses')}</option>
            <option value="OPEN">{t('status.open')}</option>
            <option value="UNDER_REVIEW">{t('status.under_review')}</option>
            <option value="MORE_INFO_REQUESTED">{t('status.more_info_requested')}</option>
            <option value="APPROVED">{t('status.approved')}</option>
            <option value="REJECTED">{t('status.rejected')}</option>
            <option value="ESCALATED">{t('status.escalated')}</option>
          </select>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label={t('dashboard.stats.open_insurance_cases')}
          value={dashboardStats?.openInsuranceCases ?? data?.meta?.totalItems ?? 0}
          icon={Shield}
          color="indigo"
        />
        <StatCard label={t('dashboard.stats.under_review')} value={underReviewCount} icon={Clock} color="yellow" />
        <StatCard
          label={t('dashboard.stats.approved_today')}
          value={dashboardStats?.insuranceApprovedToday ?? 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label={t('dashboard.stats.escalated_cases')}
          value={list.filter((c) => c.status === 'ESCALATED').length}
          icon={AlertCircle}
          color="red"
        />
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={list}
          isLoading={isLoading}
          onView={(item) => navigate(`/insurance-cases/${item.id}`)}
          onEdit={openEdit}
          renderCustomActions={renderActions}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('insurance.edit_case')}
      >
        <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="label">{t('common.status')}</label>
              <select {...register('status')} className="input">
                <option value="OPEN">{t('status.open')}</option>
                <option value="UNDER_REVIEW">{t('status.under_review')}</option>
                <option value="APPROVED">{t('status.approved')}</option>
                <option value="REJECTED">{t('status.rejected')}</option>
                <option value="ESCALATED">{t('status.escalated')}</option>
                <option value="CLOSED">{t('status.closed')}</option>
              </select>
            </div>
            <div>
              <label className="label">{t('common.notes')}</label>
              <textarea {...register('notes')} className="input h-32 py-3" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={updateMutation.isPending} className="btn btn-primary flex-1">
              {updateMutation.isPending ? t('common.saving') : t('common.save')}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
