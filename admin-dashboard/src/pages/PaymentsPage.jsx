import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/ui/DataTable';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import { CreditCard, CheckCircle, Clock, XCircle, Wallet } from 'lucide-react';

export default function PaymentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', filter],
    queryFn: () => api.get('/admin/payments', { params: { status: filter || undefined } }).then((r) => r.data),
  });

  const columns = [
    { header: t('payments.transaction_id') || 'Transaction ID', accessorKey: 'transactionId' },
    { header: t('payments.amount') || 'Amount', accessorKey: 'amount', cell: ({ row }) => `${row.original.amount} ر.س` },
    { header: t('payments.method') || 'Method', accessorKey: 'method' },
    { header: t('payments.user') || 'User', accessorKey: 'user.fullName' },
    { 
      header: t('common.status'), 
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variants = { PENDING: 'warning', COMPLETED: 'success', FAILED: 'danger', REFUNDED: 'secondary' };
        return <Badge variant={variants[status]}>{t(`status.${status.toLowerCase()}`) || status}</Badge>;
      }
    },
    { header: t('payments.date') || 'Date', accessorKey: 'createdAt', cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title={t('sidebar.payments')} 
        breadcrumbs={[{ label: t('sidebar.dashboard'), path: '/' }, { label: t('sidebar.payments'), path: '/payments' }]}
        action={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-48 h-10">
            <option value="">{t('common.all_statuses')}</option>
            <option value="PENDING">{t('status.pending')}</option>
            <option value="COMPLETED">{t('status.completed')}</option>
            <option value="FAILED">{t('status.failed')}</option>
          </select>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t('dashboard.stats.total_payments')} value={data?.meta?.totalItems || 0} icon={CreditCard} color="indigo" />
        <StatCard label={t('dashboard.stats.total_revenue')} value="12,450 ر.س" icon={Wallet} color="green" />
        <StatCard label={t('dashboard.stats.completed_payments')} value={150} icon={CheckCircle} color="green" />
        <StatCard label={t('dashboard.stats.failed_payments')} value={5} icon={XCircle} color="red" />
      </div>

      <Card>
        <DataTable 
          columns={columns} 
          data={data?.data} 
          isLoading={isLoading} 
          onView={(item) => navigate(`/payments/${item.id}`)}
        />
      </Card>
    </div>
  );
}
