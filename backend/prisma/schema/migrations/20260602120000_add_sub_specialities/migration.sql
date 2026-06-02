-- CreateTable
CREATE TABLE `sub_specialities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `specialityId` INTEGER NOT NULL,
    `nameAr` VARCHAR(255) NOT NULL,
    `nameEn` VARCHAR(255) NOT NULL,
    `descriptionAr` TEXT NULL,
    `descriptionEn` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sub_specialities_specialityId_idx`(`specialityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DoctorSubSpecialities` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_DoctorSubSpecialities_AB_unique`(`A`, `B`),
    INDEX `_DoctorSubSpecialities_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sub_specialities` ADD CONSTRAINT `sub_specialities_specialityId_fkey` FOREIGN KEY (`specialityId`) REFERENCES `specialities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DoctorSubSpecialities` ADD CONSTRAINT `_DoctorSubSpecialities_A_fkey` FOREIGN KEY (`A`) REFERENCES `doctor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DoctorSubSpecialities` ADD CONSTRAINT `_DoctorSubSpecialities_B_fkey` FOREIGN KEY (`B`) REFERENCES `sub_specialities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
