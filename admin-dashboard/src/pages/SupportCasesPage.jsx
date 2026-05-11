import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/tables/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'OPEN', label: 'مفتوح' }, { value: 'IN_PROGRESS', label: 'جاري' },
  { value: 'RESOLVED', label: 'محلول' }, { value: 'CLOSED', label: 'مغلق' },
];
const priorityOptions = [
  { value: 'LOW', label: 'منخفض' }, { value: 'MEDIUM', label: 'متوسط' },
  { value: 'HIGH', label: 'عالي' }, { value: 'CRITICAL', label: 'حرج' },
];
const typeOptions = [
  { value: 'TECHNICAL', label: 'تقني' }, { value: 'INSURANCE', label: 'تأمين' },
  { value: 'BILLING', label: 'محاسبة' }, { value: 'GENERAL', label: 'عام' },
];

export default function SupportCasesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-support-cases', page, filter, search],
    queryFn: () => api.get('/admin/support-cases', { params: { page, limit: 20, status: filter || undefined, search: search || undefined } }).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => api.put(`/admin/support-cases/${editItem.id}`, payload),
    onSuccess: () => { toast.success('تم التحديث'); setShowForm(false); setEditItem(null); qc.invalidateQueries(['admin-support-cases']); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/support-cases/${id}`),
    onSuccess: () => { toast.success('تم إغلاق الحالة'); setDeleteTarget(null); qc.invalidateQueries(['admin-support-cases']); },
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ status: item.status, priority: item.priority, type: item.type, subject: item.subject || '', resolutionNotes: item.resolutionNotes || '' });
    setShowForm(true);
  };
  const handleSubmit = (e) => { e.preventDefault(); updateMutation.mutate(form); };

  const columns = [
    { key: 'id', label: '#' },
    { key: 'subject', label: 'الموضوع' },
    { key: 'patient', label: 'المريض', render: (row) => row.patient?.user?.fullName || '-' },
    { key: 'type', label: 'النوع', render: (row) => typeOptions.find((o) => o.value === row.type)?.label || row.type },
    { key: 'priority', label: 'الأولوية', render: (row) => <StatusBadge status={row.priority} /> },
    { key: 'assignee', label: 'المسؤول', render: (row) => row.assignee?.fullName || 'غير محدد' },
    { key: 'status', label: 'الحالة', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'date', label: 'التاريخ', render: (row) => new Date(row.createdAt).toLocaleDateString('ar-SA') },
    {
      key: '_actions', label: 'إجراءات', render: (row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Edit className="w-4 h-4" /></button>
          {row.status !== 'CLOSED' && <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">حالات الدعم</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة ومتابعة حالات الدعم الفني</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-48">
          <option value="">جميع الحالات</option>
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="card mb-6 relative">
          <button onClick={() => { setShowForm(false); setEditItem(null); }} className="absolute top-4 left-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5" /></button>
          <h3 className="font-bold mb-4 text-lg">تعديل حالة الدعم #{editItem?.id}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الموضوع</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">النوع</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الأولوية</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input-field">
                {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">ملاحظات الحل</label>
              <textarea value={form.resolutionNotes} onChange={(e) => setForm({ ...form, resolutionNotes: e.target.value })} className="input-field" rows={2} />
            </div>
            <div className="flex gap-2 md:col-span-2 pt-2">
              <button type="submit" disabled={updateMutation.isPending} className="btn-primary">{updateMutation.isPending ? 'جاري الحفظ...' : 'تحديث'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="btn-secondary">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.meta} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="بحث بالموضوع..." />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} title="تأكيد الإغلاق" message="هل أنت متأكد من إغلاق حالة الدعم؟" confirmLabel="إغلاق" />
    </div>
  );
}
