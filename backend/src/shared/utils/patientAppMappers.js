const config = require('../../config');

function getAppointmentDateTime(appointment) {
  const date = new Date(appointment.appointmentDate);
  const [hours, minutes] = (appointment.startTime || '00:00').split(':').map(Number);
  date.setHours(hours, minutes || 0, 0, 0);
  return date;
}

function isComingAppointment(appointment, windowHours = config.patient.comingWindowHours) {
  const dt = getAppointmentDateTime(appointment);
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowHours * 60 * 60 * 1000);
  return (
    dt > now
    && dt <= windowEnd
    && !['CANCELLED', 'COMPLETED'].includes(appointment.status)
  );
}

function computeAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

function mapInsurance(insurance) {
  const now = new Date();
  const isExpired = insurance.expiryDate && new Date(insurance.expiryDate) < now;
  return {
    id: insurance.id,
    insuranceCompany: insurance.provider
      ? { id: insurance.provider.id, nameAr: insurance.provider.nameAr, nameEn: insurance.provider.nameEn, logoUrl: insurance.provider.logoUrl }
      : null,
    labelNumber: insurance.policyNumber || insurance.memberId,
    memberId: insurance.memberId,
    expiryDate: insurance.expiryDate,
    attachmentUrl: insurance.attachmentUrl,
    verificationStatus: insurance.verificationStatus,
    isActive: insurance.verificationStatus === 'VERIFIED' && !isExpired,
    isPrimary: insurance.isPrimary,
  };
}

function mapAppointmentListItem(appointment) {
  const doctor = appointment.doctor;
  const speciality = doctor?.speciality;
  return {
    id: appointment.id,
    doctorName: doctor?.user?.fullName || null,
    specializations: speciality
      ? [{ id: speciality.id, nameAr: speciality.nameAr, nameEn: speciality.nameEn }]
      : [],
    appointmentDate: appointment.appointmentDate,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    fees: appointment.amount,
    status: appointment.status,
    isComing: isComingAppointment(appointment),
    service: appointment.service
      ? { id: appointment.service.id, nameAr: appointment.service.nameAr, nameEn: appointment.service.nameEn, type: appointment.service.type }
      : null,
    familyMemberId: appointment.familyMemberId,
  };
}

function mapAppointmentDetail(appointment) {
  const doctor = appointment.doctor;
  return {
    ...mapAppointmentListItem(appointment),
    notes: appointment.notes,
    paymentStatus: appointment.paymentStatus,
    insuranceStatus: appointment.insuranceStatus,
    doctor: doctor
      ? {
          id: doctor.id,
          fullName: doctor.user?.fullName,
          avatarUrl: doctor.user?.avatarUrl,
          yearsOfExperience: doctor.yearsOfExperience,
          rating: { average: doctor.ratingAverage, count: doctor.ratingCount },
          address: doctor.clinicAddress || doctor.workplace || doctor.city,
          speciality: doctor.speciality,
          certificates: (doctor.verificationDocuments || [])
            .filter((d) => d.reviewStatus === 'APPROVED')
            .map((d) => ({ id: d.id, fileUrl: d.fileUrl, fileType: d.fileType })),
        }
      : null,
    attachments: appointment.attachments,
    prescriptions: appointment.prescriptions,
    reports: appointment.reports,
    labTests: appointment.labTests,
  };
}

function mapFamilyMember(member) {
  return {
    id: member.id,
    fullName: member.fullName,
    residenceCardNumber: member.residenceCardNumber,
    relationType: member.relationType,
    gender: member.gender,
    dateOfBirth: member.dateOfBirth,
    age: computeAge(member.dateOfBirth),
    phone: member.phone,
    notes: member.notes,
  };
}

function mapPatientProfile(profile) {
  const user = profile.user;
  return {
    id: profile.id,
    userId: user?.id,
    fullName: user?.fullName,
    identityNumber: profile.identityNumber,
    email: user?.email,
    phone: user?.phone,
    gender: profile.gender,
    dateOfBirth: profile.dateOfBirth,
    age: computeAge(profile.dateOfBirth),
    avatarUrl: user?.avatarUrl,
    city: profile.city,
    address: profile.address,
    preferredLanguage: user?.preferredLanguage,
  };
}

function mapDirectoryPrescription(item) {
  return {
    id: item.id,
    createdAt: item.createdAt,
    diagnosis: item.diagnosis,
    pdfUrl: item.pdfUrl,
    doctor: item.doctor
      ? {
          id: item.doctor.id,
          fullName: item.doctor.user?.fullName,
          speciality: item.doctor.speciality,
        }
      : null,
  };
}

function mapDirectoryReport(item) {
  return {
    id: item.id,
    title: item.title,
    createdAt: item.createdAt,
    pdfUrl: item.pdfUrl,
    doctor: item.doctor
      ? {
          id: item.doctor.id,
          fullName: item.doctor.user?.fullName,
          speciality: item.doctor.speciality,
        }
      : null,
  };
}

function mapCatalogItem(item) {
  return {
    id: item.id,
    nameAr: item.nameAr,
    nameEn: item.nameEn,
    description: item.description ?? null,
  };
}

function mapMedicalProfileAttachment(attachment) {
  return {
    id: attachment.id,
    fileUrl: attachment.fileUrl,
    mimeType: attachment.mimeType,
    title: attachment.title,
    createdAt: attachment.createdAt,
  };
}

function mapHomeServiceRequestListItem(request) {
  return {
    id: request.id,
    service: request.service
      ? {
          id: request.service.id,
          nameAr: request.service.nameAr,
          nameEn: request.service.nameEn,
          type: request.service.type,
        }
      : null,
    visitAddress: request.visitAddress,
    preferredDate: request.preferredDate,
    status: request.status,
    requiresInsuranceApproval: request.requiresInsuranceApproval,
    assignedDoctorName: request.assignedDoctor?.user?.fullName || null,
  };
}

function mapHomeServiceRequestDetail(request) {
  return {
    ...mapHomeServiceRequestListItem(request),
    notes: request.notes,
    assignedDoctor: request.assignedDoctor
      ? {
          id: request.assignedDoctor.id,
          fullName: request.assignedDoctor.user?.fullName,
          avatarUrl: request.assignedDoctor.user?.avatarUrl,
        }
      : null,
    appointmentId: request.appointmentId,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

function mapMedicalProfile(profile) {
  if (!profile) return null;

  const chronicDiseases = profile.chronicDiseases || [];
  const medications = profile.medications || [];
  const allergies = profile.allergies || [];
  const attachments = profile.attachments || [];

  return {
    id: profile.id,
    patientId: profile.patientId,
    chronicDiseaseIds: chronicDiseases.map((d) => d.id),
    chronicDiseases: chronicDiseases.map(mapCatalogItem),
    medicationIds: medications.map((m) => m.id),
    medications: medications.map(mapCatalogItem),
    allergyIds: allergies.map((a) => a.id),
    allergies: allergies.map(mapCatalogItem),
    reportAttachments: attachments.map(mapMedicalProfileAttachment),
    surgeries: profile.surgeries ?? null,
    familyHistory: profile.familyHistory ?? null,
    notes: profile.notes ?? null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

module.exports = {
  getAppointmentDateTime,
  isComingAppointment,
  computeAge,
  mapInsurance,
  mapAppointmentListItem,
  mapAppointmentDetail,
  mapHomeServiceRequestListItem,
  mapHomeServiceRequestDetail,
  mapFamilyMember,
  mapPatientProfile,
  mapDirectoryPrescription,
  mapDirectoryReport,
  mapCatalogItem,
  mapMedicalProfileAttachment,
  mapMedicalProfile,
};
