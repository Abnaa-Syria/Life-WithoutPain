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
import { Plus, KeyRound } from 'lucide-react';
import useConfirmDelete from '../hooks/useConfirmDelete';
import toast from 'react-hot-toast';
import { executeBulkDelete } from '../utils/bulkDelete';
import { useAuth } from '../hooks/useAuth';

export default function RolesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirmDelete = useConfirmDelete();
  const { can } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManage = can('roles.manage');

  const { data, isLoading } = useQuery({
    queryKey: ['rbac-roles'],
    queryFn: () => api.get('/admin/rbac/roles').then((r) => r.data.data),
    enabled: canManage,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/admin/rbac/roles', payload),
    onSuccess: () => {
      toast.success(t('rbac.role_created'));
      setIsModalOpen(false);
      reset();
      qc.invalidateQueries(['rbac-roles']);
    },
    onError: (err) => toast.error(err.response?.data?.message || t('messages.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/rbac/roles/${id}`),
    onSuccess: () => {
      toast.success(t('messages.deleted'));
      qc.invalidateQueries(['rbac-roles']);
    },
    onError: (err) => toast.error(err.response?.data?.message || t('messages.error')),
  });

  const columns = [
    {
      header: t('rbac.role_name'),
      accessorKey: 'name',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.name}</span>
      ),
    },
    { header: t('rbac.display_name'), accessorKey: 'displayName' },
    {
      header: t('rbac.type'),
      accessorKey: 'isSystem',
      cell: ({ row }) => (
        <Badge variant={row.original.isSystem ? 'primary' : 'secondary'}>
          {row.original.isSystem ? t('rbac.system_role') : t('rbac.custom_role')}
        </Badge>
      ),
      meta: {
        exportValue: (row) =>
          row.isSystem ? t('rbac.system_role') : t('rbac.custom_role'),
      },
    },
    {
      header: t('rbac.permissions_count'),
      accessorKey: '_count',
      cell: ({ row }) => row.original._count?.permissions ?? row.original.permissions?.length ?? 0,
      meta: {
        exportValue: (row) =>
          String(row._count?.permissions ?? row.permissions?.length ?? 0),
      },
    },
  ];

  if (!canManage) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)]">
        {t('rbac.no_access')}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('sidebar.roles')}
        breadcrumbs={[
          { label: t('sidebar.dashboard'), path: '/' },
          { label: t('sidebar.roles'), path: '/roles' },
        ]}
        action={
          <button type="button" onClick={() => { reset(); setIsModalOpen(true); }} className="btn btn-primary">
            <Plus size={18} />
            {t('rbac.create_role')}
          </button>
        }
      />

      <Card>
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          exportFileName="roles"
          onBulkDelete={async (items) => {
            const deletable = items.filter((item) => !item.isSystem);
            if (deletable.length < items.length) {
              toast.error(t('rbac.cannot_delete_system'));
            }
            if (!deletable.length) return;
            await executeBulkDelete({
              items: deletable,
              deleteOne: (item) => api.delete(`/admin/rbac/roles/${item.id}`),
              t,
              toast,
              invalidate: () => qc.invalidateQueries(['rbac-roles']),
            });
          }}
          onView={(item) => navigate(`/roles/${item.id}`)}
          onDelete={async (item) => {
            if (item.isSystem) {
              toast.error(t('rbac.cannot_delete_system'));
              return;
            }
            if (await confirmDelete({ text: item.displayName || item.name })) {
              deleteMutation.mutate(item.id);
            }
          }}
          renderCustomActions={(item) => (
            <button
              type="button"
              className="p-2 text-[var(--text-muted)] hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title={t('rbac.edit_permissions')}
              onClick={() => navigate(`/roles/${item.id}`)}
            >
              <KeyRound size={16} />
            </button>
          )}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('rbac.create_role')}
      >
        <p className="text-sm text-[var(--text-muted)] mb-4">{t('rbac.create_role_hint')}</p>
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">{t('rbac.role_name')}</label>
            <input
              {...register('name', { required: true, pattern: /^[A-Za-z][A-Za-z0-9_]*$/ })}
              className="input font-mono uppercase"
              placeholder="CUSTOM_ROLE"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{t('rbac.invalid_name')}</p>}
          </div>
          <div>
            <label className="label">{t('rbac.display_name')}</label>
            <input {...register('displayName', { required: true })} className="input" />
          </div>
          <div>
            <label className="label">{t('common.description')}</label>
            <textarea {...register('description')} className="input" rows={3} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createMutation.isPending} className="btn btn-primary flex-1">
              {createMutation.isPending ? t('common.saving') : t('common.save')}
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
