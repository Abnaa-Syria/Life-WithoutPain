import React, { useState } from 'react';
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
import { Headphones, MessageCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import useConfirmDelete from '../hooks/useConfirmDelete';
import toast from 'react-hot-toast';

export default function SupportCasesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirmDelete = useConfirmDelete();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [filter, setFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-support-cases', filter],
    queryFn: () => api.get('/admin/support-cases', { params: { status: filter || undefined } }).then((r) => r.data),
  });

  const { register, handleSubmit, setValue } = useForm();

  const updateMutation = useMutation({
    mutationFn: (payload) => api.patch(`/admin/support-cases/${editingCase.id}`, payload),
    onSuccess: () => {
      toast.success(t('messages.saved'));
      setIsModalOpen(false);
      qc.invalidateQueries(['admin-support-cases']);
    },
  });

  const openEdit = (item) => {
    setEditingCase(item);
    setValue('status', item.status);
    setValue('adminNotes', item.adminNotes || '');
    setIsModalOpen(true);
  };

  const columns = [
    { header: t('support.subject') || 'Subject', accessorKey: 'subject' },
    { header: t('support.user') || 'User', accessorKey: 'user.fullName' },
    {
      header: t('support.priority') || 'Priority',
      accessorKey: 'priority',
      cell: ({ row }) => (
        <Badge variant={row.original.priority === 'HIGH' ? 'danger' : 'secondary'}>
          {row.original.priority}
        </Badge>
      ),
      meta: { exportValue: (row) => row.priority },
    },
    {
      header: t('common.status'),
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variants = { OPEN: 'primary', PENDING: 'warning', RESOLVED: 'success', CLOSED: 'secondary' };
        return <Badge variant={variants[status]}>{t(`status.${status.toLowerCase()}`) || status}</Badge>;
      },
      meta: {
        exportValue: (row) => t(`status.${row.status?.toLowerCase()}`) || row.status,
      },
    },
    {
      header: t('support.date') || 'Created At',
      accessorKey: 'createdAt',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
      meta: { exportValue: (row) => new Date(row.createdAt).toLocaleDateString() },
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title={t('sidebar.support_cases')} 
        breadcrumbs={[{ label: t('sidebar.dashboard'), path: '/' }, { label: t('sidebar.support_cases'), path: '/support-cases' }]}
        action={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-48 h-10">
            <option value="">{t('common.all_statuses')}</option>
            <option value="OPEN">{t('status.open')}</option>
            <option value="PENDING">{t('status.pending')}</option>
            <option value="RESOLVED">{t('status.resolved')}</option>
          </select>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t('dashboard.stats.open_support_cases')} value={data?.meta?.totalItems || 0} icon={Headphones} color="indigo" />
        <StatCard label={t('dashboard.stats.pending_support')} value={2} icon={Clock} color="yellow" />
        <StatCard label={t('dashboard.stats.resolved_today')} value={10} icon={CheckCircle} color="green" />
        <StatCard label={t('dashboard.stats.high_priority')} value={4} icon={AlertTriangle} color="red" />
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={data?.data}
          isLoading={isLoading}
          exportFileName="support-cases"
          onView={(item) => navigate(`/support-cases/${item.id}`)}
          onEdit={openEdit}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('support.update_case') || 'Update Support Case'}
      >
        <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="label">{t('common.status')}</label>
              <select {...register('status')} className="input">
                <option value="OPEN">{t('status.open')}</option>
                <option value="PENDING">{t('status.pending')}</option>
                <option value="RESOLVED">{t('status.resolved')}</option>
                <option value="CLOSED">{t('status.closed')}</option>
              </select>
            </div>
            <div>
              <label className="label">{t('support.admin_notes') || 'Admin Response'}</label>
              <textarea {...register('adminNotes')} className="input h-48 py-3" />
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
