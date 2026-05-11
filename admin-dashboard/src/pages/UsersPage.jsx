import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/tables/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const roleLabels = {
  PATIENT: 'مريض', DOCTOR: 'طبيب', SUPER_ADMIN: 'مدير النظام',
  MEDICAL_ADMIN: 'مدير طبي', INSURANCE_STAFF: 'موظف تأمين',
  SUPPORT_STAFF: 'موظف دعم', ACCOUNTANT: 'محاسب',
};
const roleOptions = Object.entries(roleLabels).map(([v, l]) => ({ value: v, label: l }));
const statusOptions = [
  { value: 'ACTIVE', label: 'نشط' }, { value: 'INACTIVE', label: 'غير نشط' }, { value: 'SUSPENDED', label: 'معلق' },
];

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: 'PATIENT', status: 'ACTIVE', password: '' });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => api.get('/admin/users', { params: { page, limit: 20, search: search || undefined } }).then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => editItem ? api.put(`/admin/users/${editItem.id}`, payload) : api.post('/admin/users', payload),
    onSuccess: () => { toast.success(editItem ? 'تم تحديث المستخدم' : 'تمت إضافة المستخدم'); closeForm(); qc.invalidateQueries(['admin-users']); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { toast.success('تم إلغاء تفعيل المستخدم'); setDeleteTarget(null); qc.invalidateQueries(['admin-users']); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const closeForm = () => { setShowForm(false); setEditItem(null); };
  const openCreate = () => { setEditItem(null); setForm({ fullName: '', email: '', phone: '', role: 'PATIENT', status: 'ACTIVE', password: '' }); setShowForm(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ fullName: item.fullName, email: item.email, phone: item.phone || '', role: item.role, status: item.status, password: '' }); setShowForm(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    saveMutation.mutate(payload);
  };

  const columns = [
    { key: 'id', label: '#' },
    { key: 'fullName', label: 'الاسم' },
    { key: 'email', label: 'البريد الإلكتروني' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'role', label: 'الدور', render: (row) => roleLabels[row.role] || row.role },
    { key: 'status', label: 'الحالة', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', label: 'تاريخ التسجيل', render: (row) => new Date(row.createdAt).toLocaleDateString('ar-SA') },
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
          <h1 className="text-2xl font-bold">المستخدمون</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة جميع مستخدمي النظام</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> إضافة مستخدم</button>
      </div>

      {showForm && (
        <div className="card mb-6 relative">
          <button onClick={closeForm} className="absolute top-4 left-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5" /></button>
          <h3 className="font-bold mb-4 text-lg">{editItem ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">كلمة المرور {editItem && '(اتركها فارغة لعدم التغيير)'}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" {...(!editItem && { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الدور</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
                {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2 md:col-span-2 pt-2">
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary">{saveMutation.isPending ? 'جاري الحفظ...' : editItem ? 'تحديث' : 'إضافة'}</button>
              <button type="button" onClick={closeForm} className="btn-secondary">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.meta} onPageChange={setPage} onSearch={setSearch} searchPlaceholder="بحث بالاسم أو البريد أو الهاتف..." />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} title="تأكيد الحذف" message={`هل أنت متأكد من إلغاء تفعيل "${deleteTarget?.fullName}"؟`} confirmLabel="إلغاء التفعيل" />
    </div>
  );
}
