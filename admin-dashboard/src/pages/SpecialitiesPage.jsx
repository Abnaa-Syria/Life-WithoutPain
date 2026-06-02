import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import DataTable from '../components/ui/DataTable';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ImageUpload from '../components/ui/ImageUpload';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Activity } from 'lucide-react';
import useConfirmDelete from '../hooks/useConfirmDelete';
import toast from 'react-hot-toast';
import { executeBulkDelete } from '../utils/bulkDelete';
import { resolveUploadUrl } from '../utils/uploads';

export default function SpecialitiesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirmDelete = useConfirmDelete();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-specialities'],
    queryFn: () => api.get('/admin/specialities').then((r) => r.data),
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const iconUrl = watch('iconUrl');

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (editingItem) return api.put(`/admin/specialities/${editingItem.id}`, payload);
      return api.post('/admin/specialities', payload);
    },
    onSuccess: () => {
      toast.success(t('messages.saved'));
      setIsModalOpen(false);
      qc.invalidateQueries(['admin-specialities']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/specialities/${id}`),
    onSuccess: () => {
      toast.success(t('messages.deleted'));
      qc.invalidateQueries(['admin-specialities']);
    },
  });

  const openForm = (item = null) => {
    setEditingItem(item);
    if (item) {
      setValue('nameAr', item.nameAr);
      setValue('nameEn', item.nameEn);
      setValue('descriptionAr', item.descriptionAr);
      setValue('descriptionEn', item.descriptionEn);
      setValue('iconUrl', item.iconUrl);
    } else {
      reset();
    }
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: t('specialities.icon') || 'Icon',
      accessorKey: 'iconUrl',
      cell: ({ row }) => (
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center overflow-hidden">
          {row.original.iconUrl ? (
            <img src={resolveUploadUrl(row.original.iconUrl)} alt="" className="w-full h-full object-cover" />
          ) : (
            <Activity size={20} className="text-primary-600" />
          )}
        </div>
      ),
      meta: { exportValue: (row) => row.iconUrl || '—' },
    },
    { header: t('specialities.name_ar') || 'Name (AR)', accessorKey: 'nameAr' },
    { header: t('specialities.name_en') || 'Name (EN)', accessorKey: 'nameEn' },
    {
      header: t('specialities.doctors_count') || 'Doctors',
      accessorKey: '_count.doctors',
      cell: ({ row }) => row.original._count?.doctors || 0,
      meta: { exportValue: (row) => String(row._count?.doctors || 0) },
    },
    {
      header: t('specialities.sub_specialities_count') || 'Sub-specialities',
      accessorKey: '_count.subSpecialities',
      cell: ({ row }) => row.original._count?.subSpecialities || 0,
      meta: { exportValue: (row) => String(row._count?.subSpecialities || 0) },
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title={t('sidebar.specialities')} 
        breadcrumbs={[{ label: t('sidebar.dashboard'), path: '/' }, { label: t('sidebar.specialities'), path: '/specialities' }]}
        action={
          <button onClick={() => openForm()} className="btn btn-primary">
            <Plus size={18} />
            {t('common.add_new')}
          </button>
        }
      />

      <Card>
        <DataTable
          columns={columns}
          data={data?.data}
          isLoading={isLoading}
          exportFileName="specialities"
          onBulkDelete={async (items) => {
            await executeBulkDelete({
              items,
              deleteOne: (item) => api.delete(`/admin/specialities/${item.id}`),
              t,
              toast,
              invalidate: () => qc.invalidateQueries(['admin-specialities']),
            });
          }}
          onEdit={openForm}
          onView={(item) => navigate(`/specialities/${item.id}`)}
          onDelete={async (item) => {
            if (await confirmDelete({ text: item.nameAr })) deleteMutation.mutate(item.id);
          }}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? t('specialities.edit') : t('specialities.add')}
      >
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('specialities.name_ar')}</label>
                <input {...register('nameAr', { required: true })} className="input" />
              </div>
              <div>
                <label className="label">{t('specialities.name_en')}</label>
                <input {...register('nameEn', { required: true })} className="input" />
              </div>
            </div>
            <div>
              <label className="label">{t('specialities.description_ar')}</label>
              <textarea {...register('descriptionAr')} className="input h-20 py-2" />
            </div>
            <div>
              <label className="label">{t('specialities.description_en')}</label>
              <textarea {...register('descriptionEn')} className="input h-20 py-2" />
            </div>
            <div>
              <label className="label">{t('specialities.icon')}</label>
              <ImageUpload 
                value={iconUrl} 
                onChange={(file) => setValue('iconUrl', file ? URL.createObjectURL(file) : '')} 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={mutation.isPending} className="btn btn-primary flex-1">
              {mutation.isPending ? t('common.saving') : t('common.save')}
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
