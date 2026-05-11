import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/tables/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-patients', page, search],
    queryFn: () => api.get('/admin/patients', { params: { page, limit: 20, search: search || undefined } }).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => api.put(`/admin/patients/${editItem.id}`, payload),
    onSuccess: () => { toast.success('تم تحديث بيانات المريض'); setShowForm(false); setEditItem(null); qc.invalidateQueries(['admin-patients']); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/patients/${id}`),
    onSuccess: () => { toast.success('تم إلغاء تفعيل المريض'); setDeleteTarget(null); qc.invalidateQueries(['admin-patients']); },
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      gender: item.gender || '', city: item.city || '',
      bloodType: item.bloodType || '', height: item.height || '',
      weight: item.weight || '', address: item.address || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      ...form,
      height: form.height ? Number(form.height) : null,
      weight: form.weight ? Number(form.weight) : null,
    });
  };

  const columns = [
    { key: 'id', label: '#' },
    { key: 'name', label: 'الاسم', render: (row) => row.user?.fullName },
    { key: 'email', label: 'البريد', render: (row) => row.user?.email },
    { key: 'phone', label: 'الهاتف', render: (row) => row.user?.phone },
    { key: 'gender', label: 'الجنس', render: (row) => row.gender === 'MALE' ? 'ذكر' : row.gender === 'FEMALE' ? 'أنثى' : '-' },
    { key: 'city', label: 'المدينة', render: (row) => row.city || '-' },
    { key: 'insurance', label: 'التأمين', render: (row) => row.insuranceLinked ? 'مرتبط' : 'غير مرتبط' },
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">المرضى</h1>
        <p className="text-gray-500 text-sm mt-1">إدارة ومتابعة المرضى</p>
      </div>

      {showForm && (
        <div className="card mb-6 relative">
          <button onClick={() => { setShowForm(false); setEditItem(null); }} className="absolute top-4 left-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5" /></button>
          <h3 className="font-bold mb-4 text-lg">تعديل بيانات المريض</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الجنس</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
                <option value="">-- اختر --</option>
                <option value="MALE">ذكر</option>
                <option value="FEMALE">أنثى</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المدينة</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">فصيلة الدم</label>
              <select value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })} className="input-field">
                <option value="">-- اختر --</option>
                {['O_POSITIVE', 'O_NEGATIVE', 'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE'].map((v) => <option key={v} value={v}>{v.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الطول (سم)</label>
              <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الوزن (كغ)</label>
              <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">العنوان</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
            </div>
            <div className="flex gap-2 md:col-span-2 pt-2">
              <button type="submit" disabled={updateMutation.isPending} className="btn-primary">{updateMutation.isPending ? 'جاري الحفظ...' : 'تحديث'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="btn-secondary">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.meta} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="بحث بالاسم..." />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} title="تأكيد الحذف" message={`هل أنت متأكد من إلغاء تفعيل "${deleteTarget?.user?.fullName}"؟`} confirmLabel="إلغاء التفعيل" />
    </div>
  );
}
