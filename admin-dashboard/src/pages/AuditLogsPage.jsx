import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/ui/DataTable';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import { History, User, Activity, Clock } from 'lucide-react';

export default function AuditLogsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => api.get('/admin/audit-logs').then((r) => r.data),
  });

  const columns = [
    { 
      header: t('audit.user') || 'User', 
      accessorKey: 'user.fullName',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-[var(--text-muted)]" />
          <span>{row.original.user?.fullName || t('common.system')}</span>
        </div>
      )
    },
    { 
      header: t('audit.action') || 'Action', 
      accessorKey: 'action',
      cell: ({ row }) => <Badge variant="secondary">{row.original.action}</Badge>
    },
    { header: t('audit.module') || 'Module', accessorKey: 'module' },
    { 
      header: t('audit.details') || 'Details', 
      accessorKey: 'details',
      cell: ({ row }) => <div className="max-w-xs truncate" title={JSON.stringify(row.original.details)}>{JSON.stringify(row.original.details)}</div>
    },
    { 
      header: t('audit.date') || 'Date & Time', 
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Clock size={12} />
          {new Date(row.original.createdAt).toLocaleString()}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title={t('sidebar.audit_logs')} 
        breadcrumbs={[{ label: t('sidebar.dashboard'), path: '/' }, { label: t('sidebar.audit_logs'), path: '/audit-logs' }]}
      />

      <Card subtitle={t('audit.subtitle') || 'System-wide activity and changes log'}>
        <DataTable 
          columns={columns} 
          data={data?.data} 
          isLoading={isLoading} 
          onView={(item) => navigate(`/audit-logs/${item.id}`)}
          searchPlaceholder={t('audit.search_placeholder') || 'Search by entity type...'}
        />
      </Card>
    </div>
  );
}
