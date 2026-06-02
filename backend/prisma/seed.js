const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../src/constants');
const {
  seedRbac,
  seedStaffUsers,
  seedDemoUserPermissionOverrides,
  verifySeededStaffRbac,
  assertRoleExists,
} = require('./seed-rbac');

const prisma = new PrismaClient();

const now = () => new Date();
const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);
const toDateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function phone(n) {
  return `+9665${String(n).padStart(8, '0')}`;
}

async function upsertUser({ fullName, email, phoneNumber, role, passwordHash, isVerified = true, status = 'ACTIVE' }) {
  await assertRoleExists(prisma, role);
  return prisma.user.upsert({
    where: { email },
    update: { fullName, phone: phoneNumber, role, status, isVerified, passwordHash },
    create: { fullName, email, phone: phoneNumber, role, status, isVerified, passwordHash },
  });
}

async function ensurePatientProfileWithIdEqualsUserId(user, data) {
  const existing = await prisma.patientProfile.findUnique({ where: { userId: user.id } });
  if (existing) return existing;
  // IMPORTANT: Review model uses patientId to link to BOTH User and PatientProfile in current schema.
  // To satisfy both, we create PatientProfile.id = User.id.
  return prisma.patientProfile.create({
    data: {
      id: user.id,
      userId: user.id,
      ...data,
    },
  });
}

async function ensureDoctorProfile(user, data) {
  const existing = await prisma.doctorProfile.findUnique({ where: { userId: user.id } });
  if (existing) {
    return prisma.doctorProfile.update({ where: { userId: user.id }, data });
  }
  return prisma.doctorProfile.create({ data: { userId: user.id, ...data } });
}

async function main() {
  console.log('Seeding database (full dashboard coverage + RBAC)...');

  // RBAC must exist before any user is created (User.role ↔ Role.name)
  await seedRbac(prisma);

  const passwordHash = await bcrypt.hash('Password123', 12);

  // ─────────────────────────────────────────────────────────────
  // 1) Core staff accounts (dashboard) — tied to RBAC roles
  // ─────────────────────────────────────────────────────────────
  const {
    superAdmin,
    medicalAdmin,
    insuranceStaff,
    supportStaff,
    accountant,
  } = await seedStaffUsers(prisma, {
    upsertUser,
    phoneFn: phone,
    passwordHash,
  });

  // ─────────────────────────────────────────────────────────────
  // 2) Reference data (specialities, services, insurance providers)
  // ─────────────────────────────────────────────────────────────
  const specialitiesSeed = [
    { id: 1, nameAr: 'طب عام', nameEn: 'General Medicine', descriptionAr: 'الطب العام والرعاية الأولية', descriptionEn: 'General medicine and primary care', sortOrder: 1 },
    { id: 2, nameAr: 'طب الأسنان', nameEn: 'Dentistry', descriptionAr: 'علاج وتجميل الأسنان', descriptionEn: 'Dental care and cosmetics', sortOrder: 2 },
    { id: 3, nameAr: 'طب العيون', nameEn: 'Ophthalmology', descriptionAr: 'أمراض وجراحة العيون', descriptionEn: 'Eye diseases and surgery', sortOrder: 3 },
    { id: 4, nameAr: 'أمراض القلب', nameEn: 'Cardiology', descriptionAr: 'أمراض القلب والأوعية الدموية', descriptionEn: 'Heart and vascular diseases', sortOrder: 4 },
    { id: 5, nameAr: 'الأمراض الجلدية', nameEn: 'Dermatology', descriptionAr: 'الأمراض الجلدية والتجميل', descriptionEn: 'Skin diseases and cosmetics', sortOrder: 5 },
    { id: 6, nameAr: 'طب الأطفال', nameEn: 'Pediatrics', descriptionAr: 'الرعاية الطبية للأطفال', descriptionEn: 'Medical care for children', sortOrder: 6 },
    { id: 7, nameAr: 'الطب النفسي', nameEn: 'Psychiatry', descriptionAr: 'الصحة النفسية والعلاج النفسي', descriptionEn: 'Mental health and psychotherapy', sortOrder: 7 },
    { id: 8, nameAr: 'العظام', nameEn: 'Orthopedics', descriptionAr: 'أمراض وجراحة العظام', descriptionEn: 'Bone diseases and surgery', sortOrder: 8 },
  ];

  for (const s of specialitiesSeed) {
    await prisma.speciality.upsert({ where: { id: s.id }, update: s, create: s });
  }

  const subSpecialitiesSeed = [
    { specialityId: 1, nameAr: 'السكري', nameEn: 'Diabetes', sortOrder: 1 },
    { specialityId: 1, nameAr: 'ضغط الدم', nameEn: 'Hypertension', sortOrder: 2 },
    { specialityId: 4, nameAr: 'قسطرة القلب', nameEn: 'Cardiac Catheterization', sortOrder: 1 },
    { specialityId: 4, nameAr: 'فشل القلب', nameEn: 'Heart Failure', sortOrder: 2 },
    { specialityId: 6, nameAr: 'حديثي الولادة', nameEn: 'Neonatology', sortOrder: 1 },
  ];
  for (const sub of subSpecialitiesSeed) {
    const existing = await prisma.subSpeciality.findFirst({
      where: { specialityId: sub.specialityId, nameEn: sub.nameEn },
    });
    if (existing) {
      await prisma.subSpeciality.update({ where: { id: existing.id }, data: sub });
    } else {
      await prisma.subSpeciality.create({ data: sub });
    }
  }

  const servicesSeed = [
    { id: 1, nameAr: 'استشارة عن بعد', nameEn: 'Remote Consultation', descriptionAr: 'استشارة عبر الفيديو/الصوت', descriptionEn: 'Video/voice consultation', type: 'REMOTE', sortOrder: 1, isActive: true },
    { id: 2, nameAr: 'زيارة منزلية', nameEn: 'Home Visit', descriptionAr: 'زيارة الطبيب للمنزل', descriptionEn: 'Doctor home visit', type: 'HOME', sortOrder: 2, isActive: true },
    { id: 3, nameAr: 'زيارة العيادة', nameEn: 'Clinic Visit', descriptionAr: 'زيارة داخل العيادة', descriptionEn: 'Clinic appointment', type: 'CLINIC', sortOrder: 3, isActive: true },
  ];
  for (const s of servicesSeed) {
    await prisma.service.upsert({ where: { id: s.id }, update: s, create: s });
  }

  const providersSeed = [
    { code: 'BUPA', nameAr: 'بوبا العربية', nameEn: 'Bupa Arabia', apiMode: 'MANUAL', isActive: true },
    { code: 'TAWUNIYA', nameAr: 'التعاونية', nameEn: 'Tawuniya', apiMode: 'MANUAL', isActive: true },
    { code: 'MEDGULF', nameAr: 'ميدغلف', nameEn: 'MedGulf', apiMode: 'MANUAL', isActive: true },
    { code: 'ALLIANZ', nameAr: 'أليانز', nameEn: 'Allianz', apiMode: 'API', isActive: true },
    { code: 'MOCK', nameAr: 'تأمين تجريبي', nameEn: 'Mock Insurance', apiMode: 'HYBRID', isActive: true },
  ];

  const insuranceProviders = [];
  for (const p of providersSeed) {
    const provider = await prisma.insuranceProvider.upsert({
      where: { code: p.code },
      update: p,
      create: { ...p },
    });
    insuranceProviders.push(provider);
  }

  // ─────────────────────────────────────────────────────────────
  // 3) Doctors (approved + pending + rejected) + docs + availability + services
  // ─────────────────────────────────────────────────────────────
  const doctorsUsers = [];
  const doctorBase = [
    { email: 'dr.ahmed@example.com', fullName: 'د. أحمد الخالدي', specialityId: 1, city: 'الرياض', licenseNumber: 'LIC-001', verificationStatus: 'APPROVED', isPubliclyBookable: true, fee: 150, years: 10 },
    { email: 'dr.sara@example.com', fullName: 'د. سارة العمري', specialityId: 5, city: 'جدة', licenseNumber: 'LIC-002', verificationStatus: 'APPROVED', isPubliclyBookable: true, fee: 200, years: 7 },
    { email: 'dr.hassan.pending@example.com', fullName: 'د. حسن الغامدي', specialityId: 4, city: 'الدمام', licenseNumber: 'LIC-003', verificationStatus: 'PENDING', isPubliclyBookable: false, fee: 220, years: 9 },
    { email: 'dr.noor.rejected@example.com', fullName: 'د. نور الحربي', specialityId: 2, city: 'مكة', licenseNumber: 'LIC-004', verificationStatus: 'REJECTED', isPubliclyBookable: false, fee: 180, years: 6 },
  ];

  let doctorPhoneSeed = 11111111;
  for (const d of doctorBase) {
    const user = await upsertUser({
      fullName: d.fullName,
      email: d.email,
      phoneNumber: phone(doctorPhoneSeed++),
      role: ROLES.DOCTOR,
      passwordHash,
      isVerified: true,
    });
    doctorsUsers.push(user);

    const profile = await ensureDoctorProfile(user, {
      specialityId: d.specialityId,
      title: 'استشاري',
      bio: 'Experienced specialist',
      bioAr: 'طبيب بخبرة عالية',
      yearsOfExperience: d.years,
      licenseNumber: d.licenseNumber,
      licenseExpiryDate: new Date('2028-06-01'),
      workplace: 'مجمع طبي',
      city: d.city,
      consultationFee: d.fee,
      followUpFee: Math.round(d.fee * 0.5),
      verificationStatus: d.verificationStatus,
      isPubliclyBookable: d.isPubliclyBookable,
      isAvailable: true,
      ratingAverage: 4.4,
      ratingCount: 12,
    });

    // Verification documents
    const docCount = d.verificationStatus === 'PENDING' ? 2 : 3;
    for (let i = 0; i < docCount; i++) {
      await prisma.doctorVerificationDocument.create({
        data: {
          doctorId: profile.id,
          fileUrl: i % 2 === 0 ? `/uploads/download.jpeg` : `/uploads/sample.pdf`,
          fileType: 'LICENSE',
          reviewStatus: d.verificationStatus === 'APPROVED' ? 'APPROVED' : d.verificationStatus === 'REJECTED' ? 'REJECTED' : 'PENDING',
          reviewNotes: d.verificationStatus === 'REJECTED' ? 'Document is not clear' : null,
          reviewedBy: d.verificationStatus === 'PENDING' ? null : medicalAdmin.id,
          reviewedAt: d.verificationStatus === 'PENDING' ? null : now(),
        },
      });
    }

    // Availability (for approved + pending, to test schedule screens)
    await prisma.doctorAvailability.createMany({
      data: [
        { doctorId: profile.id, dayOfWeek: 'SUNDAY', periodType: 'MORNING', startTime: '09:00', endTime: '12:00', slotDurationMinutes: 30, breakDurationMinutes: 5, isActive: true },
        { doctorId: profile.id, dayOfWeek: 'MONDAY', periodType: 'AFTERNOON', startTime: '14:00', endTime: '18:00', slotDurationMinutes: 30, breakDurationMinutes: 5, isActive: true },
      ],
      skipDuplicates: true,
    });

    // Services mapping
    const serviceIds = d.specialityId % 2 === 0 ? [1, 3] : [1, 2];
    for (const sid of serviceIds) {
      await prisma.doctorService.upsert({
        where: { doctorId_serviceId: { doctorId: profile.id, serviceId: sid } },
        update: {},
        create: { doctorId: profile.id, serviceId: sid },
      });
    }
  }

  const doctors = await prisma.doctorProfile.findMany({ include: { user: true } });
  const approvedDoctors = doctors.filter((d) => d.verificationStatus === 'APPROVED' && d.isPubliclyBookable);

  // ─────────────────────────────────────────────────────────────
  // 4) Patients (multiple) + medical profiles + family + medical files
  // ─────────────────────────────────────────────────────────────
  const patientsUsers = [];
  const patientBase = [
    { email: 'patient@example.com', fullName: 'محمد العلي', gender: 'MALE', city: 'الرياض', bloodType: 'O_POSITIVE' },
    { email: 'patient2@example.com', fullName: 'نورة السبيعي', gender: 'FEMALE', city: 'جدة', bloodType: 'A_POSITIVE' },
    { email: 'patient3@example.com', fullName: 'خالد الشهري', gender: 'MALE', city: 'الدمام', bloodType: 'B_POSITIVE' },
  ];

  let patientPhoneSeed = 22222222;
  for (const p of patientBase) {
    const user = await upsertUser({
      fullName: p.fullName,
      email: p.email,
      phoneNumber: phone(patientPhoneSeed++),
      role: ROLES.PATIENT,
      passwordHash,
      isVerified: true,
    });
    patientsUsers.push(user);

    const patientProfile = await ensurePatientProfileWithIdEqualsUserId(user, {
      gender: p.gender,
      dateOfBirth: new Date('1990-05-15'),
      bloodType: p.bloodType,
      height: 170,
      weight: 75,
      city: p.city,
      address: 'عنوان تجريبي',
      emergencyContactName: 'قريب',
      emergencyContactPhone: phone(90000000 + user.id),
      insuranceLinked: true,
    });

    let hypertension = await prisma.chronicDisease.findFirst({ where: { nameEn: 'Hypertension' } });
    if (!hypertension) {
      hypertension = await prisma.chronicDisease.create({
        data: { nameAr: 'ارتفاع ضغط الدم', nameEn: 'Hypertension', description: 'Seeded chronic disease' },
      });
    }
    let penicillin = await prisma.allergy.findFirst({ where: { nameEn: 'Penicillin' } });
    if (!penicillin) {
      penicillin = await prisma.allergy.create({
        data: { nameAr: 'بنسلين', nameEn: 'Penicillin', description: 'Seeded allergy' },
      });
    }
    let vitaminD = await prisma.medication.findFirst({ where: { nameEn: 'Vitamin D' } });
    if (!vitaminD) {
      vitaminD = await prisma.medication.create({
        data: { nameAr: 'فيتامين د', nameEn: 'Vitamin D', description: 'Seeded medication' },
      });
    }

    await prisma.medicalProfile.upsert({
      where: { patientId: patientProfile.id },
      update: {
        surgeries: 'None',
        familyHistory: 'Diabetes',
        notes: 'Seeded medical profile',
        chronicDiseases: { set: [{ id: hypertension.id }] },
        allergies: { set: [{ id: penicillin.id }] },
        medications: { set: [{ id: vitaminD.id }] },
      },
      create: {
        patientId: patientProfile.id,
        surgeries: 'None',
        familyHistory: 'Diabetes',
        notes: 'Seeded medical profile',
        chronicDiseases: { connect: [{ id: hypertension.id }] },
        allergies: { connect: [{ id: penicillin.id }] },
        medications: { connect: [{ id: vitaminD.id }] },
      },
    });

    // Family members
    await prisma.familyMember.createMany({
      data: [
        { patientId: patientProfile.id, fullName: 'ابن/ابنة 1', relationType: 'CHILD', gender: 'MALE', dateOfBirth: new Date('2015-01-01'), phone: phone(70000000 + user.id) },
        { patientId: patientProfile.id, fullName: 'والدة', relationType: 'MOTHER', gender: 'FEMALE', dateOfBirth: new Date('1965-01-01'), phone: phone(71000000 + user.id) },
      ],
      skipDuplicates: true,
    });

    // Medical files
    await prisma.medicalFile.createMany({
      data: [
        { patientId: patientProfile.id, uploadedBy: user.id, category: 'LAB_RESULT', fileUrl: `/uploads/sample.pdf`, mimeType: 'application/pdf', title: 'نتيجة تحليل', description: 'ملف تجريبي' },
        { patientId: patientProfile.id, uploadedBy: user.id, category: 'INSURANCE_DOCUMENT', fileUrl: `/uploads/download.jpeg`, mimeType: 'image/jpeg', title: 'ملف تأمين', description: 'ملف تجريبي' },
      ],
      skipDuplicates: true,
    });
  }

  const patients = await prisma.patientProfile.findMany({ include: { user: true } });

  // ─────────────────────────────────────────────────────────────
  // 5) Patient insurance linking (multiple providers & statuses)
  // ─────────────────────────────────────────────────────────────
  for (const patient of patients) {
    const primaryProvider = insuranceProviders[0];
    const secondaryProvider = insuranceProviders[1];
    await prisma.patientInsurance.createMany({
      data: [
        {
          patientId: patient.id,
          providerId: primaryProvider.id,
          memberId: `MEM-${patient.id}-A`,
          policyNumber: `POL-${patient.id}-A`,
          expiryDate: daysFromNow(365),
          attachmentUrl: `/uploads/sample.pdf`,
          isPrimary: true,
          verificationStatus: 'VERIFIED',
        },
        {
          patientId: patient.id,
          providerId: secondaryProvider.id,
          memberId: `MEM-${patient.id}-B`,
          policyNumber: `POL-${patient.id}-B`,
          expiryDate: daysFromNow(120),
          attachmentUrl: `/uploads/download.jpeg`,
          isPrimary: false,
          verificationStatus: patient.id % 2 === 0 ? 'PENDING' : 'REJECTED',
        },
      ],
      skipDuplicates: true,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 6) Appointments in multiple statuses + attachments + conversations + calls
  // ─────────────────────────────────────────────────────────────
  const appointmentRecords = [];
  const serviceRemote = await prisma.service.findUnique({ where: { id: 1 } });
  const serviceClinic = await prisma.service.findUnique({ where: { id: 3 } });

  // Create 9 appointments across patients/doctors with varied statuses
  const appointmentTemplates = [
    { offsetDays: 2, status: 'PENDING', paymentStatus: 'PENDING', insuranceStatus: 'PENDING_VERIFICATION' },
    { offsetDays: 3, status: 'CONFIRMED', paymentStatus: 'PENDING', insuranceStatus: 'APPROVED' },
    { offsetDays: -2, status: 'COMPLETED', paymentStatus: 'PAID', insuranceStatus: 'APPROVED' },
    { offsetDays: -5, status: 'CANCELLED', paymentStatus: 'FAILED', insuranceStatus: 'NOT_REQUIRED' },
    { offsetDays: -1, status: 'RESCHEDULED', paymentStatus: 'PENDING', insuranceStatus: 'PENDING_VERIFICATION' },
    { offsetDays: 1, status: 'CONFIRMED', paymentStatus: 'PAID', insuranceStatus: 'APPROVED' },
    { offsetDays: 0, status: 'IN_PROGRESS', paymentStatus: 'PAID', insuranceStatus: 'APPROVED' },
    { offsetDays: 7, status: 'CONFIRMED', paymentStatus: 'PENDING', insuranceStatus: 'NOT_REQUIRED' },
    { offsetDays: -10, status: 'NO_SHOW', paymentStatus: 'PENDING', insuranceStatus: 'NOT_REQUIRED' },
  ];

  // Add historical data for charts
  for (let i = 0; i < 150; i++) {
    const offsetDays = -Math.floor(Math.random() * 180); // Past 6 months
    const isCompleted = Math.random() > 0.1;
    appointmentTemplates.push({
      offsetDays,
      status: isCompleted ? 'COMPLETED' : 'CANCELLED',
      paymentStatus: isCompleted ? 'PAID' : 'FAILED',
      insuranceStatus: 'APPROVED'
    });
  }

  let idx = 0;
  for (const tpl of appointmentTemplates) {
    const patient = patients[idx % patients.length];
    const doctor = approvedDoctors[idx % approvedDoctors.length];
    const date = toDateOnly(daysFromNow(tpl.offsetDays));
    const startTime = idx % 2 === 0 ? '09:00' : '14:00';
    const endTime = idx % 2 === 0 ? '09:30' : '14:30';
    const serviceId = idx % 2 === 0 ? serviceRemote.id : serviceClinic.id;

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        specialityId: doctor.specialityId,
        serviceId,
        appointmentType: 'CONSULTATION',
        appointmentDate: date,
        startTime,
        endTime,
        status: tpl.status,
        insuranceStatus: tpl.insuranceStatus,
        paymentStatus: tpl.paymentStatus,
        amount: doctor.consultationFee,
        requiresInsuranceApproval: tpl.insuranceStatus !== 'NOT_REQUIRED',
        notes: 'Seeded appointment',
        cancellationReason: tpl.status === 'CANCELLED' ? 'Seeded cancellation' : null,
        confirmedAt: ['CONFIRMED', 'COMPLETED', 'IN_PROGRESS'].includes(tpl.status) ? date : null,
        startedAt: ['IN_PROGRESS', 'COMPLETED'].includes(tpl.status) ? date : null,
        completedAt: tpl.status === 'COMPLETED' ? date : null,
        createdBy: patient.userId,
      },
    });
    appointmentRecords.push(appointment);

    // Appointment attachments
    await prisma.appointmentAttachment.createMany({
      data: [
        { appointmentId: appointment.id, fileUrl: `/uploads/download.jpeg`, type: 'IMAGE', uploadedBy: patient.userId },
        { appointmentId: appointment.id, fileUrl: `/uploads/sample.pdf`, type: 'DOCUMENT', uploadedBy: patient.userId },
      ],
      skipDuplicates: true,
    });

    // Conversation + messages (for some appointments)
    if (['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(tpl.status)) {
      const conversation = await prisma.conversation.create({
        data: {
          appointmentId: appointment.id,
          patientId: patient.id,
          doctorId: doctor.id,
          isActive: true,
        },
      });
      await prisma.message.createMany({
        data: [
          { conversationId: conversation.id, senderId: patient.userId, messageType: 'TEXT', content: 'السلام عليكم دكتور، عندي ألم.', sentAt: now() },
          { conversationId: conversation.id, senderId: doctor.userId, messageType: 'TEXT', content: 'وعليكم السلام، صف لي الأعراض.', sentAt: now() },
        ],
        skipDuplicates: true,
      });
    }

    // Call session (for in-progress/completed)
    if (['IN_PROGRESS', 'COMPLETED'].includes(tpl.status)) {
      await prisma.callSession.create({
        data: {
          appointmentId: appointment.id,
          patientId: patient.id,
          doctorId: doctor.id,
          sessionType: 'VIDEO',
          provider: 'mock',
          sessionId: `MOCK-${appointment.id}`,
          joinUrlPatient: `https://mock-video.example.com/join/MOCK-${appointment.id}?role=patient`,
          joinUrlDoctor: `https://mock-video.example.com/join/MOCK-${appointment.id}?role=doctor`,
          status: tpl.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
          startedAt: now(),
          endedAt: tpl.status === 'COMPLETED' ? now() : null,
          durationSeconds: tpl.status === 'COMPLETED' ? 1200 : null,
          metadata: { seeded: true },
        },
      });
    }

    idx++;
  }

  // ─────────────────────────────────────────────────────────────
  // 7) Insurance cases + approvals (link to appointments when relevant)
  // ─────────────────────────────────────────────────────────────
  const caseForAppointment = appointmentRecords.find((a) => a.requiresInsuranceApproval);
  if (caseForAppointment) {
    const patient = await prisma.patientProfile.findUnique({ where: { id: caseForAppointment.patientId } });
    const provider = insuranceProviders[0];

    const insuranceCase = await prisma.insuranceCase.create({
      data: {
        patientId: patient.id,
        appointmentId: caseForAppointment.id,
        providerId: provider.id,
        caseType: 'PRE_AUTHORIZATION',
        requestType: 'CONSULTATION',
        status: 'UNDER_REVIEW',
        autoApproved: false,
        externalReference: `EXT-${caseForAppointment.id}`,
        submittedAt: now(),
        notes: 'Seeded insurance case - needs review',
      },
    });

    await prisma.insuranceApproval.create({
      data: {
        insuranceCaseId: insuranceCase.id,
        requestedProcedure: 'Consultation',
        approvalStatus: 'PENDING',
        requestedAmount: caseForAppointment.amount,
        approvedAmount: null,
        decisionNotes: null,
        decidedBy: null,
        decidedAt: null,
      },
    });

    // Another case already approved
    const approvedAppointment = appointmentRecords.find((a) => a.status === 'CONFIRMED');
    if (approvedAppointment) {
      const insuranceCase2 = await prisma.insuranceCase.create({
        data: {
          patientId: approvedAppointment.patientId,
          appointmentId: approvedAppointment.id,
          providerId: provider.id,
          caseType: 'PRE_AUTHORIZATION',
          requestType: 'CONSULTATION',
          status: 'APPROVED',
          autoApproved: true,
          externalReference: `EXT-${approvedAppointment.id}`,
          submittedAt: now(),
          resolvedAt: now(),
          notes: 'Auto-approved seeded case',
        },
      });
      await prisma.insuranceApproval.create({
        data: {
          insuranceCaseId: insuranceCase2.id,
          requestedProcedure: 'Consultation',
          approvalStatus: 'APPROVED',
          requestedAmount: approvedAppointment.amount,
          approvedAmount: approvedAppointment.amount,
          decisionNotes: 'Seeded approval',
          decidedBy: insuranceStaff.id,
          decidedAt: now(),
        },
      });
    }

    const patientPolicy = await prisma.patientInsurance.findFirst({
      where: { patientId: patient.id, isPrimary: true },
    });

    const rejectedAppt = appointmentRecords.find((a) => a.insuranceStatus === 'PENDING_VERIFICATION');
    if (rejectedAppt && patientPolicy) {
      const rejectedCase = await prisma.insuranceCase.create({
        data: {
          patientId: patient.id,
          appointmentId: rejectedAppt.id,
          patientInsuranceId: patientPolicy.id,
          providerId: provider.id,
          caseType: 'PRE_AUTHORIZATION',
          requestType: 'CONSULTATION',
          status: 'REJECTED',
          requestedAmount: rejectedAppt.amount,
          resolvedAt: now(),
          notes: 'Seeded rejected insurance request',
        },
      });
      await prisma.insuranceApproval.create({
        data: {
          insuranceCaseId: rejectedCase.id,
          requestedProcedure: 'Consultation',
          approvalStatus: 'REJECTED',
          requestedAmount: rejectedAppt.amount,
          decisionNotes: 'Not covered',
          decidedBy: insuranceStaff.id,
          decidedAt: now(),
        },
      });
    }

    const infoCasePatient = patients[1];
    const infoPolicy = infoCasePatient
      ? await prisma.patientInsurance.findFirst({ where: { patientId: infoCasePatient.id, isPrimary: true } })
      : null;
    if (infoCasePatient && infoPolicy) {
      await prisma.insuranceCase.create({
        data: {
          patientId: infoCasePatient.id,
          providerId: infoPolicy.providerId,
          patientInsuranceId: infoPolicy.id,
          caseType: 'INQUIRY',
          requestType: 'CONSULTATION',
          status: 'MORE_INFO_REQUESTED',
          requestedAmount: 200,
          notes: 'Seeded — awaiting patient documents',
        },
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 7b) Home service requests + insurance cases
  // ─────────────────────────────────────────────────────────────
  const homeService = await prisma.service.findFirst({ where: { type: 'HOME' } });
  if (homeService) {
    const homePatient = patients[0];
    const homePolicy = await prisma.patientInsurance.findFirst({
      where: { patientId: homePatient.id, isPrimary: true },
    });
    const homeProvider = insuranceProviders[0];

    const pendingHome = await prisma.homeServiceRequest.create({
      data: {
        patientId: homePatient.id,
        serviceId: homeService.id,
        visitAddress: '123 Seed Street, Riyadh',
        preferredDate: toDateOnly(daysFromNow(5)),
        requiresInsuranceApproval: true,
        insuranceStatus: 'PENDING_VERIFICATION',
        status: 'PENDING',
        createdBy: homePatient.userId,
      },
    });

    if (homePolicy) {
      const homeCase = await prisma.insuranceCase.create({
        data: {
          patientId: homePatient.id,
          homeServiceRequestId: pendingHome.id,
          patientInsuranceId: homePolicy.id,
          providerId: homeProvider.id,
          caseType: 'PRE_AUTHORIZATION',
          requestType: 'PROCEDURE',
          status: 'UNDER_REVIEW',
          requestedAmount: 350,
          notes: 'Seeded home visit insurance request',
        },
      });
      await prisma.insuranceApproval.create({
        data: {
          insuranceCaseId: homeCase.id,
          requestedProcedure: homeService.nameEn,
          approvalStatus: 'PENDING',
          requestedAmount: 350,
        },
      });
    }

    const approvedHome = await prisma.homeServiceRequest.create({
      data: {
        patientId: homePatient.id,
        serviceId: homeService.id,
        visitAddress: '456 Approved Ave, Riyadh',
        preferredDate: toDateOnly(daysFromNow(10)),
        requiresInsuranceApproval: true,
        insuranceStatus: 'APPROVED',
        status: 'SCHEDULED',
        createdBy: homePatient.userId,
      },
    });

    if (homePolicy) {
      const approvedHomeCase = await prisma.insuranceCase.create({
        data: {
          patientId: homePatient.id,
          homeServiceRequestId: approvedHome.id,
          patientInsuranceId: homePolicy.id,
          providerId: homeProvider.id,
          caseType: 'PRE_AUTHORIZATION',
          requestType: 'PROCEDURE',
          status: 'APPROVED',
          requestedAmount: 400,
          resolvedAt: now(),
          autoApproved: false,
        },
      });
      await prisma.homeServiceRequest.update({
        where: { id: approvedHome.id },
        data: { approvedInsuranceCaseId: approvedHomeCase.id },
      });
      await prisma.insuranceApproval.create({
        data: {
          insuranceCaseId: approvedHomeCase.id,
          requestedProcedure: homeService.nameEn,
          approvalStatus: 'APPROVED',
          requestedAmount: 400,
          approvedAmount: 320,
          decidedBy: insuranceStaff.id,
          decidedAt: now(),
        },
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 8) Support cases + messages (some linked to insurance/appointments)
  // ─────────────────────────────────────────────────────────────
  const anyInsuranceCase = await prisma.insuranceCase.findFirst({ orderBy: { createdAt: 'desc' } });
  const anyAppointment = appointmentRecords[0];
  const patientForSupport = await prisma.patientProfile.findUnique({
    where: { id: anyAppointment.patientId },
    select: { userId: true },
  });

  await prisma.supportContactInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      supportPhones: ['+966500000000', '+966112345678'],
      supportEmail: 'support@hayabilaalam.com',
      whatsappNumber: '+966500000000',
      whatsappLink: 'https://wa.me/966500000000',
      socialLinks: { facebook: 'https://facebook.com/hayabilaalam', instagram: '', twitter: '' },
      workingHours: { ar: 'الأحد - الخميس: 9:00 - 17:00', en: 'Sun - Thu: 9:00 AM - 5:00 PM' },
      descriptionAr: 'فريق الدعم متاح لمساعدتك في أي استفسار.',
      descriptionEn: 'Our support team is here to help with any inquiry.',
    },
  });

  const supportCase1 = await prisma.supportCase.create({
    data: {
      createdByUserId: patientForSupport.userId,
      creatorRole: 'PATIENT',
      patientId: anyAppointment.patientId,
      insuranceCaseId: anyInsuranceCase ? anyInsuranceCase.id : null,
      appointmentId: anyAppointment.id,
      assignedTo: supportStaff.id,
      category: 'INSURANCE',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      subject: 'مشكلة في موافقة التأمين',
      description: 'المريض يطلب تسريع الموافقة',
      resolutionNotes: null,
      lastActivityAt: now(),
    },
  });

  const firstDoctor = doctorsUsers[0];
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: firstDoctor.id } });
  if (doctorProfile) {
    await prisma.supportCase.create({
      data: {
        createdByUserId: firstDoctor.id,
        creatorRole: 'DOCTOR',
        doctorId: doctorProfile.id,
        category: 'TECHNICAL',
        priority: 'MEDIUM',
        status: 'OPEN',
        subject: 'مشكلة في تسجيل الدخول للتطبيق',
        description: 'لا أستطيع الوصول لجدول المواعيد',
        lastActivityAt: now(),
      },
    });
  }

  await prisma.supportMessage.createMany({
    data: [
      { supportCaseId: supportCase1.id, senderId: supportStaff.id, messageType: 'TEXT', content: 'تم استلام البلاغ وسيتم التواصل مع التأمين.', attachmentUrl: null },
      { supportCaseId: supportCase1.id, senderId: superAdmin.id, messageType: 'SYSTEM', content: 'تمت إحالة الحالة لفريق التأمين.', attachmentUrl: null },
    ],
    skipDuplicates: true,
  });

  // ─────────────────────────────────────────────────────────────
  // 9) Lab tests + results (linked to completed/in-progress appointment)
  // ─────────────────────────────────────────────────────────────
  const completedAppointment = appointmentRecords.find((a) => a.status === 'COMPLETED') || appointmentRecords[0];
  const doctorForCompleted = await prisma.doctorProfile.findUnique({ where: { id: completedAppointment.doctorId } });
  const labReq = await prisma.labTestRequest.create({
    data: {
      appointmentId: completedAppointment.id,
      patientId: completedAppointment.patientId,
      doctorId: completedAppointment.doctorId,
      title: 'تحليل دم شامل',
      notes: 'يرجى رفع النتائج خلال 24 ساعة',
      status: 'COMPLETED',
      requestedAt: now(),
    },
  });
  await prisma.labResult.create({
    data: {
      labTestRequestId: labReq.id,
      uploadedBy: (await prisma.patientProfile.findUnique({ where: { id: completedAppointment.patientId } })).userId,
      fileUrl: `/uploads/sample.pdf`,
      notes: 'نتيجة طبيعية',
      reviewedByDoctor: true,
      reviewedAt: now(),
    },
  });

  // ─────────────────────────────────────────────────────────────
  // 10) Reports + prescriptions (with items) for completed appointment
  // ─────────────────────────────────────────────────────────────
  // 10.1) Detailed Demo Report for a specific patient
  const patient1 = patients[0];
  const doctor1 = approvedDoctors[0];
  
  const report = await prisma.medicalReport.create({
    data: {
      appointmentId: completedAppointment.id,
      patientId: patient1.id,
      doctorId: doctor1.id,
      visitReason: 'متابعة دورية وفحص سنوي',
      diagnosis: 'حالة مستقرة - لا توجد مشاكل حادة',
      summary: 'تم إجراء الفحص السريري الشامل ومراجعة التاريخ المرضي. المريض يلتزم بنمط حياة صحي.',
      symptoms: 'لا يوجد',
      clinicalFindings: 'فحص الصدر والبطن سليم. لا توجد علامات التهاب.',
      vitals: { bp: '118/75', hr: 72, temp: '36.8' },
      clinicalExam: [
        { type: 'ضغط الدم (BP)', value: '118/75 mmHg' },
        { type: 'النبض (Heart Rate)', value: '72 bpm' },
        { type: 'درجة الحرارة (Temp)', value: '36.8 C' },
        { type: 'مستوى الأكسجين (SpO2)', value: '99%' },
        { type: 'الوزن (Weight)', value: '78 kg' },
        { type: 'الطول (Height)', value: '175 cm' }
      ],
      nextAppointmentDate: daysFromNow(90),
      recommendations: 'الاستمرار على ممارسة الرياضة، شرب الماء بكثرة، تقليل الأملاح في الطعام.',
      pdfUrl: `/uploads/sample.pdf`,
      attachments: {
        create: [
          { fileUrl: '/uploads/sample.pdf', type: 'DOCUMENT' },
          { fileUrl: '/uploads/download.jpeg', type: 'IMAGE' }
        ]
      }
    },
  });

  // 10.2) Another report for variety
  const patient2 = patients[1];
  const doctor2 = approvedDoctors[1] || doctor1;
  const inProgressAppt = appointmentRecords.find(a => a.status === 'IN_PROGRESS') || completedAppointment;

  await prisma.medicalReport.create({
    data: {
      appointmentId: inProgressAppt.id,
      patientId: patient2.id,
      doctorId: doctor2.id,
      visitReason: 'ألم حاد في الركبة اليمنى',
      diagnosis: 'التهاب في الأوتار',
      summary: 'ألم ناتج عن إجهاد بدني زائد.',
      clinicalExam: [
        { type: 'اختبار الحركة', value: 'محدود في الركبة اليمنى' },
        { type: 'مستوى الألم', value: '7/10' }
      ],
      nextAppointmentDate: daysFromNow(7),
      recommendations: 'وضع كمادات باردة، راحة تامة للقدم، استخدام المسكنات عند الضرورة.',
      pdfUrl: `/uploads/sample.pdf`,
    }
  });

  const prescription = await prisma.prescription.create({
    data: {
      appointmentId: completedAppointment.id,
      patientId: completedAppointment.patientId,
      doctorId: completedAppointment.doctorId,
      diagnosis: 'صداع توتري',
      notes: 'التزم بالجرعات',
      qrCodeValue: `RX-${completedAppointment.id}`,
      digitalSealValue: `SEAL-${completedAppointment.id}`,
      pdfUrl: `/uploads/sample.pdf`,
      items: {
        create: [
          { medicineName: 'Paracetamol', dosage: '500mg', frequency: '2/day', duration: '5 days', instructions: 'After meals' },
          { medicineName: 'Ibuprofen', dosage: '200mg', frequency: '1/day', duration: '3 days', instructions: 'If needed' },
        ],
      },
    },
    include: { items: true },
  });

  // ─────────────────────────────────────────────────────────────
  // 11) Payments (paid + pending) linked to appointments
  // ─────────────────────────────────────────────────────────────
  for (const appt of appointmentRecords) {
    const patient = await prisma.patientProfile.findUnique({ where: { id: appt.patientId } });
    const isPaid = appt.paymentStatus === 'PAID';
    await prisma.payment.create({
      data: {
        appointmentId: appt.id,
        patientId: patient.id,
        amount: appt.amount,
        currency: 'SAR',
        method: 'CREDIT_CARD',
        provider: 'mock',
        transactionReference: `MOCK-TX-${appt.id}`,
        status: isPaid ? 'PAID' : 'PENDING',
        paidAt: isPaid ? appt.appointmentDate : null,
        rawPayload: { seeded: true, appointmentId: appt.id },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 12) Claims + claim items + reconciliation
  // ─────────────────────────────────────────────────────────────
  const providerForClaims = insuranceProviders[0];
  const claimBatch = await prisma.claimBatch.create({
    data: {
      providerId: providerForClaims.id,
      periodStart: toDateOnly(daysFromNow(-30)),
      periodEnd: toDateOnly(daysFromNow(-1)),
      submissionType: 'MONTHLY',
      status: 'DRAFT',
      totalAmount: 0,
      totalClaims: 0,
    },
  });

  const eligibleAppointments = appointmentRecords.filter((a) => a.status === 'COMPLETED' && a.insuranceStatus === 'APPROVED').slice(0, 3);
  let totalAmount = 0;
  for (const appt of eligibleAppointments) {
    totalAmount += Number(appt.amount);
    await prisma.claimItem.create({
      data: {
        claimBatchId: claimBatch.id,
        appointmentId: appt.id,
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        amount: appt.amount,
        status: 'PENDING',
        externalReference: `CLAIM-${appt.id}`,
        notes: 'Seeded claim item',
      },
    });
  }

  await prisma.claimBatch.update({
    where: { id: claimBatch.id },
    data: { totalAmount, totalClaims: eligibleAppointments.length },
  });

  await prisma.reconciliation.create({
    data: {
      providerId: providerForClaims.id,
      claimBatchId: claimBatch.id,
      referenceNumber: `REC-${claimBatch.id}`,
      amountExpected: totalAmount,
      amountReceived: totalAmount * 0.9,
      status: 'DISCREPANCY',
      recordedAt: now(),
      notes: 'Seeded reconciliation with discrepancy',
    },
  });

  // ─────────────────────────────────────────────────────────────
  // 13) Doctor payouts
  // ─────────────────────────────────────────────────────────────
  const commissionPct = 0.15;
  for (const appt of appointmentRecords.filter((a) => a.status === 'COMPLETED').slice(0, 3)) {
    const gross = Number(appt.amount);
    const commission = Math.round(gross * commissionPct * 100) / 100;
    const net = Math.round((gross - commission) * 100) / 100;
    await prisma.doctorPayout.create({
      data: {
        doctorId: appt.doctorId,
        appointmentId: appt.id,
        grossAmount: gross,
        commissionAmount: commission,
        netAmount: net,
        status: 'PENDING',
        scheduledAt: daysFromNow(7),
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 14) Notifications (for each role)
  // ─────────────────────────────────────────────────────────────
  const notifyUsers = [superAdmin, medicalAdmin, insuranceStaff, supportStaff, accountant, ...patientsUsers, ...doctorsUsers];
  for (const u of notifyUsers.slice(0, 12)) {
    await prisma.notification.create({
      data: {
        userId: u.id,
        titleAr: 'إشعار تجريبي',
        titleEn: 'Seed Notification',
        bodyAr: 'هذا إشعار تجريبي للتأكد من عمل لوحة التحكم.',
        bodyEn: 'This is a seeded notification for dashboard verification.',
        type: 'SYSTEM',
        isRead: u.role === 'SUPER_ADMIN',
        readAt: u.role === 'SUPER_ADMIN' ? now() : null,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 15) Reviews (linked to completed appointment)
  // ─────────────────────────────────────────────────────────────
  if (completedAppointment) {
    const patient = await prisma.patientProfile.findUnique({ where: { id: completedAppointment.patientId } });
    await prisma.review.create({
      data: {
        appointmentId: completedAppointment.id,
        patientId: patient.id, // equals patient.userId by design in this seed
        doctorId: completedAppointment.doctorId,
        rating: 5,
        comment: 'تجربة ممتازة',
        isVisible: true,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 16) System settings
  // ─────────────────────────────────────────────────────────────
  const settings = [
    { key: 'platform_name_ar', value: 'حياة بلا ألم', type: 'STRING', isPublic: true },
    { key: 'platform_name_en', value: 'Haya Bila Alam', type: 'STRING', isPublic: true },
    { key: 'default_language', value: 'ar', type: 'STRING', isPublic: true },
    { key: 'commission_percentage', value: '15', type: 'NUMBER', isPublic: false },
    { key: 'auto_approve_amount_limit', value: '500', type: 'NUMBER', isPublic: false },
    { key: 'appointment_reminder_hours', value: '24', type: 'NUMBER', isPublic: false },
    { key: 'feature_chat_enabled', value: 'true', type: 'BOOLEAN', isPublic: false },
    { key: 'feature_video_enabled', value: 'true', type: 'BOOLEAN', isPublic: false },
    { key: 'support_sla_hours', value: '8', type: 'NUMBER', isPublic: false },
  ];
  for (const setting of settings) {
    await prisma.systemSetting.upsert({ where: { key: setting.key }, update: setting, create: setting });
  }

  // ─────────────────────────────────────────────────────────────
  // 17) Audit logs
  // ─────────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { actorId: superAdmin.id, entityType: 'System', entityId: null, action: 'CREATE', newValues: { seeded: true }, ipAddress: '127.0.0.1', userAgent: 'seed' },
      { actorId: medicalAdmin.id, entityType: 'DoctorProfile', entityId: approvedDoctors[0]?.id || null, action: 'APPROVE', newValues: { verificationStatus: 'APPROVED' }, ipAddress: '127.0.0.1', userAgent: 'seed' },
      { actorId: insuranceStaff.id, entityType: 'InsuranceCase', entityId: anyInsuranceCase?.id || null, action: 'UPDATE', newValues: { status: 'UNDER_REVIEW' }, ipAddress: '127.0.0.1', userAgent: 'seed' },
      { actorId: supportStaff.id, entityType: 'SupportCase', entityId: supportCase1.id, action: 'ASSIGN', newValues: { assignedTo: supportStaff.id }, ipAddress: '127.0.0.1', userAgent: 'seed' },
      { actorId: accountant.id, entityType: 'ClaimBatch', entityId: claimBatch.id, action: 'CREATE', newValues: { totalClaims: eligibleAppointments.length }, ipAddress: '127.0.0.1', userAgent: 'seed' },
    ],
    skipDuplicates: true,
  });

  const staffUsers = { superAdmin, medicalAdmin, insuranceStaff, supportStaff, accountant };
  await seedDemoUserPermissionOverrides(prisma, staffUsers);
  await verifySeededStaffRbac(prisma, staffUsers);

  console.log('\nSeed completed successfully (full coverage + RBAC).');
  console.log('\nTest Accounts (Dashboard login - use email, permissions from DB):');
  console.log('────────────────────────────────────────────────');
  console.log('Super Admin:     admin@hayabilaalam.com / Password123');
  console.log('Medical Admin:   medical@hayabilaalam.com / Password123');
  console.log('Insurance Staff: insurance@hayabilaalam.com / Password123 (+ demo: support.tickets.list)');
  console.log('Support Staff:   support@hayabilaalam.com / Password123');
  console.log('Accountant:      accountant@hayabilaalam.com / Password123 (+ demo: patients.list)');
  console.log('\nMobile/App accounts (phone or 966… without +, password Password123):');
  console.log('────────────────────────────────────────────────');
  for (const u of doctorsUsers) {
    console.log(`Doctor - ${u.fullName}:   ${u.phone} (or ${u.phone.replace(/^\+/, '')})`);
  }
  for (const u of patientsUsers) {
    console.log(`Patient - ${u.fullName}:  ${u.phone} (or ${u.phone.replace(/^\+/, '')})`);
  }
  console.log('\nApproved doctor emails (for /auth/login): dr.ahmed@example.com, dr.sara@example.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
