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
import { Stethoscope, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import useConfirmDelete from '../hooks/useConfirmDelete';
import toast from 'react-hot-toast';
import { executeBulkDelete } from '../utils/bulkDelete';

export default function DoctorsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirmDelete = useConfirmDelete();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [filter, setFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-doctors', filter],
    queryFn: () => api.get('/admin/doctors', { params: { verificationStatus: filter || undefined } }).then((r) => r.data),
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const updateMutation = useMutation({
    mutationFn: (payload) => api.put(`/admin/doctors/${editingDoctor.id}`, payload),
    onSuccess: () => {
      toast.success(t('messages.saved'));
      setIsModalOpen(false);
      qc.invalidateQueries(['admin-doctors']);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/doctors/${id}/approve`),
    onSuccess: () => { toast.success(t('messages.approved')); qc.invalidateQueries(['admin-doctors']); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/doctors/${id}/reject`, { reason: 'Documents insufficient' }),
    onSuccess: () => { toast.success(t('messages.rejected')); qc.invalidateQueries(['admin-doctors']); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/doctors/${id}`),
    onSuccess: () => { toast.success(t('messages.deleted')); qc.invalidateQueries(['admin-doctors']); },
  });

  const openEdit = (doctor) => {
    setEditingDoctor(doctor);
    setValue('title', doctor.title);
    setValue('licenseNumber', doctor.licenseNumber);
    setValue('bio', doctor.bio);
    setValue('city', doctor.city);
    setValue('consultationFee', doctor.consultationFee);
    setValue('followUpFee', doctor.followUpFee);
    setValue('isPubliclyBookable', doctor.isPubliclyBookable);
    setValue('isAvailable', doctor.isAvailable);
    setIsModalOpen(true);
  };

  const columns = [
    { header: t('doctors.name') || 'Name', accessorKey: 'user.fullName' },
    { header: t('doctors.speciality') || 'Speciality', accessorKey: 'speciality.nameAr' },
    { header: t('doctors.license_number') || 'License No.', accessorKey: 'licenseNumber' },
    { header: t('doctors.city') || 'City', accessorKey: 'city' }, 
    {
      header: t('doctors.fee') || 'Fee',
      accessorKey: 'consultationFee',
      cell: ({ row }) => `${row.original.consultationFee} ر.س`,
      meta: { exportValue: (row) => `${row.consultationFee ?? '—'} ر.س` },
    },
    {
      header: t('doctors.rating') || 'Rating',
      accessorKey: 'ratingAverage',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold">{row.original.ratingAverage?.toFixed(1) || 0}</span>
          <span className="text-xs text-[var(--text-muted)]">({row.original.ratingCount || 0})</span>
        </div>
      ),
      meta: {
        exportValue: (row) =>
          `${row.ratingAverage?.toFixed(1) || 0} (${row.ratingCount || 0})`,
      },
    },
    {
      header: t('common.status'),
      accessorKey: 'verificationStatus',
      cell: ({ row }) => {
        const status = row.original.verificationStatus;
        const variants = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };
        return <Badge variant={variants[status]}>{t(`status.${status.toLowerCase()}`) || status}</Badge>;
      },
      meta: {
        exportValue: (row) =>
          t(`status.${row.verificationStatus?.toLowerCase()}`) || row.verificationStatus,
      },
    },
  ];

  const renderActions = (doctor) => (
    doctor.verificationStatus === 'PENDING' && (
      <div className="flex gap-1 border-r border-[var(--border-color)] mr-2 pr-2 rtl:mr-0 rtl:ml-2 rtl:pr-0 rtl:pl-2 rtl:border-r-0 rtl:border-l">
        <button onClick={() => approveMutation.mutate(doctor.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title={t('common.approve')}>
          <CheckCircle size={16} />
        </button>
        <button onClick={() => rejectMutation.mutate(doctor.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title={t('common.reject')}>
          <XCircle size={16} />
        </button>
      </div>
    )
  );

  return (
    <div className="space-y-8">
      <PageHeader 
        title={t('sidebar.doctors')} 
        breadcrumbs={[{ label: t('sidebar.dashboard'), path: '/' }, { label: t('sidebar.doctors'), path: '/doctors' }]}
        action={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-48 h-10">
            <option value="">{t('common.all_statuses')}</option>
            <option value="PENDING">{t('status.pending')}</option>
            <option value="APPROVED">{t('status.approved')}</option>
            <option value="REJECTED">{t('status.rejected')}</option>
          </select>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t('dashboard.stats.total_doctors')} value={data?.meta?.totalItems || 0} icon={Stethoscope} color="indigo" />
        <StatCard label={t('dashboard.stats.pending_verifications')} value={5} icon={Clock} color="yellow" />
        <StatCard label={t('dashboard.stats.approved_doctors')} value={18} icon={CheckCircle} color="green" />
        <StatCard label={t('dashboard.stats.average_rating')} value="4.8" icon={Star} color="purple" />
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={data?.data}
          isLoading={isLoading}
          exportFileName="doctors"
          onBulkDelete={async (items) => {
            await executeBulkDelete({
              items,
              deleteOne: (item) => api.delete(`/admin/doctors/${item.id}`),
              t,
              toast,
              invalidate: () => qc.invalidateQueries(['admin-doctors']),
            });
          }}
          onEdit={openEdit}
          onView={(item) => navigate(`/doctors/${item.id}`)}
          onDelete={async (doc) => {
            if (await confirmDelete({ text: doc.user?.fullName })) deleteMutation.mutate(doc.id);
          }}
          renderCustomActions={renderActions}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('doctors.edit_doctor') || 'Edit Doctor Profile'}
      >
        <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('doctors.title') || 'Professional Title'}</label>
              <input {...register('title')} className="input" />
            </div>
            <div>
              <label className="label">{t('doctors.license_number') || 'Medical License No.'}</label>
              <input {...register('licenseNumber')} className="input" />
            </div>
            <div>
              <label className="label">{t('doctors.city') || 'City'}</label>
              <input {...register('city')} className="input" />
            </div>
            <div>
              <label className="label">{t('doctors.consultation_fee') || 'Consultation Fee'}</label>
              <input type="number" {...register('consultationFee')} className="input" />
            </div>
            <div>
              <label className="label">{t('doctors.follow_up_fee') || 'Follow-up Fee'}</label>
              <input type="number" {...register('followUpFee')} className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">{t('doctors.bio') || 'Biography'}</label>
              <textarea {...register('bio')} className="input h-24 py-3" />
            </div>
            <div className="flex gap-6 md:col-span-2 bg-[var(--surface-secondary)] p-4 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" {...register('isPubliclyBookable')} className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-400" />
                <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-primary-600 transition-colors">{t('doctors.publicly_bookable') || 'Publicly Bookable'}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" {...register('isAvailable')} className="w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-400" />
                <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-primary-600 transition-colors">{t('doctors.available') || 'Currently Available'}</span>
              </label>
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
