import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import RelatedRecordCard from '../ui/RelatedRecordCard';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const ENDPOINT_MAP = {
  appointments: '/admin/appointments',
  prescriptions: '/admin/prescriptions',
  reports: '/admin/reports',
  'lab-tests': '/admin/lab-tests',
};

const FILTER_KEY = {
  appointments: 'patientId',
  prescriptions: 'patientId',
  reports: 'patientId',
  'lab-tests': 'patientId',
};

const DOCTOR_FILTER_KEY = {
  appointments: 'doctorId',
  prescriptions: 'doctorId',
  reports: 'doctorId',
  'lab-tests': 'doctorId',
};

function mapRecord(type, row, t) {
  if (type === 'appointments') {
    return {
      id: row.id,
      title: `${new Date(row.appointmentDate).toLocaleDateString()} ${row.startTime || ''}`.trim(),
      subtitle: `${row.doctor?.user?.fullName || '—'} • ${row.service?.nameEn || row.appointmentType || ''}`,
      status: row.status,
      detailPath: `/appointments/${row.id}`,
      appointmentId: row.id,
      meta: row.patient?.user?.fullName,
    };
  }
  if (type === 'prescriptions') {
    return {
      id: row.id,
      title: `${t('medical.prescription')} #${row.id}`,
      subtitle: `${new Date(row.createdAt).toLocaleDateString()} • ${row.doctor?.user?.fullName || '—'}`,
      status: row.status,
      detailPath: `/prescriptions/${row.id}`,
      appointment: row.appointment,
      appointmentId: row.appointmentId,
      meta: row.diagnosis,
    };
  }
  if (type === 'reports') {
    return {
      id: row.id,
      title: `${t('medical.report')} #${row.id}`,
      subtitle: `${new Date(row.createdAt).toLocaleDateString()} • ${row.doctor?.user?.fullName || '—'}`,
      status: row.status,
      detailPath: `/reports/${row.id}`,
      appointment: row.appointment,
      appointmentId: row.appointmentId,
      meta: row.diagnosis,
    };
  }
  if (type === 'lab-tests') {
    return {
      id: row.id,
      title: row.title,
      subtitle: `${new Date(row.requestedAt || row.createdAt).toLocaleDateString()} • ${row.doctor?.user?.fullName || '—'}`,
      status: row.status,
      detailPath: `/lab-tests/${row.id}`,
      appointment: row.appointment,
      appointmentId: row.appointmentId,
      meta: row.notes,
    };
  }
  return null;
}

export default function EntityMedicalRecordsTab({
  type,
  entityKind,
  entityId,
  embeddedItems = [],
  backBasePath,
  threshold = 20,
}) {
  const { t } = useTranslation();
  const endpoint = ENDPOINT_MAP[type];
  const filterKey = entityKind === 'doctor' ? DOCTOR_FILTER_KEY[type] : FILTER_KEY[type];
  const useFetch = !embeddedItems?.length || embeddedItems.length >= threshold;

  const { data: response, isLoading } = useQuery({
    queryKey: ['entity-records', type, entityKind, entityId],
    queryFn: () => api.get(endpoint, { params: { [filterKey]: entityId, limit: 50, page: 1 } }).then((r) => r.data),
    enabled: useFetch && !!entityId,
  });

  const items = useFetch ? (response?.data ?? []) : embeddedItems;

  if (isLoading && useFetch) return <LoadingSkeleton type="table" />;

  if (!items?.length) {
    return (
      <div className="p-12 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] text-[var(--text-muted)]">
        {t('common.no_data')}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {items.map((row) => {
        const mapped = mapRecord(type, row, t);
        if (!mapped) return null;
        const detailPath = `${mapped.detailPath}?back=${encodeURIComponent(`${backBasePath}/${type}`)}`;
        return (
          <RelatedRecordCard
            key={mapped.id}
            title={mapped.title}
            subtitle={mapped.subtitle}
            status={mapped.status}
            detailPath={detailPath}
            appointment={mapped.appointment}
            appointmentId={mapped.appointmentId}
            meta={mapped.meta}
          />
        );
      })}
    </div>
  );
}
