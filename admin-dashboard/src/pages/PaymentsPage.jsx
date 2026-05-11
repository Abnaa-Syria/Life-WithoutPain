import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/tables/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const paymentStatusOptions = [
  { value: 'PENDING', label: 'قيد الانتظار' }, { value: 'PAID', label: 'مدفوع' },
  { value: 'FAILED', label: 'فشل' }, { value: 'REFUNDED', label: 'مسترد' },
];

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page, filter, search],
    queryFn: () => api.get('/admin/payments', { params: { page, limit: 20, status: filter || undefined, search: search || undefined } }).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => api.put(`/admin/payments/${editItem.id}`, payload),
    onSuccess: () => { toast.success('تم التحديث'); setShowForm(false); setEditItem(null); qc.invalidateQueries(['admin-payments']); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/payments/${id}`),
    onSuccess: () => { toast.success('تم استرداد المبلغ'); setDeleteTarget(null); qc.invalidateQueries(['admin-payments']); },
  });

  const openEdit = (item) => { setEditItem(item); setForm({ status: item.status }); setShowForm(true); };
  const handleSubmit = (e) => { e.preventDefault(); updateMutation.mutate(form); };

  const columns = [
    { key: 'id', label: '#' },
    { key: 'patient', label: 'المريض', render: (row) => row.patient?.user?.fullName || '-' },
    { key: 'amount', label: 'المبلغ', render: (row) => `${row.amount} ${row.currency}` },
    { key: 'method', label: 'طريقة الدفع', render: (row) => row.method || '-' },
    { key: 'transactionReference', label: 'المرجع', render: (row) => row.transactionReference || '-' },
    { key: 'status', label: 'الحالة', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'date', label: 'التاريخ', render: (row) => new Date(row.createdAt).toLocaleDateString('ar-SA') },
    {
      key: '_actions', label: 'إجراءات', render: (row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Edit className="w-4 h-4" /></button>
          {row.status !== 'REFUNDED' && <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">المدفوعات</h1>
          <p className="text-gray-500 text-sm mt-1">سجل المدفوعات والمعاملات المالية</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-48">
          <option value="">جميع الحالات</option>
          {paymentStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="card mb-6 relative">
          <button onClick={() => { setShowForm(false); setEditItem(null); }} className="absolute top-4 left-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5" /></button>
          <h3 className="font-bold mb-4 text-lg">تعديل المدفوعة #{editItem?.id}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                {paymentStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={updateMutation.isPending} className="btn-primary">{updateMutation.isPending ? 'جاري الحفظ...' : 'تحديث'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="btn-secondary">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.meta} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="بحث بالمرجع..." />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} title="تأكيد الاسترداد" message="هل أنت متأكد من استرداد هذه المدفوعة؟" confirmLabel="استرداد" />
    </div>
  );
}
