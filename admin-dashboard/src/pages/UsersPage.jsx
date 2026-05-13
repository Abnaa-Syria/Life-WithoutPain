import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import DataTable from '../components/ui/DataTable';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import { Plus, ShieldCheck, Mail, Phone, Lock } from 'lucide-react';
import useConfirmDelete from '../hooks/useConfirmDelete';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const confirmDelete = useConfirmDelete();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (editingItem) return api.put(`/admin/users/${editingItem.id}`, payload);
      return api.post('/admin/users', payload);
    },
    onSuccess: () => {
      toast.success(t('messages.saved'));
      setIsModalOpen(false);
      qc.invalidateQueries(['admin-users']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      toast.success(t('messages.deleted'));
      qc.invalidateQueries(['admin-users']);
    },
  });

  const openForm = (item = null) => {
    setEditingItem(item);
    if (item) {
      setValue('fullName', item.fullName);
      setValue('email', item.email);
      setValue('phone', item.phone);
      setValue('role', item.role);
    } else {
      reset();
    }
    setIsModalOpen(true);
  };

  const columns = [
    { header: t('users.full_name') || 'Full Name', accessorKey: 'fullName' },
    { header: t('users.email') || 'Email', accessorKey: 'email' },
    { header: t('users.phone') || 'Phone', accessorKey: 'phone' },
    { 
      header: t('users.role') || 'Role', 
      accessorKey: 'role',
      cell: ({ row }) => <Badge variant="primary">{t(`common.roles.${row.original.role}`) || row.original.role}</Badge>
    },
    { 
      header: t('common.status'), 
      accessorKey: 'isActive',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
          {row.original.isActive ? t('common.active') : t('common.inactive')}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title={t('sidebar.users')} 
        breadcrumbs={[{ label: t('sidebar.dashboard'), path: '/' }, { label: t('sidebar.users'), path: '/users' }]}
        action={
          <button onClick={() => openForm()} className="btn btn-primary">
            <Plus size={18} />
            {t('users.add_admin') || 'Add Admin'}
          </button>
        }
      />

      <Card>
        <DataTable 
          columns={columns} 
          data={data?.data} 
          isLoading={isLoading} 
          onEdit={openForm}
          onView={(item) => navigate(`/users/${item.id}`)}
          onDelete={async (item) => {
            if (await confirmDelete({ text: item.fullName })) deleteMutation.mutate(item.id);
          }}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? t('users.edit') : t('users.add')}
      >
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">{t('users.full_name')}</label>
              <input {...register('fullName', { required: true })} className="input" />
            </div>
            <div>
              <label className="label">{t('users.email')}</label>
              <input {...register('email', { required: true })} className="input" type="email" />
            </div>
            <div>
              <label className="label">{t('users.phone')}</label>
              <input {...register('phone', { required: true })} className="input" />
            </div>
            {!editingItem && (
              <div>
                <label className="label">{t('users.password')}</label>
                <input {...register('password', { required: true })} className="input" type="password" />
              </div>
            )}
            <div>
              <label className="label">{t('users.role')}</label>
              <select {...register('role', { required: true })} className="input">
                <option value="MEDICAL_ADMIN">{t('common.roles.MEDICAL_ADMIN')}</option>
                <option value="INSURANCE_STAFF">{t('common.roles.INSURANCE_STAFF')}</option>
                <option value="SUPPORT_STAFF">{t('common.roles.SUPPORT_STAFF')}</option>
                <option value="ACCOUNTANT">{t('common.roles.ACCOUNTANT')}</option>
                <option value="SUPER_ADMIN">{t('common.roles.SUPER_ADMIN')}</option>
              </select>
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
