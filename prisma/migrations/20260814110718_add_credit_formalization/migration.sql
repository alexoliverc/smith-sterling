-- CreateTable
CREATE TABLE `CreditFormalization` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'BANK_DETAILS_SUBMITTED', 'READY_FOR_DISBURSEMENT', 'DISBURSED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `bankDataEncrypted` TEXT NULL,
    `bankDataSubmittedAt` DATETIME(3) NULL,
    `readyAt` DATETIME(3) NULL,
    `disbursedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CreditFormalization_applicationId_key`(`applicationId`),
    INDEX `CreditFormalization_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CreditFormalization` ADD CONSTRAINT `CreditFormalization_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `CreditApplication`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
