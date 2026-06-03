-- CreateEnum
CREATE TYPE `NotificationSource` AS ENUM ('SYSTEM_EVENT', 'ADMIN_MANUAL');

-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `source` ENUM('SYSTEM_EVENT', 'ADMIN_MANUAL') NOT NULL DEFAULT 'SYSTEM_EVENT';
ALTER TABLE `notifications` ADD COLUMN `targetAudience` VARCHAR(100) NULL;
ALTER TABLE `notifications` ADD COLUMN `createdByAdminId` INTEGER NULL;
ALTER TABLE `notifications` ADD COLUMN `batchId` VARCHAR(36) NULL;

-- CreateIndex
CREATE INDEX `notifications_source_idx` ON `notifications`(`source`);
CREATE INDEX `notifications_batchId_idx` ON `notifications`(`batchId`);

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_createdByAdminId_fkey` FOREIGN KEY (`createdByAdminId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
