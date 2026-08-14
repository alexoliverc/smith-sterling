-- CreateTable
CREATE TABLE `FormalizationStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `formalizationId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('PENDING', 'BANK_DETAILS_SUBMITTED', 'READY_FOR_DISBURSEMENT', 'DISBURSED', 'CANCELLED') NOT NULL,
    `toStatus` ENUM('PENDING', 'BANK_DETAILS_SUBMITTED', 'READY_FOR_DISBURSEMENT', 'DISBURSED', 'CANCELLED') NOT NULL,
    `actorType` ENUM('SYSTEM', 'OPERATOR') NOT NULL DEFAULT 'SYSTEM',
    `actorId` VARCHAR(191) NULL,
    `reason` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FormalizationStatusHistory_formalizationId_createdAt_idx`(`formalizationId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FormalizationStatusHistory` ADD CONSTRAINT `FormalizationStatusHistory_formalizationId_fkey` FOREIGN KEY (`formalizationId`) REFERENCES `CreditFormalization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
