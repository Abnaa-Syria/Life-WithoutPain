import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import DetailsHeader from '../components/ui/DetailsHeader';
import DetailsSection from '../components/ui/DetailsSection';
import DetailItem from '../components/ui/DetailItem';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Badge from '../components/ui/Badge';
import FilePreviewer from '../components/ui/FilePreviewer';
import { Calendar, User, Stethoscope, Briefcase, FileText, Activity, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

export default function AppointmentDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: response, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => api.get(`/admin/appointments/${id}`).then(res => res.data),
  });

  if (isLoading) return <LoadingSkeleton type="table" />;
  const appt = response?.data;

  if (!appt) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  const formatDate = (dateStr, formatStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Invalid Date' : format(date, formatStr);
  };

  const attachments = appt.attachments?.map(a => ({ url: a.fileUrl || a, name: a.name || 'Attachment' })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DetailsHeader 
        title={`${t('appointments.appointment')} #${appt.id}`}
        subtitle={formatDate(appt.startTime, 'PPPPpppp')}
        backPath="/appointments"
        badges={[
          { label: t(`status.${appt.status?.toLowerCase()}`), className: 'bg-indigo-100 text-indigo-700' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <DetailsSection title={t('appointments.patient')} icon={User}>
            <DetailItem label={t('patients.name')} value={appt.patient?.user?.fullName} />
            <DetailItem label={t('patients.phone')} value={appt.patient?.user?.phone} />
            <DetailItem label={t('patients.email')} value={appt.patient?.user?.email} />
          </DetailsSection>

          <DetailsSection title={t('appointments.doctor')} icon={Stethoscope}>
            <DetailItem label={t('doctors.name')} value={appt.doctor?.user?.fullName} />
            <DetailItem label={t('doctors.speciality')} value={appt.doctor?.speciality?.nameAr} />
            <DetailItem label={t('doctors.phone')} value={appt.doctor?.user?.phone} />
          </DetailsSection>

          <DetailsSection title={t('appointments.details')} icon={Calendar}>
            <DetailItem label={t('appointments.date')} value={formatDate(appt.startTime, 'yyyy-MM-dd')} />
            <DetailItem label={t('appointments.time')} value={`${formatDate(appt.startTime, 'HH:mm')} - ${formatDate(appt.endTime, 'HH:mm')}`} />
            <DetailItem label={t('appointments.type')} value={appt.type} />
            <DetailItem label={t('appointments.fee')} value={`${appt.fee} ر.س`} />
            <DetailItem label={t('appointments.cancellation_reason')} value={appt.cancellationReason || 'N/A'} fullWidth />
          </DetailsSection>
        </div>

        <div className="space-y-6">
          <DetailsSection title={t('sidebar.services')} icon={Briefcase}>
            <DetailItem label={t('services.name')} value={appt.service?.nameAr} />
            <DetailItem label={t('services.type')} value={appt.service?.type} />
            <DetailItem label={t('services.description')} value={appt.service?.descriptionAr} fullWidth />
          </DetailsSection>

          <DetailsSection title={t('appointments.attachments') || 'Attachments'} icon={Paperclip}>
            <div className="col-span-full">
              <FilePreviewer files={attachments} height="350px" />
            </div>
          </DetailsSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DetailsSection title={t('appointments.prescriptions') || 'Prescriptions'} icon={FileText}>
              {appt.prescriptions?.map((p, idx) => (
                <DetailItem key={idx} label={`Rx #${p.id}`} value={p.diagnosis} />
              )) || <div className="col-span-full text-center text-[var(--text-muted)] py-2 text-xs">{t('common.no_data')}</div>}
            </DetailsSection>

            <DetailsSection title={t('sidebar.reports')} icon={Activity}>
              {appt.reports?.map((r, idx) => (
                <DetailItem key={idx} label={`Report #${r.id}`} value={r.diagnosis} />
              )) || <div className="col-span-full text-center text-[var(--text-muted)] py-2 text-xs">{t('common.no_data')}</div>}
            </DetailsSection>
          </div>
        </div>
      </div>
    </div>
  );
}
