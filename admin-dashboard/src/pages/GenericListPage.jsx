import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/tables/DataTable';
import StatusBadge from '../components/ui/StatusBadge';

export default function GenericListPage({ title, subtitle, endpoint, columns: columnsDef }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [endpoint, page, search],
    queryFn: () => api.get(endpoint, { params: { page, limit: 20, search: search || undefined } }).then((res) => res.data),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      <DataTable columns={columnsDef} data={data?.data} loading={isLoading} pagination={data?.meta} onPageChange={setPage} onSearch={setSearch} />
    </div>
  );
}
