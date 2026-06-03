import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import DetailsHeader from '../components/ui/DetailsHeader';
import DetailsSection from '../components/ui/DetailsSection';
import DetailItem from '../components/ui/DetailItem';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import FilePreviewer from '../components/ui/FilePreviewer';
import RelatedRecordCard from '../components/ui/RelatedRecordCard';
import { Calendar, User, Stethoscope, Briefcase, FileText, Activity, Paperclip, FlaskConical, ExternalLink } from 'lucide-react';
import { formatAppointmentDateTime } from '../utils/appointment';
import { formatCurrency } from '../utils/formatCurrency';

export default function AppointmentDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const backPath = searchParams.get('back') || '/appointments';

  const { data: response, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => api.get(`/admin/appointments/${id}`).then(res => res.data),
  });

  if (isLoading) return <LoadingSkeleton type="table" />;
  const appt = response?.data;

  if (!appt) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  const attachments = appt.attachments?.map((a) => ({
    url: a.fileUrl || a,
    name: a.name || a.type || 'Attachment',
    mimeType: a.mimeType || (a.type === 'IMAGE' ? 'image/jpeg' : a.type === 'DOCUMENT' ? 'application/pdf' : undefined),
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DetailsHeader 
        title={`${t('appointments.appointment')} #${appt.id}`}
        subtitle={formatAppointmentDateTime(appt)}
        backPath={backPath}
        badges={appt.status ? [{ status: appt.status }] : []}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <DetailsSection title={t('appointments.patient')} icon={User}>
            <DetailItem
              label={t('patients.name')}
              value={
                appt.patient?.id ? (
                  <Link to={`/patients/${appt.patient.id}`} className="text-primary-600 hover:underline inline-flex items-center gap-1">
                    {appt.patient?.user?.fullName}
                    <ExternalLink size={14} />
                  </Link>
                ) : appt.patient?.user?.fullName
              }
            />
            <DetailItem label={t('patients.phone')} value={appt.patient?.user?.phone} />
            <DetailItem label={t('patients.email')} value={appt.patient?.user?.email} />
          </DetailsSection>

          <DetailsSection title={t('appointments.doctor')} icon={Stethoscope}>
            <DetailItem
              label={t('doctors.name')}
              value={
                appt.doctor?.id ? (
                  <Link to={`/doctors/${appt.doctor.id}`} className="text-primary-600 hover:underline inline-flex items-center gap-1">
                    {appt.doctor?.user?.fullName}
                    <ExternalLink size={14} />
                  </Link>
                ) : appt.doctor?.user?.fullName
              }
            />
            <DetailItem label={t('doctors.speciality')} value={appt.doctor?.speciality?.nameAr} />
            <DetailItem label={t('doctors.phone')} value={appt.doctor?.user?.phone} />
          </DetailsSection>

          <DetailsSection title={t('appointments.details')} icon={Calendar}>
            <DetailItem label={t('appointments.date')} value={formatAppointmentDateTime(appt)} />
            <DetailItem label={t('appointments.type')} value={appt.appointmentType} />
            <DetailItem label={t('appointments.fee')} value={formatCurrency(appt.amount, t)} />
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DetailsSection title={t('appointments.prescriptions') || 'Prescriptions'} icon={FileText} layout="stack">
          {appt.prescriptions?.length > 0 ? appt.prescriptions.map((p) => (
            <div key={p.id} className="col-span-full">
              <RelatedRecordCard
                title={`Rx #${p.id}`}
                subtitle={p.diagnosis}
                detailPath={`/prescriptions/${p.id}`}
                meta={p.items?.length ? `${p.items.length} ${t('medical.medications') || 'medications'}` : undefined}
              />
            </div>
          )) : (
            <div className="col-span-full text-center text-[var(--text-muted)] py-4 text-sm">{t('common.no_data')}</div>
          )}
        </DetailsSection>

        <DetailsSection title={t('sidebar.reports')} icon={Activity} layout="stack">
          {appt.reports?.length > 0 ? appt.reports.map((r) => (
            <div key={r.id} className="col-span-full">
              <RelatedRecordCard
                title={`${t('medical.reports')} #${r.id}`}
                subtitle={r.diagnosis || r.visitReason}
                detailPath={`/reports/${r.id}`}
              />
            </div>
          )) : (
            <div className="col-span-full text-center text-[var(--text-muted)] py-4 text-sm">{t('common.no_data')}</div>
          )}
        </DetailsSection>

        <DetailsSection title={t('sidebar.lab_tests') || 'Lab tests'} icon={FlaskConical} layout="stack">
          {appt.labTests?.length > 0 ? appt.labTests.map((test) => (
            <div key={test.id} className="col-span-full">
              <RelatedRecordCard
                title={test.title}
                subtitle={test.notes}
                status={test.status}
                detailPath={`/lab-tests/${test.id}`}
                meta={test.results?.length ? `${test.results.length} ${t('medical.lab_results') || 'results'}` : undefined}
              />
            </div>
          )) : (
            <div className="col-span-full text-center text-[var(--text-muted)] py-4 text-sm">{t('common.no_data')}</div>
          )}
        </DetailsSection>
      </div>
    </div>
  );
}
