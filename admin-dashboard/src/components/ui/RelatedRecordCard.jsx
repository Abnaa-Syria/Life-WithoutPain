import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StatusBadge from './StatusBadge';
import { Calendar, Clock, ExternalLink } from 'lucide-react';
import { formatAppointmentDateTime } from '../../utils/appointment';

export default function RelatedRecordCard({
  title,
  subtitle,
  status,
  detailPath,
  appointment,
  appointmentId,
  meta,
  children,
}) {
  const { t } = useTranslation();
  const apptId = appointment?.id || appointmentId;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="min-w-0">
          {detailPath ? (
            <Link to={detailPath} className="font-bold text-lg text-[var(--text-primary)] hover:text-primary-600">
              {title}
            </Link>
          ) : (
            <h3 className="font-bold text-lg text-[var(--text-primary)]">{title}</h3>
          )}
          {subtitle && (
            <p className="text-[var(--text-muted)] text-sm flex items-center gap-2 mt-1">
              <Clock size={14} /> {subtitle}
            </p>
          )}
        </div>
        {status && <StatusBadge status={status} />}
      </div>

      {meta && <p className="text-sm text-[var(--text-muted)] mb-3">{meta}</p>}

      {children}

      {apptId && (
        <Link
          to={`/appointments/${apptId}`}
          className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary-600 hover:underline"
        >
          <Calendar size={14} />
          {appointment ? formatAppointmentDateTime(appointment) : `${t('appointments.appointment')} #${apptId}`}
          <ExternalLink size={12} />
        </Link>
      )}
    </div>
  );
}
