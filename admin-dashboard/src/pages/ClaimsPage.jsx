import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/ui/DataTable';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import { FileText, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatCurrency';

export default function ClaimsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-claims', filter],
    queryFn: () => api.get('/admin/claims', { params: { status: filter || undefined } }).then((r) => r.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/claims/${id}/status`, { status }),
    onSuccess: () => {
      toast.success(t('messages.status_updated'));
      qc.invalidateQueries(['admin-claims']);
    },
  });

  const columns = [
    { header: t('claims.id'), accessorKey: 'id' },
    { header: t('claims.provider'), accessorKey: 'claimBatch.provider.nameAr' },
    {
      header: t('claims.amount'),
      accessorKey: 'amount',
      cell: ({ row }) => formatCurrency(row.original.amount, t),
      meta: { exportValue: (row) => formatCurrency(row.amount, t) },
    },
    { header: t('claims.patient'), accessorKey: 'appointment.patient.user.fullName' },
    { 
      header: t('common.status'), 
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variants = { PENDING: 'warning', SUBMITTED: 'primary', PAID: 'success', REJECTED: 'danger', DISPUTED: 'danger' };
        return <Badge variant={variants[status]}>{t(`status.${status.toLowerCase()}`) || status}</Badge>;
      },
      meta: {
        exportValue: (row) => t(`status.${row.status?.toLowerCase()}`) || row.status,
      },
    },
    {
      header: t('claims.date') || 'Submitted At',
      accessorKey: 'createdAt',
      cell: ({ row }) =>
        row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-',
      meta: {
        exportValue: (row) =>
          row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—',
      },
    },
  ];

  const renderActions = (claim) => (
    <div className="flex gap-1 border-r border-[var(--border-color)] mr-2 pr-2 rtl:mr-0 rtl:ml-2 rtl:pr-0 rtl:pl-2 rtl:border-r-0 rtl:border-l">
      {claim.status === 'PENDING' && (
        <button 
          onClick={() => updateStatusMutation.mutate({ id: claim.id, status: 'SUBMITTED' })} 
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title={t('common.submit')}
        >
          <TrendingUp size={16} />
        </button>
      )}
      {claim.status === 'SUBMITTED' && (
        <button 
          onClick={() => updateStatusMutation.mutate({ id: claim.id, status: 'PAID' })} 
          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
          title={t('common.mark_paid')}
        >
          <CheckCircle size={16} />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <PageHeader 
        title={t('sidebar.claims')} 
        breadcrumbs={[{ label: t('sidebar.dashboard'), path: '/' }, { label: t('sidebar.claims'), path: '/claims' }]}
        action={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-48 h-10">
            <option value="">{t('common.all_statuses')}</option>
            <option value="PENDING">{t('status.pending')}</option>
            <option value="SUBMITTED">{t('status.submitted')}</option>
            <option value="PAID">{t('status.paid')}</option>
          </select>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t('dashboard.stats.total_claims')} value={data?.meta?.totalItems || 0} icon={FileText} color="indigo" />
        <StatCard label={t('dashboard.stats.pending_claims')} value={4} icon={Clock} color="yellow" />
        <StatCard label={t('dashboard.stats.submitted_claims')} value={12} icon={TrendingUp} color="blue" />
        <StatCard label={t('dashboard.stats.paid_claims')} value={45} icon={CheckCircle} color="green" />
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={data?.data}
          isLoading={isLoading}
          exportFileName="claims"
          onView={(item) => navigate(`/claims/${item.id}`)}
          renderCustomActions={renderActions}
        />
      </Card>
    </div>
  );
}
