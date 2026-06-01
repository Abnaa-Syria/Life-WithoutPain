-- AlterTable
ALTER TABLE `medical_reports` ADD COLUMN `prescriptionId` INTEGER NULL,
    ADD COLUMN `resultSummary` TEXT NULL,
    ADD COLUMN `resultsList` JSON NULL;

-- CreateIndex
CREATE INDEX `medical_reports_prescriptionId_idx` ON `medical_reports`(`prescriptionId`);

-- AddForeignKey
ALTER TABLE `medical_reports` ADD CONSTRAINT `medical_reports_prescriptionId_fkey` FOREIGN KEY (`prescriptionId`) REFERENCES `prescriptions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
