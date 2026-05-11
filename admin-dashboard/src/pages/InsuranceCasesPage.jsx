import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/tables/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { CheckCircle, XCircle, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const caseStatusOptions = [
  { value: 'OPEN', label: 'مفتوح' }, { value: 'UNDER_REVIEW', label: 'قيد المراجعة' },
  { value: 'APPROVED', label: 'مقبول' }, { value: 'REJECTED', label: 'مرفوض' },
  { value: 'ESCALATED', label: 'متصاعد' }, { value: 'CLOSED', label: 'مغلق' },
];

export default function InsuranceCasesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-insurance-cases', page, filter, search],
    queryFn: () => api.get('/admin/insurance-cases', { params: { page, limit: 20, status: filter || undefined, search: search || undefined } }).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/insurance-cases/${id}/approve`, { notes: 'Approved by admin' }),
    onSuccess: () => { toast.success('تم القبول'); qc.invalidateQueries(['admin-insurance-cases']); },
  });
  const rejectMutation = useMutation({
    mutationFn: (id) => api.patch(`/insurance-cases/${id}/reject`, { notes: 'Rejected by admin' }),
    onSuccess: () => { toast.success('تم الرفض'); qc.invalidateQueries(['admin-insurance-cases']); },
  });
  const updateMutation = useMutation({
    mutationFn: (payload) => api.put(`/admin/insurance-cases/${editItem.id}`, payload),
    onSuccess: () => { toast.success('تم التحديث'); setShowForm(false); setEditItem(null); qc.invalidateQueries(['admin-insurance-cases']); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/insurance-cases/${id}`),
    onSuccess: () => { toast.success('تم إغلاق الحالة'); setDeleteTarget(null); qc.invalidateQueries(['admin-insurance-cases']); },
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ status: item.status, notes: item.notes || '' });
    setShowForm(true);
  };
  const handleSubmit = (e) => { e.preventDefault(); updateMutation.mutate(form); };

  const columns = [
    { key: 'id', label: '#' },
    { key: 'patient', label: 'المريض', render: (row) => row.patient?.user?.fullName || '-' },
    { key: 'provider', label: 'شركة التأمين', render: (row) => row.provider?.nameAr || '-' },
    { key: 'caseType', label: 'نوع الحالة' },
    { key: 'status', label: 'الحالة', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'date', label: 'تاريخ التقديم', render: (row) => new Date(row.submittedAt || row.createdAt).toLocaleDateString('ar-SA') },
    {
      key: '_actions', label: 'إجراءات', render: (row) => (
        <div className="flex gap-1">
          {(row.status === 'OPEN' || row.status === 'UNDER_REVIEW') && (
            <>
              <button onClick={() => approveMutation.mutate(row.id)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" title="قبول"><CheckCircle className="w-4 h-4" /></button>
              <button onClick={() => rejectMutation.mutate(row.id)} className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20" title="رفض"><XCircle className="w-4 h-4" /></button>
            </>
          )}
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="تعديل"><Edit className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="إغلاق"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">حالات التأمين</h1>
          <p className="text-gray-500 text-sm mt-1">مراجعة واعتماد حالات التأمين</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-48">
          <option value="">جميع الحالات</option>
          {caseStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="card mb-6 relative">
          <button onClick={() => { setShowForm(false); setEditItem(null); }} className="absolute top-4 left-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5" /></button>
          <h3 className="font-bold mb-4 text-lg">تعديل حالة التأمين #{editItem?.id}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                {caseStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ملاحظات</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" rows={2} />
            </div>
            <div className="flex gap-2 md:col-span-2 pt-2">
              <button type="submit" disabled={updateMutation.isPending} className="btn-primary">{updateMutation.isPending ? 'جاري الحفظ...' : 'تحديث'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="btn-secondary">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.meta} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="بحث بالاسم..." />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} title="تأكيد الإغلاق" message="هل أنت متأكد من إغلاق حالة التأمين؟" confirmLabel="إغلاق" />
    </div>
  );
}
