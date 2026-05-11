import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/tables/DataTable';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SpecialitiesPage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['specialities', page],
    queryFn: () => api.get('/specialities', { params: { page, limit: 20 } }).then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => editItem ? api.put(`/specialities/${editItem.id}`, data) : api.post('/specialities', data),
    onSuccess: () => { toast.success(editItem ? 'تم التحديث' : 'تمت الإضافة'); setShowForm(false); setEditItem(null); queryClient.invalidateQueries(['specialities']); },
    onError: () => toast.error('حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/specialities/${id}`),
    onSuccess: () => { toast.success('تم الحذف'); queryClient.invalidateQueries(['specialities']); },
  });

  const handleEdit = (item) => { setEditItem(item); setForm({ nameAr: item.nameAr, nameEn: item.nameEn, descriptionAr: item.descriptionAr || '', descriptionEn: item.descriptionEn || '' }); setShowForm(true); };

  const columns = [
    { key: 'id', label: '#' },
    { key: 'nameAr', label: 'الاسم (عربي)' },
    { key: 'nameEn', label: 'الاسم (إنجليزي)' },
    { key: 'isActive', label: 'الحالة', render: (row) => row.isActive ? <span className="badge-success">نشط</span> : <span className="badge-warning">غير نشط</span> },
    {
      key: 'actions', label: 'إجراءات', render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="p-1 text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
          <button onClick={() => { if (confirm('هل أنت متأكد؟')) deleteMutation.mutate(row.id); }} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">التخصصات</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة التخصصات الطبية</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '' }); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> إضافة تخصص
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h3 className="font-bold mb-4">{editItem ? 'تعديل التخصص' : 'إضافة تخصص جديد'}</h3>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="الاسم بالعربي" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="input-field" required />
            <input placeholder="الاسم بالإنجليزي" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="input-field" required />
            <textarea placeholder="الوصف بالعربي" value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} className="input-field" rows={2} />
            <textarea placeholder="الوصف بالإنجليزي" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} className="input-field" rows={2} />
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" className="btn-primary">{editItem ? 'تحديث' : 'إضافة'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.meta} onPageChange={setPage} />
    </div>
  );
}
