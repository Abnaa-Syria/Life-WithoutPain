import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import DataTable from '../ui/DataTable';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useTranslation } from 'react-i18next';

export default function SupportTicketsTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-support-tickets', status, role, category, search],
    queryFn: () =>
      api
        .get('/admin/support/tickets', {
          params: {
            status: status || undefined,
            creatorRole: role || undefined,
            category: category || undefined,
            search: search || undefined,
            sortBy: 'lastActivityAt',
            sortOrder: 'desc',
            limit: 100,
          },
        })
        .then((r) => r.data),
  });

  const columns = [
    { header: t('support.subject'), accessorKey: 'subject' },
    {
      header: t('support.user'),
      accessorKey: 'creatorName',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.creatorName}</span>
          <Badge variant="secondary">{row.original.creatorRole}</Badge>
        </div>
      ),
      meta: {
        exportValue: (row) => {
          const role = row.creatorRole
            ? t(`common.roles.${row.creatorRole}`) || row.creatorRole
            : '';
          return role ? `${row.creatorName} (${role})` : row.creatorName;
        },
      },
    },
    {
      header: t('support.category') || 'Category',
      accessorKey: 'category',
      cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge>,
      meta: { exportValue: (row) => row.category },
    },
    {
      header: t('support.priority'),
      accessorKey: 'priority',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.priority === 'HIGH' || row.original.priority === 'URGENT'
              ? 'danger'
              : 'secondary'
          }
        >
          {row.original.priority}
        </Badge>
      ),
      meta: { exportValue: (row) => row.priority },
    },
    {
      header: t('common.status'),
      accessorKey: 'status',
      cell: ({ row }) => {
        const s = row.original.status;
        const variants = { OPEN: 'primary', IN_PROGRESS: 'warning', RESOLVED: 'success', CLOSED: 'secondary' };
        return <Badge variant={variants[s] || 'secondary'}>{t(`status.${s?.toLowerCase()}`) || s}</Badge>;
      },
      meta: {
        exportValue: (row) => t(`status.${row.status?.toLowerCase()}`) || row.status,
      },
    },
    {
      header: t('support.unread'),
      accessorKey: 'unreadCount',
      cell: ({ row }) =>
        row.original.unreadCount > 0 ? (
          <Badge variant="danger">{row.original.unreadCount}</Badge>
        ) : (
          '—'
        ),
      meta: {
        exportValue: (row) => (row.unreadCount > 0 ? String(row.unreadCount) : '—'),
      },
    },
    {
      header: t('support.date'),
      accessorKey: 'lastActivityAt',
      cell: ({ row }) =>
        new Date(row.original.lastActivityAt || row.original.createdAt).toLocaleString(),
      meta: {
        exportValue: (row) =>
          new Date(row.lastActivityAt || row.createdAt).toLocaleString(),
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-40 h-10">
          <option value="">{t('common.all_statuses')}</option>
          <option value="OPEN">{t('status.open')}</option>
          <option value="IN_PROGRESS">{t('status.in_progress') || 'In Progress'}</option>
          <option value="RESOLVED">{t('status.resolved')}</option>
          <option value="CLOSED">{t('status.closed')}</option>
        </select>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input w-40 h-10">
          <option value="">{t('support.all_roles') || 'All roles'}</option>
          <option value="PATIENT">{t('common.roles.PATIENT')}</option>
          <option value="DOCTOR">{t('common.roles.DOCTOR')}</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input w-44 h-10">
          <option value="">{t('support.all_categories') || 'All categories'}</option>
          {['TECHNICAL', 'APPOINTMENT', 'PAYMENT', 'INSURANCE', 'ACCOUNT', 'OTHER'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          className="input h-10 flex-1 min-w-[200px]"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={data?.data}
          isLoading={isLoading}
          exportFileName="support-tickets"
          onView={(item) => navigate(`/support/tickets/${item.id}`)}
        />
      </Card>
    </div>
  );
}
