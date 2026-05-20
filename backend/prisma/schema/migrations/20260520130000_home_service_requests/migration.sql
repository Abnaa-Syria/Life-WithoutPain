-- Home service visit requests (MySQL)

CREATE TABLE `home_service_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `visitAddress` TEXT NOT NULL,
    `notes` TEXT NULL,
    `preferredDate` DATE NOT NULL,
    `requiresInsuranceApproval` BOOLEAN NOT NULL DEFAULT false,
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

ALTER TABLE `payments` ADD COLUMN `homeServiceRequestId` INTEGER NULL;
CREATE INDEX `payments_homeServiceRequestId_idx` ON `payments`(`homeServiceRequestId`);

ALTER TABLE `home_service_requests` ADD CONSTRAINT `home_service_requests_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `home_service_requests` ADD CONSTRAINT `home_service_requests_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `home_service_requests` ADD CONSTRAINT `home_service_requests_assignedDoctorId_fkey` FOREIGN KEY (`assignedDoctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `home_service_requests` ADD CONSTRAINT `home_service_requests_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `payments` ADD CONSTRAINT `payments_homeServiceRequestId_fkey` FOREIGN KEY (`homeServiceRequestId`) REFERENCES `home_service_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
