export function formatAppointmentDateTime(appointment) {
  if (!appointment) return '—';
  const date = appointment.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString()
    : '—';
  const time =
    appointment.startTime && appointment.endTime
      ? `${appointment.startTime} – ${appointment.endTime}`
      : appointment.startTime || '';
  return time ? `${date} • ${time}` : date;
}

export function formatAppointmentSummary(appointment) {
  if (!appointment) return '—';
  const parts = [
    formatAppointmentDateTime(appointment),
    appointment.service?.nameAr || appointment.service?.nameEn,
    appointment.doctor?.user?.fullName,
  ].filter(Boolean);
  return parts.join(' • ');
}
