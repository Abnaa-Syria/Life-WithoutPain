function calcAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function mapAppointmentListItem(appt) {
  return {
    id: String(appt.id),
    appointmentType: appt.appointmentType,
    status: appt.status,
    dateTime: appt.appointmentDate,
    patient: {
      id: appt.patient?.id,
      name: appt.patient?.user?.fullName,
    },
    fees: Number(appt.amount) || 0,
  };
}

function mapAppointmentDetail(appt) {
  return {
    id: String(appt.id),
    appointmentType: appt.appointmentType,
    status: appt.status,
    dateTime: appt.appointmentDate,
    fees: Number(appt.amount) || 0,
    reasonForVisit: appt.notes,
    patient: {
      name: appt.patient?.user?.fullName,
      gender: appt.patient?.gender,
      age: calcAge(appt.patient?.dateOfBirth),
    },
    attachments: appt.attachments || [],
  };
}

function mapPatientListItem(p) {
  return {
    id: String(p.id),
    name: p.user?.fullName,
    age: p.age ?? calcAge(p.dateOfBirth),
    lastVisitDate: p.lastVisitDate,
  };
}

function mapNotification(n) {
  return {
    id: String(n.id),
    title: n.titleAr || n.titleEn || n.title,
    type: n.type,
    createdAt: n.createdAt,
    isRead: n.isRead,
  };
}

function mapSpecializations(items) {
  return items.map((s) => ({
    id: String(s.id),
    name: s.nameEn || s.nameAr,
  }));
}

module.exports = {
  calcAge,
  mapAppointmentListItem,
  mapAppointmentDetail,
  mapPatientListItem,
  mapNotification,
  mapSpecializations,
};
