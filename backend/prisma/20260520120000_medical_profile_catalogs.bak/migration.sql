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

-- Seed default catalog entries from legacy text values
INSERT INTO `chronic_diseases` (`nameAr`, `nameEn`, `description`, `isActive`, `updatedAt`)
VALUES ('ارتفاع ضغط الدم', 'Hypertension', 'Migrated from legacy medical profile', true, CURRENT_TIMESTAMP(3));

INSERT INTO `allergies` (`nameAr`, `nameEn`, `description`, `isActive`, `updatedAt`)
VALUES ('بنسلين', 'Penicillin', 'Migrated from legacy medical profile', true, CURRENT_TIMESTAMP(3));

INSERT INTO `medications` (`nameAr`, `nameEn`, `description`, `isActive`, `updatedAt`)
VALUES ('فيتامين د', 'Vitamin D', 'Migrated from legacy medical profile', true, CURRENT_TIMESTAMP(3));

-- CreateTable
CREATE TABLE `_MedicalProfileToChronicDisease` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MedicalProfileToChronicDisease_AB_unique`(`A`, `B`),
    INDEX `_MedicalProfileToChronicDisease_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MedicalProfileToMedication` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MedicalProfileToMedication_AB_unique`(`A`, `B`),
    INDEX `_MedicalProfileToMedication_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MedicalProfileToAllergy` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MedicalProfileToAllergy_AB_unique`(`A`, `B`),
    INDEX `_MedicalProfileToAllergy_B_index`(`B`)
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

-- Migrate existing medical profile text links to junction tables
INSERT INTO `_MedicalProfileToChronicDisease` (`A`, `B`)
SELECT mp.`id`, cd.`id`
FROM `medical_profiles` mp
CROSS JOIN `chronic_diseases` cd
WHERE mp.`chronicDiseases` IS NOT NULL AND mp.`chronicDiseases` != ''
  AND cd.`nameEn` = 'Hypertension';

INSERT INTO `_MedicalProfileToAllergy` (`A`, `B`)
SELECT mp.`id`, a.`id`
FROM `medical_profiles` mp
CROSS JOIN `allergies` a
WHERE mp.`allergies` IS NOT NULL AND mp.`allergies` != ''
  AND a.`nameEn` = 'Penicillin';

INSERT INTO `_MedicalProfileToMedication` (`A`, `B`)
SELECT mp.`id`, m.`id`
FROM `medical_profiles` mp
CROSS JOIN `medications` m
WHERE mp.`currentMedications` IS NOT NULL AND mp.`currentMedications` != ''
  AND m.`nameEn` = 'Vitamin D';

-- Drop legacy text columns
ALTER TABLE `medical_profiles` DROP COLUMN `chronicDiseases`,
    DROP COLUMN `allergies`,
    DROP COLUMN `currentMedications`;

-- AddForeignKey
ALTER TABLE `_MedicalProfileToChronicDisease` ADD CONSTRAINT `_MedicalProfileToChronicDisease_A_fkey` FOREIGN KEY (`A`) REFERENCES `medical_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MedicalProfileToChronicDisease` ADD CONSTRAINT `_MedicalProfileToChronicDisease_B_fkey` FOREIGN KEY (`B`) REFERENCES `chronic_diseases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MedicalProfileToMedication` ADD CONSTRAINT `_MedicalProfileToMedication_A_fkey` FOREIGN KEY (`A`) REFERENCES `medical_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MedicalProfileToMedication` ADD CONSTRAINT `_MedicalProfileToMedication_B_fkey` FOREIGN KEY (`B`) REFERENCES `medications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MedicalProfileToAllergy` ADD CONSTRAINT `_MedicalProfileToAllergy_A_fkey` FOREIGN KEY (`A`) REFERENCES `medical_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MedicalProfileToAllergy` ADD CONSTRAINT `_MedicalProfileToAllergy_B_fkey` FOREIGN KEY (`B`) REFERENCES `allergies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_profile_attachments` ADD CONSTRAINT `medical_profile_attachments_medicalProfileId_fkey` FOREIGN KEY (`medicalProfileId`) REFERENCES `medical_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
