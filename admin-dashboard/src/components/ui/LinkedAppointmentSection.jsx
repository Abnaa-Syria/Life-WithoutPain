import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DetailsSection from './DetailsSection';
import DetailItem from './DetailItem';
import Badge from './Badge';
import { Calendar, ExternalLink } from 'lucide-react';
import { formatAppointmentDateTime } from '../../utils/appointment';
import { formatCurrency } from '../../utils/formatCurrency';

export default function LinkedAppointmentSection({ appointment, appointmentId }) {
  const { t } = useTranslation();
  const appt = appointment || (appointmentId ? { id: appointmentId } : null);

  if (!appt?.id) {
    return (
      <DetailsSection title={t('appointments.linked_appointment') || 'Linked appointment'} icon={Calendar}>
        <DetailItem label="—" value={t('common.no_data')} />
      </DetailsSection>
    );
  }

  return (
    <DetailsSection title={t('appointments.linked_appointment') || 'Linked appointment'} icon={Calendar}>
      <DetailItem
        label={t('appointments.appointment')}
        value={
          <Link
            to={`/appointments/${appt.id}`}
            className="inline-flex items-center gap-1.5 text-primary-600 hover:underline font-semibold"
          >
            #{appt.id}
            <ExternalLink size={14} />
          </Link>
        }
      />
      {appt.appointmentDate && (
        <DetailItem label={t('appointments.date')} value={formatAppointmentDateTime(appt)} />
      )}
      {appt.status && (
        <DetailItem
          label={t('common.status')}
          value={
            <Badge variant="secondary">
              {t(`status.${appt.status?.toLowerCase()}`) || appt.status}
            </Badge>
          }
        />
      )}
      {appt.appointmentType && (
        <DetailItem label={t('appointments.type')} value={appt.appointmentType} />
      )}
      {appt.service?.nameAr && (
        <DetailItem label={t('sidebar.services')} value={appt.service.nameAr} />
      )}
      {appt.patient?.user?.fullName && (
        <DetailItem label={t('appointments.patient')} value={appt.patient.user.fullName} />
      )}
      {appt.doctor?.user?.fullName && (
        <DetailItem label={t('appointments.doctor')} value={appt.doctor.user.fullName} />
      )}
      {appt.amount != null && (
        <DetailItem label={t('appointments.fee')} value={formatCurrency(appt.amount, t)} />
      )}
    </DetailsSection>
  );
}
