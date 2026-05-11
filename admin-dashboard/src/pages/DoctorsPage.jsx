import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/tables/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { Edit, Trash2, CheckCircle, XCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-doctors', page, search, filter],
    queryFn: () => api.get('/admin/doctors', { params: { page, limit: 20, search: search || undefined, verificationStatus: filter || undefined } }).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/doctors/${id}/approve`),
    onSuccess: () => { toast.success('تم قبول الطبيب'); qc.invalidateQueries(['admin-doctors']); },
  });
  const rejectMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/doctors/${id}/reject`, { reason: 'Documents insufficient' }),
    onSuccess: () => { toast.success('تم رفض الطبيب'); qc.invalidateQueries(['admin-doctors']); },
  });
  const updateMutation = useMutation({
    mutationFn: (payload) => api.put(`/admin/doctors/${editItem.id}`, payload),
    onSuccess: () => { toast.success('تم تحديث بيانات الطبيب'); setShowForm(false); setEditItem(null); qc.invalidateQueries(['admin-doctors']); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/doctors/${id}`),
    onSuccess: () => { toast.success('تم إلغاء تفعيل الطبيب'); setDeleteTarget(null); qc.invalidateQueries(['admin-doctors']); },
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title || '', bio: item.bio || '', city: item.city || '',
      consultationFee: item.consultationFee || 0, followUpFee: item.followUpFee || 0,
      isPubliclyBookable: item.isPubliclyBookable, isAvailable: item.isAvailable,
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      ...form,
      consultationFee: Number(form.consultationFee),
      followUpFee: Number(form.followUpFee),
    });
  };

  const columns = [
    { key: 'id', label: '#' },
    { key: 'name', label: 'الاسم', render: (row) => row.user?.fullName },
    { key: 'speciality', label: 'التخصص', render: (row) => row.speciality?.nameAr || '-' },
    { key: 'city', label: 'المدينة' },
    { key: 'fee', label: 'رسوم الاستشارة', render: (row) => `${row.consultationFee} ر.س` },
    { key: 'rating', label: 'التقييم', render: (row) => `${row.ratingAverage?.toFixed(1) || 0} (${row.ratingCount || 0})` },
    { key: 'status', label: 'حالة التحقق', render: (row) => <StatusBadge status={row.verificationStatus} /> },
    {
      key: '_actions', label: 'إجراءات', render: (row) => (
        <div className="flex gap-1">
          {row.verificationStatus === 'PENDING' && (
            <>
              <button onClick={() => approveMutation.mutate(row.id)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" title="قبول"><CheckCircle className="w-4 h-4" /></button>
              <button onClick={() => rejectMutation.mutate(row.id)} className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20" title="رفض"><XCircle className="w-4 h-4" /></button>
            </>
          )}
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="تعديل"><Edit className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="حذف"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">الأطباء</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة الأطباء والتحقق من حساباتهم</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-48">
          <option value="">جميع الحالات</option>
          <option value="PENDING">قيد المراجعة</option>
          <option value="APPROVED">مقبول</option>
          <option value="REJECTED">مرفوض</option>
        </select>
      </div>

      {showForm && (
        <div className="card mb-6 relative">
          <button onClick={() => { setShowForm(false); setEditItem(null); }} className="absolute top-4 left-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5" /></button>
          <h3 className="font-bold mb-4 text-lg">تعديل بيانات الطبيب</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اللقب</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المدينة</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رسوم الاستشارة</label>
              <input type="number" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رسوم المتابعة</label>
              <input type="number" value={form.followUpFee} onChange={(e) => setForm({ ...form, followUpFee: e.target.value })} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">نبذة مختصرة</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field" rows={3} />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form.isPubliclyBookable} onChange={(e) => setForm({ ...form, isPubliclyBookable: e.target.checked })} className="w-4 h-4 rounded" />
                <span className="text-sm">قابل للحجز</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4 rounded" />
                <span className="text-sm">متاح</span>
              </label>
            </div>
            <div className="flex gap-2 md:col-span-2 pt-2">
              <button type="submit" disabled={updateMutation.isPending} className="btn-primary">{updateMutation.isPending ? 'جاري الحفظ...' : 'تحديث'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="btn-secondary">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.meta} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="بحث بالاسم..." />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} title="تأكيد الحذف" message={`هل أنت متأكد من إلغاء تفعيل الطبيب "${deleteTarget?.user?.fullName}"؟`} confirmLabel="إلغاء التفعيل" />
    </div>
  );
}
