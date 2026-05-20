-- Help & Support module migration

-- Support contact info (singleton)
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

-- Alter support_cases: add new columns
ALTER TABLE `support_cases` ADD COLUMN `createdByUserId` INTEGER NULL;
ALTER TABLE `support_cases` ADD COLUMN `creatorRole` ENUM('PATIENT', 'DOCTOR') NULL;
ALTER TABLE `support_cases` ADD COLUMN `doctorId` INTEGER NULL;
ALTER TABLE `support_cases` ADD COLUMN `lastActivityAt` DATETIME(3) NULL;

-- Backfill createdByUserId and creatorRole from patient profiles
UPDATE `support_cases` sc
INNER JOIN `patient_profiles` pp ON sc.patientId = pp.id
SET sc.createdByUserId = pp.userId, sc.creatorRole = 'PATIENT'
WHERE sc.patientId IS NOT NULL;

UPDATE `support_cases` SET `lastActivityAt` = `updatedAt`;

-- Map legacy status values
UPDATE `support_cases` SET `status` = 'IN_PROGRESS' WHERE `status` IN ('WAITING_ON_PATIENT', 'WAITING_ON_INSURANCE', 'ESCALATED');

-- Add category column and migrate from type
ALTER TABLE `support_cases` ADD COLUMN `category` ENUM('TECHNICAL', 'APPOINTMENT', 'PAYMENT', 'INSURANCE', 'ACCOUNT', 'OTHER') NULL;

UPDATE `support_cases` SET `category` = 'TECHNICAL' WHERE `type` = 'TECHNICAL';
UPDATE `support_cases` SET `category` = 'INSURANCE' WHERE `type` = 'INSURANCE';
UPDATE `support_cases` SET `category` = 'PAYMENT' WHERE `type` = 'BILLING';
UPDATE `support_cases` SET `category` = 'OTHER' WHERE `type` IN ('GENERAL', 'COMPLAINT');
UPDATE `support_cases` SET `category` = 'OTHER' WHERE `category` IS NULL;

-- Default for any rows without patient (use first admin as fallback - seed will fix)
UPDATE `support_cases` SET `createdByUserId` = (SELECT id FROM `users` WHERE role = 'SUPER_ADMIN' LIMIT 1), `creatorRole` = 'PATIENT'
WHERE `createdByUserId` IS NULL;

UPDATE `support_cases` SET `lastActivityAt` = `updatedAt` WHERE `lastActivityAt` IS NULL;

-- Drop old type column and index, make new columns required
ALTER TABLE `support_cases` DROP INDEX `support_cases_type_idx`;
ALTER TABLE `support_cases` DROP COLUMN `type`;

ALTER TABLE `support_cases` MODIFY `createdByUserId` INTEGER NOT NULL;
ALTER TABLE `support_cases` MODIFY `creatorRole` ENUM('PATIENT', 'DOCTOR') NOT NULL;
ALTER TABLE `support_cases` MODIFY `category` ENUM('TECHNICAL', 'APPOINTMENT', 'PAYMENT', 'INSURANCE', 'ACCOUNT', 'OTHER') NOT NULL;
ALTER TABLE `support_cases` MODIFY `lastActivityAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Shrink status enum
ALTER TABLE `support_cases` MODIFY `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN';

-- Indexes and FKs
CREATE INDEX `support_cases_doctorId_idx` ON `support_cases`(`doctorId`);
CREATE INDEX `support_cases_createdByUserId_idx` ON `support_cases`(`createdByUserId`);
CREATE INDEX `support_cases_category_idx` ON `support_cases`(`category`);
CREATE INDEX `support_cases_creatorRole_idx` ON `support_cases`(`creatorRole`);
CREATE INDEX `support_cases_lastActivityAt_idx` ON `support_cases`(`lastActivityAt`);

ALTER TABLE `support_cases` ADD CONSTRAINT `support_cases_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `support_cases` ADD CONSTRAINT `support_cases_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `support_contact_info` ADD CONSTRAINT `support_contact_info_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Support attachments
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

ALTER TABLE `support_attachments` ADD CONSTRAINT `support_attachments_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `support_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `support_attachments` ADD CONSTRAINT `support_attachments_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `support_messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `support_attachments` ADD CONSTRAINT `support_attachments_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX `support_messages_senderId_idx` ON `support_messages`(`senderId`);

-- Seed default contact info row
INSERT INTO `support_contact_info` (
  `id`, `supportPhones`, `supportEmail`, `whatsappNumber`, `whatsappLink`,
  `socialLinks`, `workingHours`, `descriptionAr`, `descriptionEn`, `updatedAt`
) VALUES (
  1,
  JSON_ARRAY('+966500000000'),
  'support@hayabilaalam.com',
  '+966500000000',
  'https://wa.me/966500000000',
  JSON_OBJECT('facebook', '', 'instagram', '', 'twitter', ''),
  JSON_OBJECT('ar', 'الأحد - الخميس: 9:00 - 17:00', 'en', 'Sun - Thu: 9:00 AM - 5:00 PM'),
  'فريق الدعم متاح لمساعدتك في أي استفسار متعلق بالتطبيق أو المواعيد أو المدفوعات.',
  'Our support team is available to help with app, appointment, or payment inquiries.',
  NOW(3)
);
