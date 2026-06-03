const config = require('../../config');
const { mapEntityForApi, pickLocalized } = require('../../i18n/mapLocalized');

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
      ? {
          id: insurance.provider.id,
          name: insurance.provider.name ?? insurance.provider.code ?? null,
          logoUrl: insurance.provider.logoUrl,
        }
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

function mapInsuranceCase(insuranceCase, options = {}) {
  const approval = insuranceCase.approvals?.[0];
  const base = {
    id: insuranceCase.id,
    status: insuranceCase.status,
    caseType: insuranceCase.caseType,
    requestType: insuranceCase.requestType,
    requestedAmount: insuranceCase.requestedAmount ?? approval?.requestedAmount,
    approvedAmount: approval?.approvedAmount ?? null,
    approvalStatus: approval?.approvalStatus ?? null,
    provider: insuranceCase.provider
      ? {
          id: insuranceCase.provider.id,
          name: insuranceCase.provider.name ?? insuranceCase.provider.code ?? null,
        }
      : null,
    submittedAt: insuranceCase.submittedAt,
    resolvedAt: insuranceCase.resolvedAt,
    appointmentId: insuranceCase.appointmentId,
    homeServiceRequestId: insuranceCase.homeServiceRequestId,
    notes: insuranceCase.notes,
  };
  if (!options.detailed) return base;
  return {
    ...base,
    patientInsurance: insuranceCase.patientInsurance ? mapInsurance(insuranceCase.patientInsurance) : null,
    appointment: insuranceCase.appointment
      ? {
          id: insuranceCase.appointment.id,
          appointmentDate: insuranceCase.appointment.appointmentDate,
          startTime: insuranceCase.appointment.startTime,
          amount: insuranceCase.appointment.amount,
          insuranceStatus: insuranceCase.appointment.insuranceStatus,
        }
      : null,
    homeServiceRequest: insuranceCase.homeServiceRequest
      ? mapHomeServiceRequestListItem(insuranceCase.homeServiceRequest)
      : null,
    approvals: (insuranceCase.approvals || []).map((a) => ({
      id: a.id,
      requestedProcedure: a.requestedProcedure,
      approvalStatus: a.approvalStatus,
      requestedAmount: a.requestedAmount,
      approvedAmount: a.approvedAmount,
      decisionNotes: a.decisionNotes,
      decidedAt: a.decidedAt,
    })),
  };
}

function mapSubSpecializationItem(item, locale = 'en', translationMap = null) {
  const translations = translationMap?.get?.(item.id) || {};
  return {
    id: item.id,
    specialityId: item.specialityId,
    name: item.name ?? pickLocalized(translations, locale, 'name'),
    description: item.description ?? pickLocalized(translations, locale, 'description'),
  };
}

function mapSpecialization(speciality) {
  if (!speciality) return null;
  return {
    id: speciality.id,
    name: speciality.name ?? null,
    description: speciality.description ?? null,
    iconUrl: speciality.iconUrl ?? null,
  };
}

function mapSpecializationWithSubs(speciality, locale = 'en', subTranslationMap = null) {
  return {
    ...mapSpecialization(speciality),
    subSpecializations: (speciality.subSpecialities || []).map((sub) =>
      mapSubSpecializationItem(sub, locale, subTranslationMap),
    ),
  };
}

function mapDoctorCertificatesForPatient(documents) {
  return (documents || [])
    .filter((d) => d.reviewStatus === 'APPROVED')
    .map((d) => ({
      id: d.id,
      name: d.fileType || d.title || 'Certificate',
      fileType: d.fileType,
    }));
}

function mapDoctorForPatientList(doctor, extras = {}) {
  const speciality = doctor.speciality;
  const subs = doctor.subSpecialities || [];
  return {
    id: doctor.id,
    doctorName: doctor.user?.fullName || null,
    avatarUrl: doctor.user?.avatarUrl || null,
    specialization: mapSpecialization(speciality),
    subSpecializations: subs.map(mapSubSpecializationItem),
    yearsOfExperience: doctor.yearsOfExperience,
    consultationPrice: doctor.consultationFee != null ? Number(doctor.consultationFee) : null,
    rating: { average: doctor.ratingAverage, count: doctor.ratingCount },
    city: doctor.city,
    address: doctor.clinicAddress || doctor.workplace || doctor.city,
    totalAppointmentsCount: extras.totalAppointmentsCount ?? 0,
    availableAppointmentsCount: extras.availableAppointmentsCount,
  };
}

function mapDoctorForPatientDetail(doctor, extras = {}) {
  const reviews = (doctor.reviews || []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    patientName: r.patient?.user?.fullName,
    createdAt: r.createdAt,
  }));
  return {
    ...mapDoctorForPatientList(doctor, extras),
    bio: doctor.bio,
    bioAr: doctor.bioAr,
    reviews,
    certificates: mapDoctorCertificatesForPatient(doctor.verificationDocuments),
    workingHours: doctor.availability || [],
  };
}

function mapAppointmentListItem(appointment) {
  const doctor = appointment.doctor;
  const speciality = doctor?.speciality;
  const insuranceCase = appointment.insuranceCases?.[0];
  return {
    id: appointment.id,
    insuranceRequestId: insuranceCase?.id ?? appointment.approvedInsuranceCaseId ?? null,
    insuranceStatus: appointment.insuranceStatus,
    requiresInsuranceApproval: appointment.requiresInsuranceApproval,
    approvedAmount: insuranceCase?.approvals?.[0]?.approvedAmount ?? null,
    paymentStatus: appointment.paymentStatus,
    doctorName: doctor?.user?.fullName || null,
    specializations: speciality
      ? [{ id: speciality.id, name: speciality.name ?? null }]
      : [],
    appointmentDate: appointment.appointmentDate,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    fees: appointment.amount,
    status: appointment.status,
    isComing: isComingAppointment(appointment),
    service: appointment.service
      ? { id: appointment.service.id, name: appointment.service.name ?? null, type: appointment.service.type }
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
    price: appointment.amount != null ? Number(appointment.amount) : null,
    doctor: doctor ? mapDoctorForPatientDetail(doctor) : null,
    attachments: appointment.attachments,
    prescriptions: appointment.prescriptions,
    reports: appointment.reports,
    labTests: appointment.labTests,
  };
}

function mapFamilyMember(member) {
  return {
    id: member.id,
    name: member.fullName,
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
    name: user?.fullName,
    fullName: user?.fullName,
    language: user?.preferredLanguage,
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

function mapDoctorBrief(doctor) {
  if (!doctor) return null;
  return {
    doctorName: doctor.user?.fullName,
    specialization: mapSpecialization(doctor.speciality),
  };
}

function composeAppointmentDateTime(appointment) {
  if (!appointment?.appointmentDate) return null;
  const date = new Date(appointment.appointmentDate);
  const [hours, minutes] = (appointment.startTime || '00:00').split(':').map(Number);
  date.setHours(hours, minutes || 0, 0, 0);
  return date.toISOString();
}

function mapPrescriptionListItem(item) {
  return {
    id: item.id,
    doctorName: item.doctor?.user?.fullName,
    specialization: mapSpecialization(item.doctor?.speciality),
    summary: item.diagnosis || item.notes || null,
    appointmentDateTime: composeAppointmentDateTime(item.appointment),
    createdAt: item.createdAt,
  };
}

function mapPrescriptionDetail(item) {
  return {
    id: item.id,
    doctorName: item.doctor?.user?.fullName,
    appointmentDate: item.appointment?.appointmentDate,
    prescriptionNumber: `RX-${item.id}`,
    summary: item.notes || item.diagnosis,
    diagnosis: item.diagnosis,
    appointmentDateTime: composeAppointmentDateTime(item.appointment),
    medicines: (item.items || []).map((m) => ({
      medicineName: m.medicineName,
      description: m.instructions || null,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      timing: null,
      sideEffectsNotes: null,
    })),
    pdfUrl: item.pdfUrl,
  };
}

function mapReportListItem(item) {
  return {
    id: item.id,
    doctorName: item.doctor?.user?.fullName,
    specialization: mapSpecialization(item.doctor?.speciality),
    summary: item.summary || item.diagnosis,
    appointmentDateTime: composeAppointmentDateTime(item.appointment),
    createdAt: item.createdAt,
  };
}

function mapReportDetail(item) {
  return {
    id: item.id,
    doctorName: item.doctor?.user?.fullName,
    specialization: mapSpecialization(item.doctor?.speciality),
    prescriptionNumber: item.prescriptionNumber || (item.prescription ? `RX-${item.prescription.id}` : null),
    appointmentDateTime: composeAppointmentDateTime(item.appointment),
    visitReason: item.visitReason,
    summary: item.summary,
    symptoms: item.symptoms,
    clinicalTests: item.clinicalExam || item.clinicalFindings || null,
    resultSummary: item.resultSummary,
    results: item.resultsList,
    nextAppointmentDate: item.nextAppointmentDate,
    attachments: item.attachments || [],
    pdfUrl: item.pdfUrl,
  };
}

function mapXrayListItem(item) {
  return {
    id: item.id,
    doctorName: null,
    specialization: null,
    summary: item.title || item.description,
    createdAt: item.createdAt,
    uploadedFile: item.fileUrl,
  };
}

function mapXrayDetail(item) {
  return {
    ...mapXrayListItem(item),
    pdfUrl: item.fileUrl,
    mimeType: item.mimeType,
  };
}

function mapDirectoryPrescription(item) {
  return mapPrescriptionListItem({ ...item, appointment: item.appointment });
}

function mapDirectoryReport(item) {
  return mapReportListItem(item);
}

function mapTimelineItem(recordType, item) {
  const base = {
    recordType,
    createdAt: item.createdAt,
    uploadedFile: item.uploadedFile || item.fileUrl || item.pdfUrl || null,
  };
  if (recordType === 'report') {
    return { ...base, id: item.id, summary: item.summary || item.diagnosis };
  }
  if (recordType === 'prescription') {
    return { ...base, id: item.id, summary: item.diagnosis || item.notes };
  }
  if (recordType === 'xray') {
    return { ...base, id: item.id, summary: item.title || item.description };
  }
  if (recordType === 'labTest') {
    return { ...base, id: item.id, summary: item.notes || item.testType || 'Lab test' };
  }
  return base;
}

function mapNotificationForPatient(notification, language = 'ar') {
  return {
    id: notification.id,
    title: notification.title ?? pickLocalized(notification._translations, language, 'title'),
    body: notification.body ?? pickLocalized(notification._translations, language, 'body'),
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    metadata: notification.metadata,
  };
}

function mapBookingListItem(item) {
  return item;
}

function mapCatalogItem(item) {
  return {
    id: item.id,
    name: item.name ?? null,
    description: item.description ?? null,
    category: item.category ?? null,
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
  const insuranceCase = request.insuranceCase;
  return {
    id: request.id,
    insuranceRequestId: insuranceCase?.id ?? request.approvedInsuranceCaseId ?? null,
    insuranceStatus: request.insuranceStatus,
    requiresInsuranceApproval: request.requiresInsuranceApproval,
    approvedAmount: insuranceCase?.approvals?.[0]?.approvedAmount ?? null,
    service: request.service
      ? {
          id: request.service.id,
          name: request.service.name ?? null,
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
  mapInsuranceCase,
  mapSubSpecializationItem,
  mapSpecialization,
  mapSpecializationWithSubs,
  mapDoctorCertificatesForPatient,
  mapDoctorForPatientList,
  mapDoctorForPatientDetail,
  mapAppointmentListItem,
  mapAppointmentDetail,
  mapHomeServiceRequestListItem,
  mapHomeServiceRequestDetail,
  mapFamilyMember,
  mapPatientProfile,
  mapDoctorBrief,
  mapPrescriptionListItem,
  mapPrescriptionDetail,
  mapReportListItem,
  mapReportDetail,
  mapXrayListItem,
  mapXrayDetail,
  mapDirectoryPrescription,
  mapDirectoryReport,
  mapTimelineItem,
  mapNotificationForPatient,
  mapBookingListItem,
  mapCatalogItem,
  mapMedicalProfileAttachment,
  mapMedicalProfile,
};
