import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import DataTable from '../components/ui/DataTable';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Users,
  ShieldCheck,
  Stethoscope,
  Shield,
  Headphones,
  Wallet,
} from 'lucide-react';
import useConfirmDelete from '../hooks/useConfirmDelete';
import toast from 'react-hot-toast';
import { executeBulkDelete } from '../utils/bulkDelete';

const STAFF_ROLES = [
  { key: 'SUPER_ADMIN', icon: ShieldCheck, color: 'indigo' },
  { key: 'MEDICAL_ADMIN', icon: Stethoscope, color: 'green' },
  { key: 'INSURANCE_STAFF', icon: Shield, color: 'purple' },
  { key: 'SUPPORT_STAFF', icon: Headphones, color: 'yellow' },
  { key: 'ACCOUNTANT', icon: Wallet, color: 'blue' },
];

export default function UsersPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const confirmDelete = useConfirmDelete();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');

  const { data: statsData } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: () => api.get('/admin/users', { params: { limit: 200 } }).then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () =>
      api
        .get('/admin/users', {
          params: { limit: 200, role: roleFilter || undefined },
        })
        .then((r) => r.data),
  });

  const roleCounts = useMemo(() => {
    const users = statsData?.data || [];
    const byRole = Object.fromEntries(STAFF_ROLES.map(({ key }) => [key, 0]));
    let staffTotal = 0;
    users.forEach((u) => {
      if (byRole[u.role] !== undefined) {
        byRole[u.role] += 1;
        staffTotal += 1;
      }
    });
    return { byRole, staffTotal };
  }, [statsData?.data]);

  const { data: assignableRoles } = useQuery({
    queryKey: ['rbac-assignable-roles'],
    queryFn: () => api.get('/admin/rbac/roles/assignable').then((r) => r.data.data),
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
      qc.invalidateQueries(['admin-users-stats']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      toast.success(t('messages.deleted'));
      qc.invalidateQueries(['admin-users']);
      qc.invalidateQueries(['admin-users-stats']);
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
      cell: ({ row }) => (
        <Badge variant="primary">{t(`common.roles.${row.original.role}`) || row.original.role}</Badge>
      ),
      meta: {
        exportValue: (row) => t(`common.roles.${row.role}`) || row.role,
      },
    },
    {
      header: t('common.status'),
      accessorKey: 'isActive',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
          {row.original.isActive ? t('common.active') : t('common.inactive')}
        </Badge>
      ),
      meta: {
        exportValue: (row) => (row.isActive ? t('common.active') : t('common.inactive')),
      },
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
            {t('users.add')}
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <button
          type="button"
          onClick={() => setRoleFilter('')}
          className={`text-left transition-opacity ${roleFilter === '' ? 'ring-2 ring-primary-500 rounded-2xl' : 'opacity-90 hover:opacity-100'}`}
        >
          <StatCard
            label={t('users.stats.total_staff')}
            value={roleCounts.staffTotal}
            icon={Users}
            color="indigo"
          />
        </button>
        {STAFF_ROLES.map(({ key, icon: Icon, color }) => (
          <button
            key={key}
            type="button"
            onClick={() => setRoleFilter(roleFilter === key ? '' : key)}
            className={`text-left transition-opacity ${roleFilter === key ? 'ring-2 ring-primary-500 rounded-2xl' : 'opacity-90 hover:opacity-100'}`}
          >
            <StatCard
              label={t(`common.roles.${key}`)}
              value={roleCounts.byRole[key] ?? 0}
              icon={Icon}
              color={color}
            />
          </button>
        ))}
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={data?.data}
          isLoading={isLoading}
          exportFileName="users"
          onBulkDelete={async (items) => {
            await executeBulkDelete({
              items,
              deleteOne: (item) => api.delete(`/admin/users/${item.id}`),
              t,
              toast,
              invalidate: () => {
                qc.invalidateQueries(['admin-users']);
                qc.invalidateQueries(['admin-users-stats']);
              },
            });
          }}
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
                {(assignableRoles || []).map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.displayName || t(`common.roles.${r.name}`) || r.name}
                  </option>
                ))}
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
