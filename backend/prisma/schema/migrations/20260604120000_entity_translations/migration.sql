-- CreateTable
CREATE TABLE `entity_translations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entityType` VARCHAR(64) NOT NULL,
    `entityId` INTEGER NOT NULL,
    `locale` VARCHAR(10) NOT NULL,
    `fieldKey` VARCHAR(64) NOT NULL,
    `value` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `entity_translations_entityType_entityId_locale_fieldKey_key`(`entityType`, `entityId`, `locale`, `fieldKey`),
    INDEX `entity_translations_entityType_entityId_idx`(`entityType`, `entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrate specialities
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'speciality', id, 'ar', 'name', nameAr, NOW(3) FROM specialities;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'speciality', id, 'en', 'name', nameEn, NOW(3) FROM specialities;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'speciality', id, 'ar', 'description', descriptionAr, NOW(3) FROM specialities WHERE descriptionAr IS NOT NULL;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'speciality', id, 'en', 'description', descriptionEn, NOW(3) FROM specialities WHERE descriptionEn IS NOT NULL;

-- Migrate sub_specialities
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'sub_speciality', id, 'ar', 'name', nameAr, NOW(3) FROM sub_specialities;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'sub_speciality', id, 'en', 'name', nameEn, NOW(3) FROM sub_specialities;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'sub_speciality', id, 'ar', 'description', descriptionAr, NOW(3) FROM sub_specialities WHERE descriptionAr IS NOT NULL;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'sub_speciality', id, 'en', 'description', descriptionEn, NOW(3) FROM sub_specialities WHERE descriptionEn IS NOT NULL;

-- Migrate services
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'service', id, 'ar', 'name', nameAr, NOW(3) FROM services;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'service', id, 'en', 'name', nameEn, NOW(3) FROM services;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'service', id, 'ar', 'description', descriptionAr, NOW(3) FROM services WHERE descriptionAr IS NOT NULL;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'service', id, 'en', 'description', descriptionEn, NOW(3) FROM services WHERE descriptionEn IS NOT NULL;

-- Migrate insurance_providers
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'insurance_provider', id, 'ar', 'name', nameAr, NOW(3) FROM insurance_providers;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'insurance_provider', id, 'en', 'name', nameEn, NOW(3) FROM insurance_providers;

-- Migrate catalog tables
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'medication', id, 'ar', 'name', nameAr, NOW(3) FROM medications;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'medication', id, 'en', 'name', nameEn, NOW(3) FROM medications;

INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'chronic_disease', id, 'ar', 'name', nameAr, NOW(3) FROM chronic_diseases;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'chronic_disease', id, 'en', 'name', nameEn, NOW(3) FROM chronic_diseases;

INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'allergy', id, 'ar', 'name', nameAr, NOW(3) FROM allergies;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'allergy', id, 'en', 'name', nameEn, NOW(3) FROM allergies;

INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'medical_test', id, 'ar', 'name', nameAr, NOW(3) FROM medical_tests;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'medical_test', id, 'en', 'name', nameEn, NOW(3) FROM medical_tests;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'medical_test', id, 'ar', 'category', categoryAr, NOW(3) FROM medical_tests WHERE categoryAr IS NOT NULL;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'medical_test', id, 'en', 'category', categoryEn, NOW(3) FROM medical_tests WHERE categoryEn IS NOT NULL;

-- Migrate notifications
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'notification', id, 'ar', 'title', titleAr, NOW(3) FROM notifications;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'notification', id, 'en', 'title', titleEn, NOW(3) FROM notifications;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'notification', id, 'ar', 'body', bodyAr, NOW(3) FROM notifications;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'notification', id, 'en', 'body', bodyEn, NOW(3) FROM notifications;

-- Migrate support_contact_info
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'support_contact_info', id, 'ar', 'description', descriptionAr, NOW(3) FROM support_contact_info WHERE descriptionAr IS NOT NULL;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'support_contact_info', id, 'en', 'description', descriptionEn, NOW(3) FROM support_contact_info WHERE descriptionEn IS NOT NULL;

-- Migrate doctor bios
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'doctor_profile', id, 'ar', 'bio', bioAr, NOW(3) FROM doctor_profiles WHERE bioAr IS NOT NULL;
INSERT INTO `entity_translations` (`entityType`, `entityId`, `locale`, `fieldKey`, `value`, `updatedAt`)
SELECT 'doctor_profile', id, 'en', 'bio', COALESCE(bio, bioAr), NOW(3) FROM doctor_profiles WHERE bio IS NOT NULL OR bioAr IS NOT NULL;

-- Drop legacy columns
ALTER TABLE `specialities` DROP COLUMN `nameAr`, DROP COLUMN `nameEn`, DROP COLUMN `descriptionAr`, DROP COLUMN `descriptionEn`;
ALTER TABLE `sub_specialities` DROP COLUMN `nameAr`, DROP COLUMN `nameEn`, DROP COLUMN `descriptionAr`, DROP COLUMN `descriptionEn`;
ALTER TABLE `services` DROP COLUMN `nameAr`, DROP COLUMN `nameEn`, DROP COLUMN `descriptionAr`, DROP COLUMN `descriptionEn`;
ALTER TABLE `insurance_providers` DROP COLUMN `nameAr`, DROP COLUMN `nameEn`;
ALTER TABLE `medications` DROP COLUMN `nameAr`, DROP COLUMN `nameEn`;
ALTER TABLE `chronic_diseases` DROP COLUMN `nameAr`, DROP COLUMN `nameEn`;
ALTER TABLE `allergies` DROP COLUMN `nameAr`, DROP COLUMN `nameEn`;
ALTER TABLE `medical_tests` DROP COLUMN `nameAr`, DROP COLUMN `nameEn`, DROP COLUMN `categoryAr`, DROP COLUMN `categoryEn`;
ALTER TABLE `notifications` DROP COLUMN `titleAr`, DROP COLUMN `titleEn`, DROP COLUMN `bodyAr`, DROP COLUMN `bodyEn`;
ALTER TABLE `support_contact_info` DROP COLUMN `descriptionAr`, DROP COLUMN `descriptionEn`;
ALTER TABLE `doctor_profiles` DROP COLUMN `bio`, DROP COLUMN `bioAr`;
