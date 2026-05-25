-- CreateTable
CREATE TABLE `appointments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `familyMemberId` INTEGER NULL,
    `doctorId` INTEGER NOT NULL,
    `specialityId` INTEGER NULL,
    `serviceId` INTEGER NULL,
    `appointmentType` ENUM('CONSULTATION', 'FOLLOW_UP', 'EMERGENCY') NOT NULL DEFAULT 'CONSULTATION',
    `appointmentDate` DATE NOT NULL,
    `startTime` VARCHAR(5) NOT NULL,
    `endTime` VARCHAR(5) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW') NOT NULL DEFAULT 'PENDING',
    `insuranceStatus` ENUM('NOT_REQUIRED', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'PARTIALLY_APPROVED') NOT NULL DEFAULT 'NOT_REQUIRED',
    `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED') NOT NULL DEFAULT 'PENDING',
    `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `requiresInsuranceApproval` BOOLEAN NOT NULL DEFAULT false,
    `approvedInsuranceCaseId` INTEGER NULL,
    `notes` TEXT NULL,
    `cancellationReason` TEXT NULL,
    `confirmedAt` DATETIME(3) NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `appointments_patientId_idx`(`patientId`),
    INDEX `appointments_doctorId_idx`(`doctorId`),
    INDEX `appointments_appointmentDate_idx`(`appointmentDate`),
    INDEX `appointments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointment_attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointmentId` INTEGER NOT NULL,
    `fileUrl` VARCHAR(500) NOT NULL,
    `type` ENUM('IMAGE', 'DOCUMENT', 'LAB_RESULT', 'PRESCRIPTION', 'REPORT', 'OTHER') NOT NULL DEFAULT 'DOCUMENT',
    `uploadedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `appointment_attachments_appointmentId_idx`(`appointmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `appointmentId` INTEGER NULL,
    `uploadedBy` INTEGER NOT NULL,
    `category` ENUM('LAB_RESULT', 'RADIOLOGY', 'PRESCRIPTION', 'MEDICAL_REPORT', 'INSURANCE_DOCUMENT', 'ID_DOCUMENT', 'OTHER') NOT NULL,
    `fileUrl` VARCHAR(500) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `medical_files_patientId_idx`(`patientId`),
    INDEX `medical_files_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lab_test_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointmentId` INTEGER NOT NULL,
    `patientId` INTEGER NOT NULL,
    `doctorId` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('REQUESTED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `lab_test_requests_appointmentId_idx`(`appointmentId`),
    INDEX `lab_test_requests_patientId_idx`(`patientId`),
    INDEX `lab_test_requests_doctorId_idx`(`doctorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lab_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `labTestRequestId` INTEGER NOT NULL,
    `uploadedBy` INTEGER NOT NULL,
    `fileUrl` VARCHAR(500) NOT NULL,
    `notes` TEXT NULL,
    `reviewedByDoctor` BOOLEAN NOT NULL DEFAULT false,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `lab_results_labTestRequestId_idx`(`labTestRequestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prescriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointmentId` INTEGER NOT NULL,
    `patientId` INTEGER NOT NULL,
    `doctorId` INTEGER NOT NULL,
    `diagnosis` TEXT NOT NULL,
    `notes` TEXT NULL,
    `qrCodeValue` VARCHAR(500) NULL,
    `digitalSealValue` TEXT NULL,
    `pdfUrl` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `prescriptions_appointmentId_idx`(`appointmentId`),
    INDEX `prescriptions_patientId_idx`(`patientId`),
    INDEX `prescriptions_doctorId_idx`(`doctorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prescription_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prescriptionId` INTEGER NOT NULL,
    `medicineName` VARCHAR(255) NOT NULL,
    `dosage` VARCHAR(100) NOT NULL,
    `frequency` VARCHAR(100) NOT NULL,
    `duration` VARCHAR(100) NOT NULL,
    `instructions` TEXT NULL,

    INDEX `prescription_items_prescriptionId_idx`(`prescriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointmentId` INTEGER NOT NULL,
    `patientId` INTEGER NOT NULL,
    `doctorId` INTEGER NOT NULL,
    `visitReason` TEXT NOT NULL,
    `diagnosis` TEXT NOT NULL,
    `summary` TEXT NULL,
    `symptoms` TEXT NULL,
    `clinicalFindings` TEXT NULL,
    `vitals` JSON NULL,
    `clinicalExam` JSON NULL,
    `nextAppointmentDate` DATETIME(3) NULL,
    `recommendations` TEXT NULL,
    `pdfUrl` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `medical_reports_appointmentId_idx`(`appointmentId`),
    INDEX `medical_reports_patientId_idx`(`patientId`),
    INDEX `medical_reports_doctorId_idx`(`doctorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_report_attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportId` INTEGER NOT NULL,
    `fileUrl` VARCHAR(500) NOT NULL,
    `type` ENUM('IMAGE', 'DOCUMENT', 'LAB_RESULT', 'PRESCRIPTION', 'REPORT', 'OTHER') NOT NULL DEFAULT 'DOCUMENT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `medical_report_attachments_reportId_idx`(`reportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointmentId` INTEGER NOT NULL,
    `patientId` INTEGER NOT NULL,
    `doctorId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `reviews_doctorId_idx`(`doctorId`),
    UNIQUE INDEX `reviews_appointmentId_patientId_key`(`appointmentId`, `patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nameAr` VARCHAR(255) NOT NULL,
    `nameEn` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chronic_diseases` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nameAr` VARCHAR(255) NOT NULL,
    `nameEn` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `allergies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nameAr` VARCHAR(255) NOT NULL,
    `nameEn` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_tests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nameAr` VARCHAR(255) NOT NULL,
    `nameEn` VARCHAR(255) NOT NULL,
    `categoryAr` VARCHAR(100) NULL,
    `categoryEn` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `specialityId` INTEGER NULL,
    `title` VARCHAR(100) NULL,
    `bio` TEXT NULL,
    `bioAr` TEXT NULL,
    `yearsOfExperience` INTEGER NULL,
    `licenseNumber` VARCHAR(100) NOT NULL,
    `workplace` VARCHAR(255) NULL,
    `city` VARCHAR(100) NULL,
    `clinicAddress` TEXT NULL,
    `consultationFee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `followUpFee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `ratingAverage` DOUBLE NOT NULL DEFAULT 0,
    `ratingCount` INTEGER NOT NULL DEFAULT 0,
    `verificationStatus` ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `isPubliclyBookable` BOOLEAN NOT NULL DEFAULT false,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `doctor_profiles_userId_key`(`userId`),
    INDEX `doctor_profiles_specialityId_idx`(`specialityId`),
    INDEX `doctor_profiles_verificationStatus_idx`(`verificationStatus`),
    INDEX `doctor_profiles_isPubliclyBookable_idx`(`isPubliclyBookable`),
    INDEX `doctor_profiles_city_idx`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_verification_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doctorId` INTEGER NOT NULL,
    `fileUrl` VARCHAR(500) NOT NULL,
    `fileType` VARCHAR(50) NOT NULL,
    `reviewStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewNotes` TEXT NULL,
    `reviewedBy` INTEGER NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `doctor_verification_documents_doctorId_idx`(`doctorId`),
    INDEX `doctor_verification_documents_reviewStatus_idx`(`reviewStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `home_service_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `visitAddress` TEXT NOT NULL,
    `notes` TEXT NULL,
    `preferredDate` DATE NOT NULL,
    `requiresInsuranceApproval` BOOLEAN NOT NULL DEFAULT false,
    `insuranceStatus` ENUM('NOT_REQUIRED', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'PARTIALLY_APPROVED') NOT NULL DEFAULT 'NOT_REQUIRED',
    `approvedInsuranceCaseId` INTEGER NULL,
    `status` ENUM('PENDING', 'ASSIGNED', 'SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `assignedDoctorId` INTEGER NULL,
    `appointmentId` INTEGER NULL,
    `createdBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `home_service_requests_appointmentId_key`(`appointmentId`),
    INDEX `home_service_requests_patientId_idx`(`patientId`),
    INDEX `home_service_requests_serviceId_idx`(`serviceId`),
    INDEX `home_service_requests_preferredDate_idx`(`preferredDate`),
    INDEX `home_service_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insurance_providers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nameAr` VARCHAR(255) NOT NULL,
    `nameEn` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `logoUrl` VARCHAR(500) NULL,
    `apiMode` ENUM('MANUAL', 'API', 'HYBRID') NOT NULL DEFAULT 'MANUAL',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `insurance_providers_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_insurances` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `providerId` INTEGER NOT NULL,
    `memberId` VARCHAR(100) NOT NULL,
    `policyNumber` VARCHAR(100) NULL,
    `expiryDate` DATE NULL,
    `attachmentUrl` VARCHAR(500) NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `verificationStatus` ENUM('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `patient_insurances_patientId_idx`(`patientId`),
    INDEX `patient_insurances_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insurance_cases` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `appointmentId` INTEGER NULL,
    `homeServiceRequestId` INTEGER NULL,
    `patientInsuranceId` INTEGER NULL,
    `providerId` INTEGER NOT NULL,
    `caseType` ENUM('PRE_AUTHORIZATION', 'CLAIM', 'INQUIRY') NOT NULL,
    `requestType` ENUM('CONSULTATION', 'PROCEDURE', 'LAB_TEST', 'MEDICATION') NOT NULL,
    `status` ENUM('OPEN', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'MORE_INFO_REQUESTED', 'ESCALATED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `requestedAmount` DECIMAL(10, 2) NULL,
    `autoApproved` BOOLEAN NOT NULL DEFAULT false,
    `externalReference` VARCHAR(255) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolvedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `insurance_cases_homeServiceRequestId_key`(`homeServiceRequestId`),
    INDEX `insurance_cases_patientId_idx`(`patientId`),
    INDEX `insurance_cases_appointmentId_idx`(`appointmentId`),
    INDEX `insurance_cases_homeServiceRequestId_idx`(`homeServiceRequestId`),
    INDEX `insurance_cases_patientInsuranceId_idx`(`patientInsuranceId`),
    INDEX `insurance_cases_providerId_idx`(`providerId`),
    INDEX `insurance_cases_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insurance_approvals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `insuranceCaseId` INTEGER NOT NULL,
    `requestedProcedure` VARCHAR(255) NOT NULL,
    `approvalStatus` ENUM('PENDING', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `requestedAmount` DECIMAL(10, 2) NULL,
    `approvedAmount` DECIMAL(10, 2) NULL,
    `decisionNotes` TEXT NULL,
    `decidedBy` INTEGER NULL,
    `decidedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `insurance_approvals_insuranceCaseId_idx`(`insuranceCaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `claim_batches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `providerId` INTEGER NOT NULL,
    `periodStart` DATE NOT NULL,
    `periodEnd` DATE NOT NULL,
    `submissionType` ENUM('DAILY', 'MONTHLY') NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'PROCESSING', 'PARTIALLY_PAID', 'PAID', 'REJECTED', 'DISPUTED') NOT NULL DEFAULT 'DRAFT',
    `submittedAt` DATETIME(3) NULL,
    `totalAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `totalClaims` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `claim_batches_providerId_idx`(`providerId`),
    INDEX `claim_batches_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `claim_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `claimBatchId` INTEGER NOT NULL,
    `appointmentId` INTEGER NOT NULL,
    `patientId` INTEGER NOT NULL,
    `doctorId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'PAID') NOT NULL DEFAULT 'PENDING',
    `externalReference` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `claim_items_claimBatchId_idx`(`claimBatchId`),
    INDEX `claim_items_appointmentId_idx`(`appointmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reconciliations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `providerId` INTEGER NOT NULL,
    `claimBatchId` INTEGER NULL,
    `referenceNumber` VARCHAR(100) NOT NULL,
    `amountExpected` DECIMAL(12, 2) NOT NULL,
    `amountReceived` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('PENDING', 'MATCHED', 'DISCREPANCY', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `reconciliations_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `identityNumber` VARCHAR(50) NULL,
    `gender` ENUM('MALE', 'FEMALE') NULL,
    `dateOfBirth` DATE NULL,
    `bloodType` ENUM('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE') NULL,
    `height` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `city` VARCHAR(100) NULL,
    `address` TEXT NULL,
    `emergencyContactName` VARCHAR(255) NULL,
    `emergencyContactPhone` VARCHAR(20) NULL,
    `insuranceLinked` BOOLEAN NOT NULL DEFAULT false,
    `notificationsEnabled` BOOLEAN NOT NULL DEFAULT true,
    `privacySettings` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `patient_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `surgeries` TEXT NULL,
    `familyHistory` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `medical_profiles_patientId_key`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_profile_attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `medicalProfileId` INTEGER NOT NULL,
    `fileUrl` VARCHAR(500) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `medical_profile_attachments_medicalProfileId_idx`(`medicalProfileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `family_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `residenceCardNumber` VARCHAR(50) NULL,
    `relationType` VARCHAR(50) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NULL,
    `dateOfBirth` DATE NULL,
    `phone` VARCHAR(20) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `family_members_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `specialities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nameAr` VARCHAR(255) NOT NULL,
    `nameEn` VARCHAR(255) NOT NULL,
    `descriptionAr` TEXT NULL,
    `descriptionEn` TEXT NULL,
    `iconUrl` VARCHAR(500) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nameAr` VARCHAR(255) NOT NULL,
    `nameEn` VARCHAR(255) NOT NULL,
    `descriptionAr` TEXT NULL,
    `descriptionEn` TEXT NULL,
    `type` ENUM('REMOTE', 'HOME', 'CLINIC') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doctorId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `doctor_services_doctorId_serviceId_key`(`doctorId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_availability` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doctorId` INTEGER NOT NULL,
    `dayOfWeek` ENUM('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY') NOT NULL,
    `periodType` ENUM('MORNING', 'AFTERNOON', 'EVENING') NOT NULL,
    `startTime` VARCHAR(5) NOT NULL,
    `endTime` VARCHAR(5) NOT NULL,
    `slotDurationMinutes` INTEGER NOT NULL DEFAULT 30,
    `breakDurationMinutes` INTEGER NOT NULL DEFAULT 5,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `doctor_availability_doctorId_idx`(`doctorId`),
    INDEX `doctor_availability_dayOfWeek_idx`(`dayOfWeek`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_contact_info` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `supportPhones` JSON NOT NULL,
    `supportEmail` VARCHAR(255) NOT NULL,
    `whatsappNumber` VARCHAR(50) NULL,
    `whatsappLink` VARCHAR(500) NULL,
    `socialLinks` JSON NOT NULL,
    `workingHours` JSON NOT NULL,
    `descriptionAr` TEXT NULL,
    `descriptionEn` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_cases` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdByUserId` INTEGER NOT NULL,
    `creatorRole` ENUM('PATIENT', 'DOCTOR') NOT NULL,
    `patientId` INTEGER NULL,
    `doctorId` INTEGER NULL,
    `insuranceCaseId` INTEGER NULL,
    `appointmentId` INTEGER NULL,
    `assignedTo` INTEGER NULL,
    `category` ENUM('TECHNICAL', 'APPOINTMENT', 'PAYMENT', 'INSURANCE', 'ACCOUNT', 'OTHER') NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `subject` VARCHAR(500) NOT NULL,
    `description` TEXT NULL,
    `resolutionNotes` TEXT NULL,
    `lastActivityAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `support_cases_patientId_idx`(`patientId`),
    INDEX `support_cases_doctorId_idx`(`doctorId`),
    INDEX `support_cases_createdByUserId_idx`(`createdByUserId`),
    INDEX `support_cases_assignedTo_idx`(`assignedTo`),
    INDEX `support_cases_status_idx`(`status`),
    INDEX `support_cases_category_idx`(`category`),
    INDEX `support_cases_creatorRole_idx`(`creatorRole`),
    INDEX `support_cases_lastActivityAt_idx`(`lastActivityAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supportCaseId` INTEGER NOT NULL,
    `senderId` INTEGER NOT NULL,
    `messageType` ENUM('TEXT', 'IMAGE', 'FILE', 'SYSTEM') NOT NULL DEFAULT 'TEXT',
    `content` TEXT NOT NULL,
    `attachmentUrl` VARCHAR(500) NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `readAt` DATETIME(3) NULL,

    INDEX `support_messages_supportCaseId_idx`(`supportCaseId`),
    INDEX `support_messages_senderId_idx`(`senderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `messageId` INTEGER NULL,
    `fileUrl` VARCHAR(500) NOT NULL,
    `fileName` VARCHAR(255) NULL,
    `mimeType` VARCHAR(100) NULL,
    `uploadedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `support_attachments_ticketId_idx`(`ticketId`),
    INDEX `support_attachments_messageId_idx`(`messageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointmentId` INTEGER NULL,
    `patientId` INTEGER NOT NULL,
    `doctorId` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `conversations_appointmentId_key`(`appointmentId`),
    INDEX `conversations_patientId_idx`(`patientId`),
    INDEX `conversations_doctorId_idx`(`doctorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversationId` INTEGER NOT NULL,
    `senderId` INTEGER NOT NULL,
    `messageType` ENUM('TEXT', 'IMAGE', 'FILE', 'SYSTEM') NOT NULL DEFAULT 'TEXT',
    `content` TEXT NOT NULL,
    `attachmentUrl` VARCHAR(500) NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `readAt` DATETIME(3) NULL,

    INDEX `messages_conversationId_idx`(`conversationId`),
    INDEX `messages_senderId_idx`(`senderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `call_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointmentId` INTEGER NOT NULL,
    `patientId` INTEGER NOT NULL,
    `doctorId` INTEGER NOT NULL,
    `sessionType` ENUM('VIDEO', 'VOICE') NOT NULL,
    `provider` VARCHAR(50) NOT NULL DEFAULT 'mock',
    `sessionId` VARCHAR(255) NULL,
    `joinUrlPatient` VARCHAR(500) NULL,
    `joinUrlDoctor` VARCHAR(500) NULL,
    `status` ENUM('CREATED', 'RINGING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'MISSED') NOT NULL DEFAULT 'CREATED',
    `startedAt` DATETIME(3) NULL,
    `endedAt` DATETIME(3) NULL,
    `durationSeconds` INTEGER NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `call_sessions_appointmentId_idx`(`appointmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointmentId` INTEGER NULL,
    `homeServiceRequestId` INTEGER NULL,
    `patientId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'SAR',
    `method` ENUM('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'WALLET', 'INSURANCE', 'CASH', 'VISA', 'MASTERCARD', 'APPLE_PAY') NULL,
    `provider` VARCHAR(50) NULL,
    `transactionReference` VARCHAR(255) NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED') NOT NULL DEFAULT 'PENDING',
    `paidAt` DATETIME(3) NULL,
    `rawPayload` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `payments_appointmentId_idx`(`appointmentId`),
    INDEX `payments_homeServiceRequestId_idx`(`homeServiceRequestId`),
    INDEX `payments_patientId_idx`(`patientId`),
    INDEX `payments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_payouts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doctorId` INTEGER NOT NULL,
    `appointmentId` INTEGER NULL,
    `grossAmount` DECIMAL(10, 2) NOT NULL,
    `commissionAmount` DECIMAL(10, 2) NOT NULL,
    `netAmount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'SCHEDULED', 'PROCESSING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `scheduledAt` DATETIME(3) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `doctor_payouts_doctorId_idx`(`doctorId`),
    INDEX `doctor_payouts_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `titleAr` VARCHAR(500) NOT NULL,
    `titleEn` VARCHAR(500) NOT NULL,
    `bodyAr` TEXT NOT NULL,
    `bodyEn` TEXT NOT NULL,
    `type` ENUM('APPOINTMENT', 'INSURANCE', 'PAYMENT', 'SUPPORT', 'SYSTEM', 'CHAT', 'LAB_RESULT', 'PRESCRIPTION', 'REPORT', 'REVIEW', 'VERIFICATION') NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `relatedEntityType` VARCHAR(50) NULL,
    `relatedEntityId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_userId_idx`(`userId`),
    INDEX `notifications_isRead_idx`(`isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(255) NOT NULL,
    `value` TEXT NOT NULL,
    `type` ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') NOT NULL DEFAULT 'STRING',
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `actorId` INTEGER NULL,
    `entityType` VARCHAR(100) NOT NULL,
    `entityId` INTEGER NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'ESCALATE', 'ASSIGN', 'PAYMENT', 'UPLOAD', 'DOWNLOAD') NOT NULL,
    `oldValues` JSON NULL,
    `newValues` JSON NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_actorId_idx`(`actorId`),
    INDEX `audit_logs_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `displayName` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `module` VARCHAR(100) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permissions_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,

    UNIQUE INDEX `role_permissions_roleId_permissionId_key`(`roleId`, `permissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('PATIENT', 'DOCTOR', 'SUPER_ADMIN', 'MEDICAL_ADMIN', 'INSURANCE_STAFF', 'SUPPORT_STAFF', 'ACCOUNTANT') NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `preferredLanguage` VARCHAR(5) NOT NULL DEFAULT 'ar',
    `darkModeEnabled` BOOLEAN NOT NULL DEFAULT false,
    `avatarUrl` VARCHAR(500) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_phone_idx`(`phone`),
    INDEX `users_status_idx`(`status`),
    INDEX `users_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `purpose` VARCHAR(50) NOT NULL DEFAULT 'verification',
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `otp_codes_userId_idx`(`userId`),
    INDEX `otp_codes_code_purpose_idx`(`code`, `purpose`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revokedAt` DATETIME(3) NULL,

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `refresh_tokens_userId_idx`(`userId`),
    INDEX `refresh_tokens_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,
    `granted` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `user_permissions_userId_permissionId_key`(`userId`, `permissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ChronicDiseaseToMedicalProfile` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ChronicDiseaseToMedicalProfile_AB_unique`(`A`, `B`),
    INDEX `_ChronicDiseaseToMedicalProfile_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AllergyToMedicalProfile` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AllergyToMedicalProfile_AB_unique`(`A`, `B`),
    INDEX `_AllergyToMedicalProfile_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MedicalProfileToMedication` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MedicalProfileToMedication_AB_unique`(`A`, `B`),
    INDEX `_MedicalProfileToMedication_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_familyMemberId_fkey` FOREIGN KEY (`familyMemberId`) REFERENCES `family_members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_specialityId_fkey` FOREIGN KEY (`specialityId`) REFERENCES `specialities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointment_attachments` ADD CONSTRAINT `appointment_attachments_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_files` ADD CONSTRAINT `medical_files_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_test_requests` ADD CONSTRAINT `lab_test_requests_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_test_requests` ADD CONSTRAINT `lab_test_requests_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_test_requests` ADD CONSTRAINT `lab_test_requests_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_results` ADD CONSTRAINT `lab_results_labTestRequestId_fkey` FOREIGN KEY (`labTestRequestId`) REFERENCES `lab_test_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescription_items` ADD CONSTRAINT `prescription_items_prescriptionId_fkey` FOREIGN KEY (`prescriptionId`) REFERENCES `prescriptions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_reports` ADD CONSTRAINT `medical_reports_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_reports` ADD CONSTRAINT `medical_reports_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_reports` ADD CONSTRAINT `medical_reports_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_report_attachments` ADD CONSTRAINT `medical_report_attachments_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `medical_reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_patientProfileId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_patientUserId_fkey` FOREIGN KEY (`patientId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_profiles` ADD CONSTRAINT `doctor_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_profiles` ADD CONSTRAINT `doctor_profiles_specialityId_fkey` FOREIGN KEY (`specialityId`) REFERENCES `specialities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_verification_documents` ADD CONSTRAINT `doctor_verification_documents_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_verification_documents` ADD CONSTRAINT `doctor_verification_documents_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_service_requests` ADD CONSTRAINT `home_service_requests_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_service_requests` ADD CONSTRAINT `home_service_requests_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_service_requests` ADD CONSTRAINT `home_service_requests_assignedDoctorId_fkey` FOREIGN KEY (`assignedDoctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_service_requests` ADD CONSTRAINT `home_service_requests_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_insurances` ADD CONSTRAINT `patient_insurances_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_insurances` ADD CONSTRAINT `patient_insurances_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `insurance_providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insurance_cases` ADD CONSTRAINT `insurance_cases_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insurance_cases` ADD CONSTRAINT `insurance_cases_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insurance_cases` ADD CONSTRAINT `insurance_cases_homeServiceRequestId_fkey` FOREIGN KEY (`homeServiceRequestId`) REFERENCES `home_service_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insurance_cases` ADD CONSTRAINT `insurance_cases_patientInsuranceId_fkey` FOREIGN KEY (`patientInsuranceId`) REFERENCES `patient_insurances`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insurance_cases` ADD CONSTRAINT `insurance_cases_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `insurance_providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insurance_approvals` ADD CONSTRAINT `insurance_approvals_insuranceCaseId_fkey` FOREIGN KEY (`insuranceCaseId`) REFERENCES `insurance_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insurance_approvals` ADD CONSTRAINT `insurance_approvals_decidedBy_fkey` FOREIGN KEY (`decidedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `claim_batches` ADD CONSTRAINT `claim_batches_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `insurance_providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `claim_items` ADD CONSTRAINT `claim_items_claimBatchId_fkey` FOREIGN KEY (`claimBatchId`) REFERENCES `claim_batches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `claim_items` ADD CONSTRAINT `claim_items_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reconciliations` ADD CONSTRAINT `reconciliations_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `insurance_providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reconciliations` ADD CONSTRAINT `reconciliations_claimBatchId_fkey` FOREIGN KEY (`claimBatchId`) REFERENCES `claim_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_profiles` ADD CONSTRAINT `patient_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_profiles` ADD CONSTRAINT `medical_profiles_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_profile_attachments` ADD CONSTRAINT `medical_profile_attachments_medicalProfileId_fkey` FOREIGN KEY (`medicalProfileId`) REFERENCES `medical_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `family_members` ADD CONSTRAINT `family_members_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_services` ADD CONSTRAINT `doctor_services_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_services` ADD CONSTRAINT `doctor_services_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_availability` ADD CONSTRAINT `doctor_availability_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_contact_info` ADD CONSTRAINT `support_contact_info_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_cases` ADD CONSTRAINT `support_cases_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_cases` ADD CONSTRAINT `support_cases_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_cases` ADD CONSTRAINT `support_cases_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_cases` ADD CONSTRAINT `support_cases_insuranceCaseId_fkey` FOREIGN KEY (`insuranceCaseId`) REFERENCES `insurance_cases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_cases` ADD CONSTRAINT `support_cases_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_cases` ADD CONSTRAINT `support_cases_assignedTo_fkey` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_messages` ADD CONSTRAINT `support_messages_supportCaseId_fkey` FOREIGN KEY (`supportCaseId`) REFERENCES `support_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_messages` ADD CONSTRAINT `support_messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_attachments` ADD CONSTRAINT `support_attachments_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `support_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_attachments` ADD CONSTRAINT `support_attachments_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `support_messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_attachments` ADD CONSTRAINT `support_attachments_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_sessions` ADD CONSTRAINT `call_sessions_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_sessions` ADD CONSTRAINT `call_sessions_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_homeServiceRequestId_fkey` FOREIGN KEY (`homeServiceRequestId`) REFERENCES `home_service_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_payouts` ADD CONSTRAINT `doctor_payouts_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_payouts` ADD CONSTRAINT `doctor_payouts_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otp_codes` ADD CONSTRAINT `otp_codes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ChronicDiseaseToMedicalProfile` ADD CONSTRAINT `_ChronicDiseaseToMedicalProfile_A_fkey` FOREIGN KEY (`A`) REFERENCES `chronic_diseases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ChronicDiseaseToMedicalProfile` ADD CONSTRAINT `_ChronicDiseaseToMedicalProfile_B_fkey` FOREIGN KEY (`B`) REFERENCES `medical_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AllergyToMedicalProfile` ADD CONSTRAINT `_AllergyToMedicalProfile_A_fkey` FOREIGN KEY (`A`) REFERENCES `allergies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AllergyToMedicalProfile` ADD CONSTRAINT `_AllergyToMedicalProfile_B_fkey` FOREIGN KEY (`B`) REFERENCES `medical_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MedicalProfileToMedication` ADD CONSTRAINT `_MedicalProfileToMedication_A_fkey` FOREIGN KEY (`A`) REFERENCES `medical_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MedicalProfileToMedication` ADD CONSTRAINT `_MedicalProfileToMedication_B_fkey` FOREIGN KEY (`B`) REFERENCES `medications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
