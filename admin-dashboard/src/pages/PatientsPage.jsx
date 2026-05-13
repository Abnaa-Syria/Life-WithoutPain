import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import DataTable from '../components/ui/DataTable';
import StatCard from '../components/ui/StatCard';
import Drawer from '../components/ui/Drawer';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { useTranslation } from 'react-i18next';
import { Users, UserPlus, Heart, Activity } from 'lucide-react';
import useConfirmDelete from '../hooks/useConfirmDelete';
import toast from 'react-hot-toast';

export default function PatientsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirmDelete = useConfirmDelete();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-patients'],
    queryFn: () => api.get('/admin/patients').then((r) => r.data),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const updateMutation = useMutation({
    mutationFn: (payload) => api.put(`/admin/patients/${editingPatient.id}`, payload),
    onSuccess: () => {
      toast.success(t('messages.saved'));
      setIsDrawerOpen(false);
      qc.invalidateQueries(['admin-patients']);
    },
    onError: (e) => toast.error(e.response?.data?.message || t('messages.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/patients/${id}`),
    onSuccess: () => {
      toast.success(t('messages.deleted'));
      qc.invalidateQueries(['admin-patients']);
    },
  });

  const openEdit = (patient) => {
    setEditingPatient(patient);
    setValue('gender', patient.gender);
    setValue('city', patient.city);
    setValue('bloodType', patient.bloodType);
    setValue('height', patient.height);
    setValue('weight', patient.weight);
    setValue('address', patient.address);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (patient) => {
    const ok = await confirmDelete({
      title: t('confirm.delete_patient_title') || 'Delete Patient?',
      text: t('confirm.delete_patient_text', { name: patient.user?.fullName }),
    });
    if (ok) deleteMutation.mutate(patient.id);
  };

  const onSubmit = (data) => {
    updateMutation.mutate({
      ...data,
      height: data.height ? Number(data.height) : null,
      weight: data.weight ? Number(data.weight) : null,
    });
  };

  const columns = [
    { header: t('patients.name') || 'Name', accessorKey: 'user.fullName' },
    { header: t('patients.email') || 'Email', accessorKey: 'user.email' },
    { header: t('patients.phone') || 'Phone', accessorKey: 'user.phone' },
    { 
      header: t('patients.gender') || 'Gender', 
      accessorKey: 'gender',
      cell: ({ row }) => t(`common.${row.original.gender?.toLowerCase()}`) || row.original.gender 
    },
    { header: t('patients.city') || 'City', accessorKey: 'city' },
    { 
      header: t('patients.insurance') || 'Insurance', 
      accessorKey: 'insuranceLinked',
      cell: ({ row }) => (
        <span className={`badge ${row.original.insuranceLinked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
          {row.original.insuranceLinked ? t('common.linked') : t('common.not_linked')}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title={t('sidebar.patients')} 
        breadcrumbs={[{ label: t('sidebar.dashboard'), path: '/' }, { label: t('sidebar.patients'), path: '/patients' }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t('dashboard.stats.total_patients')} value={data?.meta?.totalItems || 0} icon={Users} color="indigo" />
        <StatCard label={t('dashboard.stats.new_this_month')} value={12} icon={UserPlus} color="green" />
        <StatCard label={t('dashboard.stats.active_cases')} value={5} icon={Activity} color="purple" />
        <StatCard label={t('dashboard.stats.insurance_linked')} value={8} icon={Heart} color="red" />
      </div>

      <Card>
        <DataTable 
          columns={columns} 
          data={data?.data} 
          isLoading={isLoading} 
          onEdit={openEdit}
          onView={(item) => navigate(`/patients/${item.id}`)}
          onDelete={handleDelete}
          searchPlaceholder={t('patients.search_placeholder') || 'Search by name or email...'}
        />
      </Card>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={t('patients.edit_patient') || 'Edit Patient Profile'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="label">{t('patients.gender') || 'Gender'}</label>
              <select {...register('gender')} className="input">
                <option value="MALE">{t('common.male') || 'Male'}</option>
                <option value="FEMALE">{t('common.female') || 'Female'}</option>
              </select>
            </div>
            <div>
              <label className="label">{t('patients.city') || 'City'}</label>
              <input {...register('city')} className="input" />
            </div>
            <div>
              <label className="label">{t('patients.blood_type') || 'Blood Type'}</label>
              <select {...register('bloodType')} className="input">
                {['O_POSITIVE', 'O_NEGATIVE', 'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE'].map(v => (
                  <option key={v} value={v}>{v.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('patients.height') || 'Height (cm)'}</label>
                <input type="number" {...register('height')} className="input" />
              </div>
              <div>
                <label className="label">{t('patients.weight') || 'Weight (kg)'}</label>
                <input type="number" {...register('weight')} className="input" />
              </div>
            </div>
            <div>
              <label className="label">{t('patients.address') || 'Address'}</label>
              <textarea {...register('address')} className="input h-24 py-3" />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button type="submit" disabled={updateMutation.isPending} className="btn btn-primary flex-1">
              {updateMutation.isPending ? t('common.saving') : t('common.save')}
            </button>
            <button type="button" onClick={() => setIsDrawerOpen(false)} className="btn btn-secondary flex-1">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
