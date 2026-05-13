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
import { Shield, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import useConfirmDelete from '../hooks/useConfirmDelete';
import toast from 'react-hot-toast';

export default function InsuranceCasesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirmDelete = useConfirmDelete();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [filter, setFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-insurance-cases', filter],
    queryFn: () => api.get('/admin/insurance-cases', { params: { status: filter || undefined } }).then((r) => r.data),
  });

  const { register, handleSubmit, setValue } = useForm();

  const updateMutation = useMutation({
    mutationFn: (payload) => api.put(`/admin/insurance-cases/${editingCase.id}`, payload),
    onSuccess: () => {
      toast.success(t('messages.saved'));
      setIsModalOpen(false);
      qc.invalidateQueries(['admin-insurance-cases']);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/insurance-cases/${id}/approve`, { notes: 'Approved by admin' }),
    onSuccess: () => { toast.success(t('messages.approved')); qc.invalidateQueries(['admin-insurance-cases']); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => api.patch(`/insurance-cases/${id}/reject`, { notes: 'Rejected by admin' }),
    onSuccess: () => { toast.success(t('messages.rejected')); qc.invalidateQueries(['admin-insurance-cases']); },
  });

  const openEdit = (item) => {
    setEditingCase(item);
    setValue('status', item.status);
    setValue('notes', item.notes || '');
    setIsModalOpen(true);
  };

  const columns = [
    { header: t('insurance.patient') || 'Patient', accessorKey: 'patient.user.fullName' },
    { header: t('insurance.provider') || 'Provider', accessorKey: 'provider.nameAr' },
    { header: t('insurance.case_type') || 'Case Type', accessorKey: 'caseType' },
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
          ESCALATED: 'danger'
        };
        return <Badge variant={variants[status]}>{t(`status.${status.toLowerCase()}`) || status}</Badge>;
      }
    },
    { 
      header: t('insurance.date') || 'Date', 
      accessorKey: 'submittedAt',
      cell: ({ row }) => new Date(row.original.submittedAt || row.original.createdAt).toLocaleDateString()
    },
  ];

  const renderActions = (item) => (
    (item.status === 'OPEN' || item.status === 'UNDER_REVIEW') && (
      <div className="flex gap-1 border-r border-[var(--border-color)] mr-2 pr-2 rtl:mr-0 rtl:ml-2 rtl:pr-0 rtl:pl-2 rtl:border-r-0 rtl:border-l">
        <button onClick={() => approveMutation.mutate(item.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
          <CheckCircle size={16} />
        </button>
        <button onClick={() => rejectMutation.mutate(item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
          <XCircle size={16} />
        </button>
      </div>
    )
  );

  return (
    <div className="space-y-8">
      <PageHeader 
        title={t('sidebar.insurance_cases')} 
        breadcrumbs={[{ label: t('sidebar.dashboard'), path: '/' }, { label: t('sidebar.insurance_cases'), path: '/insurance-cases' }]}
        action={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-48 h-10">
            <option value="">{t('common.all_statuses')}</option>
            <option value="OPEN">{t('status.open')}</option>
            <option value="UNDER_REVIEW">{t('status.under_review')}</option>
            <option value="APPROVED">{t('status.approved')}</option>
            <option value="REJECTED">{t('status.rejected')}</option>
          </select>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t('dashboard.stats.open_insurance_cases')} value={data?.meta?.totalItems || 0} icon={Shield} color="indigo" />
        <StatCard label={t('dashboard.stats.under_review')} value={3} icon={Clock} color="yellow" />
        <StatCard label={t('dashboard.stats.approved_today')} value={5} icon={CheckCircle} color="green" />
        <StatCard label={t('dashboard.stats.escalated_cases')} value={1} icon={AlertCircle} color="red" />
      </div>

      <Card>
        <DataTable 
          columns={columns} 
          data={data?.data} 
          isLoading={isLoading} 
          onView={(item) => navigate(`/insurance-cases/${item.id}`)}
          onEdit={openEdit}
          renderCustomActions={renderActions}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('insurance.edit_case') || 'Update Insurance Case'}
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
