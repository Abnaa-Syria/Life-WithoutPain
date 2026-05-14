import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import DataTable from './DataTable';
import PageHeader from './PageHeader';
import Card from './Card';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import useConfirmDelete from '../../hooks/useConfirmDelete';
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
  createLabel,
  editLabel,
  deleteConfirmMessage,
  detailPath,
  extraFilters,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirmDelete = useConfirmDelete();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});

  const key = queryKey || endpoint;

  const { data, isLoading } = useQuery({
    queryKey: [key],
    queryFn: () => api.get(endpoint).then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingItem
        ? api.put(`${endpoint}/${editingItem.id}`, payload)
        : api.post(endpoint, payload),
    onSuccess: () => {
      toast.success(t('messages.saved'));
      setIsModalOpen(false);
      qc.invalidateQueries([key]);
    },
    onError: (err) => toast.error(err.response?.data?.message || t('messages.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`${endpoint}/${id}`),
    onSuccess: () => {
      toast.success(t('messages.deleted'));
      qc.invalidateQueries([key]);
    },
  });

  const openForm = (item = null) => {
    setEditingItem(item);
    if (item) {
      const vals = {};
      formFields.forEach((f) => { vals[f.name] = item[f.name] ?? f.defaultValue ?? ''; });
      setForm(vals);
    } else {
      const defaults = {};
      formFields.forEach((f) => { defaults[f.name] = f.defaultValue ?? ''; });
      setForm(defaults);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    formFields.forEach((f) => {
      if (f.type === 'number' && payload[f.name] !== '') payload[f.name] = Number(payload[f.name]);
    });
    saveMutation.mutate(payload);
  };

  const columns = columnsDef.map(col => ({
    header: col.label,
    accessorKey: col.key,
    cell: col.render 
      ? ({ row }) => col.render(row.original) 
      : ({ getValue }) => getValue() ?? '-'
  }));

  return (
    <div className="space-y-8">
      <PageHeader 
        title={title} 
        breadcrumbs={[{ label: t('sidebar.dashboard'), path: '/' }, { label: title, path: '#' }]}
        action={
          <div className="flex gap-2">
            {extraFilters}
            {canCreate && (
              <button onClick={() => openForm()} className="btn btn-primary">
                <Plus size={18} />
                {createLabel || t('common.add_new')}
              </button>
            )}
          </div>
        }
      />

      <Card subtitle={subtitle}>
        <DataTable 
          columns={columns} 
          data={data?.data} 
          isLoading={isLoading} 
          onEdit={canEdit ? openForm : undefined}
          onView={detailPath ? (item) => navigate(`${detailPath}/${item.id}`) : undefined}
          onDelete={canDelete ? async (item) => {
            if (await confirmDelete({ text: deleteConfirmMessage })) deleteMutation.mutate(item.id);
          } : undefined}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? (editLabel || t('common.edit')) : (createLabel || t('common.add_new'))}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.map((f) => (
              <div key={f.name} className={f.fullWidth ? 'md:col-span-2' : ''}>
                <label className="label">{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="input"
                    required={f.required}
                  >
                    <option value="">-- {t('common.select')} --</option>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="input h-24 py-3"
                    required={f.required}
                    placeholder={f.placeholder}
                  />
                ) : f.type === 'boolean' ? (
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <input
                      type="checkbox"
                      checked={!!form[f.name]}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                      className="w-4 h-4 rounded border-[var(--border-color)] text-indigo-600"
                    />
                    <span className="text-sm font-medium">{f.label}</span>
                  </label>
                ) : (
                  <input
                    type={f.type || 'text'}
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="input"
                    required={f.required}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary flex-1">
              {saveMutation.isPending ? t('common.saving') : t('common.save')}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
