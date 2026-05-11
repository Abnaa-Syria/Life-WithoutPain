import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/tables/DataTable';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page, search],
    queryFn: () => api.get('/admin/audit-logs', { params: { page, limit: 20, search: search || undefined } }).then((r) => r.data),
  });

  const columns = [
    { key: 'id', label: '#' },
    { key: 'actor', label: 'المستخدم', render: (row) => row.actor?.fullName || 'النظام' },
    { key: 'role', label: 'الدور', render: (row) => row.actor?.role || '-' },
    { key: 'action', label: 'الإجراء' },
    { key: 'entityType', label: 'نوع الكيان' },
    { key: 'entityId', label: 'معرف الكيان', render: (row) => row.entityId || '-' },
    { key: 'ipAddress', label: 'عنوان IP', render: (row) => row.ipAddress || '-' },
    { key: 'date', label: 'التاريخ', render: (row) => new Date(row.createdAt).toLocaleString('ar-SA') },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">سجل العمليات</h1>
        <p className="text-gray-500 text-sm mt-1">تتبع جميع العمليات الحساسة في النظام</p>
      </div>
      <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.meta} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="بحث بنوع الكيان..." />
    </div>
  );
}
