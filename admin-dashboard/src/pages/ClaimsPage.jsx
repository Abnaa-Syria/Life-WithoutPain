import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/tables/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const batchStatusOptions = [
  { value: 'DRAFT', label: 'مسودة' }, { value: 'SUBMITTED', label: 'مقدم' },
  { value: 'PROCESSING', label: 'قيد المعالجة' }, { value: 'COMPLETED', label: 'مكتمل' },
  { value: 'REJECTED', label: 'مرفوض' },
];
const submissionTypeOptions = [
  { value: 'DAILY', label: 'يومي' }, { value: 'MONTHLY', label: 'شهري' },
];

export default function ClaimsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-claims', page, filter, search],
    queryFn: () => api.get('/admin/claims/batches', { params: { page, limit: 20, status: filter || undefined } }).then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => editItem ? api.put(`/admin/claims/batches/${editItem.id}`, payload) : api.post('/admin/claims/batches', payload),
    onSuccess: () => { toast.success(editItem ? 'تم التحديث' : 'تمت الإضافة'); setShowForm(false); setEditItem(null); qc.invalidateQueries(['admin-claims']); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/claims/batches/${id}`),
    onSuccess: () => { toast.success('تم الحذف'); setDeleteTarget(null); qc.invalidateQueries(['admin-claims']); },
  });

  const openCreate = () => {
    setEditItem(null);
    setForm({ providerId: '', submissionType: 'MONTHLY', status: 'DRAFT', periodStart: '', periodEnd: '', totalAmount: 0, totalClaims: 0 });
    setShowForm(true);
  };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ status: item.status, submissionType: item.submissionType, totalAmount: item.totalAmount, totalClaims: item.totalClaims });
    setShowForm(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.totalAmount) payload.totalAmount = Number(payload.totalAmount);
    if (payload.totalClaims) payload.totalClaims = Number(payload.totalClaims);
    if (payload.providerId) payload.providerId = Number(payload.providerId);
    if (payload.periodStart) payload.periodStart = new Date(payload.periodStart);
    if (payload.periodEnd) payload.periodEnd = new Date(payload.periodEnd);
    saveMutation.mutate(payload);
  };

  const columns = [
    { key: 'id', label: '#' },
    { key: 'provider', label: 'شركة التأمين', render: (row) => row.provider?.nameAr || '-' },
    { key: 'submissionType', label: 'النوع', render: (row) => submissionTypeOptions.find((o) => o.value === row.submissionType)?.label || row.submissionType },
    { key: 'totalClaims', label: 'عدد المطالبات' },
    { key: 'totalAmount', label: 'المبلغ الإجمالي', render: (row) => `${row.totalAmount} ر.س` },
    { key: 'status', label: 'الحالة', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'date', label: 'التاريخ', render: (row) => new Date(row.createdAt).toLocaleDateString('ar-SA') },
    {
      key: '_actions', label: 'إجراءات', render: (row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Edit className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">المطالبات</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة دفعات المطالبات التأمينية</p>
        </div>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-48">
            <option value="">جميع الحالات</option>
            {batchStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> دفعة جديدة</button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-6 relative">
          <button onClick={() => { setShowForm(false); setEditItem(null); }} className="absolute top-4 left-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5" /></button>
          <h3 className="font-bold mb-4 text-lg">{editItem ? 'تعديل الدفعة' : 'إنشاء دفعة جديدة'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editItem && (
              <div>
                <label className="block text-sm font-medium mb-1">معرف شركة التأمين</label>
                <input type="number" value={form.providerId} onChange={(e) => setForm({ ...form, providerId: e.target.value })} className="input-field" required />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">نوع التقديم</label>
              <select value={form.submissionType} onChange={(e) => setForm({ ...form, submissionType: e.target.value })} className="input-field">
                {submissionTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                {batchStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {!editItem && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">بداية الفترة</label>
                  <input type="date" value={form.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">نهاية الفترة</label>
                  <input type="date" value={form.periodEnd} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} className="input-field" required />
                </div>
              </>
            )}
            <div className="flex gap-2 md:col-span-2 pt-2">
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary">{saveMutation.isPending ? 'جاري الحفظ...' : editItem ? 'تحديث' : 'إنشاء'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="btn-secondary">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.meta} onPageChange={setPage} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} title="تأكيد الحذف" message="هل أنت متأكد من حذف هذه الدفعة؟" confirmLabel="حذف" />
    </div>
  );
}
