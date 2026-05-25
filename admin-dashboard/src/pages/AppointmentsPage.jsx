import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/ui/DataTable';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import toast from 'react-hot-toast';
import useLanguage from '../hooks/useLanguage';

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-appointments', filter],
    queryFn: () => api.get('/admin/appointments', { params: { status: filter || undefined } }).then((r) => r.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/appointments/${id}/status`, { status }),
    onSuccess: () => {
      toast.success(t('messages.status_updated'));
      qc.invalidateQueries(['admin-appointments']);
    },
  });

  const columns = [
    { 
      header: t('appointments.patient') || 'Patient', 
      accessorKey: 'patient.user.fullName',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold">{row.original.patient?.user?.fullName}</span>
          <span className="text-xs text-[var(--text-muted)]">{row.original.patient?.user?.phone}</span>
        </div>
      )
    },
    { 
      header: t('appointments.doctor') || 'Doctor', 
      accessorKey: 'doctor.user.fullName',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold">{row.original.doctor?.user?.fullName}</span>
          <span className="text-xs text-[var(--text-muted)]">{row.original.doctor?.speciality?.nameAr}</span>
        </div>
      )
    },
    { 
      header: t('appointments.date') || 'Date & Time', 
      accessorKey: 'startTime',
      cell: ({ row }) => {
        const startTime = row.original.startTime;
        if (!startTime) return <span className="text-[var(--text-muted)]">-</span>;
        
        const date = new Date(startTime);
        if (isNaN(date.getTime())) return <span className="text-[var(--text-muted)]">Invalid Date</span>;

        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {format(date, 'dd MMM yyyy', { locale: isRTL ? arSA : undefined })}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {format(date, 'hh:mm a')}
            </span>
          </div>
        );
      }
    },
    { 
      header: t('appointments.type') || 'Type', 
      accessorKey: 'type',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {t(`appointments.types.${row.original.type?.toLowerCase()}`) || row.original.type}
        </Badge>
      )
    },
    { 
      header: t('appointments.fee') || 'Fee', 
      accessorKey: 'fee',
      cell: ({ row }) => `${row.original.fee} ر.س`
    },
    { 
      header: t('common.status'), 
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variants = { 
          PENDING: 'warning', 
          CONFIRMED: 'primary', 
          COMPLETED: 'success', 
          CANCELLED: 'danger',
          NO_SHOW: 'secondary'
        };
        return <Badge variant={variants[status]}>{t(`status.${status.toLowerCase()}`) || status}</Badge>;
      }
    },
  ];

  const renderActions = (appointment) => (
    <div className="flex gap-1 border-r border-[var(--border-color)] mr-2 pr-2 rtl:mr-0 rtl:ml-2 rtl:pr-0 rtl:pl-2 rtl:border-r-0 rtl:border-l">
      {appointment.status === 'PENDING' && (
        <button 
          onClick={() => updateStatusMutation.mutate({ id: appointment.id, status: 'CONFIRMED' })} 
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title={t('common.confirm_action')}
        >
          <CheckCircle size={16} />
        </button>
      )}
      {['PENDING', 'CONFIRMED'].includes(appointment.status) && (
        <button 
          onClick={() => updateStatusMutation.mutate({ id: appointment.id, status: 'CANCELLED' })} 
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title={t('common.cancel')}
        >
          <XCircle size={16} />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <PageHeader 
        title={t('sidebar.appointments')} 
        breadcrumbs={[{ label: t('sidebar.dashboard'), path: '/' }, { label: t('sidebar.appointments'), path: '/appointments' }]}
        action={
          <div className="flex gap-4">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-48 h-10">
              <option value="">{t('common.all_statuses')}</option>
              <option value="PENDING">{t('status.pending')}</option>
              <option value="CONFIRMED">{t('status.confirmed')}</option>
              <option value="COMPLETED">{t('status.completed')}</option>
              <option value="CANCELLED">{t('status.cancelled')}</option>
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t('dashboard.stats.today_appointments')} value={data?.meta?.totalItems || 0} icon={Calendar} color="indigo" />
        <StatCard label={t('dashboard.stats.pending_confirmation')} value={3} icon={Clock} color="yellow" />
        <StatCard label={t('dashboard.stats.completed_today')} value={8} icon={CheckCircle} color="green" />
        <StatCard label={t('dashboard.stats.cancelled_today')} value={1} icon={XCircle} color="red" />
      </div>

      <Card>
        <DataTable 
          columns={columns} 
          data={data?.data} 
          isLoading={isLoading} 
          onView={(item) => navigate(`/appointments/${item.id}`)}
          onEdit={(item) => console.log('Edit appointment', item)}
          onDelete={async (item) => {
            if (await confirmDelete({ text: `Appointment #${item.id}` })) deleteMutation.mutate(item.id);
          }}
          renderCustomActions={renderActions}
          searchPlaceholder={t('appointments.search_placeholder') || 'Search by patient or doctor...'}
        />
      </Card>
    </div>
  );
}
