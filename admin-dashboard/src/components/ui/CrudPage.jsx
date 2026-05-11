import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import DataTable from '../tables/DataTable';
import ConfirmDialog from './ConfirmDialog';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CrudPage({
  title,
  subtitle,
  endpoint,
  queryKey,
  columns: columnsDef,
  formFields = [],
  canCreate = true,
  canEdit = true,
  canDelete = true,
  createLabel = 'إضافة',
  editLabel = 'تعديل',
  deleteConfirmMessage = 'هل أنت متأكد من الحذف؟',
  extraFilters,
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const qc = useQueryClient();
  const key = queryKey || endpoint;

  const { data, isLoading } = useQuery({
    queryKey: [key, page, search],
    queryFn: () => api.get(endpoint, { params: { page, limit: 20, search: search || undefined } }).then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editItem
        ? api.put(`${endpoint}/${editItem.id}`, payload)
        : api.post(endpoint, payload),
    onSuccess: () => {
      toast.success(editItem ? 'تم التحديث بنجاح' : 'تمت الإضافة بنجاح');
      setShowForm(false);
      setEditItem(null);
      setForm({});
      qc.invalidateQueries([key]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`${endpoint}/${id}`),
    onSuccess: () => {
      toast.success('تم الحذف بنجاح');
      setDeleteTarget(null);
      qc.invalidateQueries([key]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'حدث خطأ في الحذف'),
  });

  const openCreate = () => {
    setEditItem(null);
    const defaults = {};
    formFields.forEach((f) => { defaults[f.name] = f.defaultValue ?? ''; });
    setForm(defaults);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    const vals = {};
    formFields.forEach((f) => { vals[f.name] = item[f.name] ?? f.defaultValue ?? ''; });
    setForm(vals);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    formFields.forEach((f) => {
      if (f.type === 'number' && payload[f.name] !== '') payload[f.name] = Number(payload[f.name]);
      if (f.type === 'boolean') payload[f.name] = payload[f.name] === true || payload[f.name] === 'true';
    });
    saveMutation.mutate(payload);
  };

  const actionsColumn = (canEdit || canDelete)
    ? {
        key: '_actions',
        label: 'إجراءات',
        render: (row) => (
          <div className="flex gap-1">
            {canEdit && formFields.length > 0 && (
              <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title={editLabel}>
                <Edit className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="حذف">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
      }
    : null;

  const allColumns = actionsColumn ? [...columnsDef, actionsColumn] : columnsDef;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          {extraFilters}
          {canCreate && formFields.length > 0 && (
            <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              <span>{createLabel}</span>
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card mb-6 relative">
          <button onClick={() => { setShowForm(false); setEditItem(null); }} className="absolute top-4 left-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-bold mb-4 text-lg">{editItem ? editLabel : createLabel}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.map((f) => (
              <div key={f.name} className={f.fullWidth ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="input-field"
                    required={f.required}
                  >
                    <option value="">-- اختر --</option>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="input-field"
                    rows={3}
                    required={f.required}
                    placeholder={f.placeholder || f.label}
                  />
                ) : f.type === 'boolean' ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[f.name] === true || form[f.name] === 'true'}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{f.checkLabel || 'نعم'}</span>
                  </label>
                ) : (
                  <input
                    type={f.type || 'text'}
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="input-field"
                    required={f.required}
                    placeholder={f.placeholder || f.label}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2 md:col-span-2 pt-2">
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                {saveMutation.isPending ? 'جاري الحفظ...' : editItem ? 'تحديث' : 'إضافة'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="btn-secondary">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={allColumns}
        data={data?.data}
        loading={isLoading}
        pagination={data?.meta}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="بحث..."
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="تأكيد الحذف"
        message={deleteConfirmMessage}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
      />
    </div>
  );
}
