-- CreateTable
CREATE TABLE `ApplicantData` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `nameEncrypted` TEXT NOT NULL,
    `cpfEncrypted` TEXT NOT NULL,
    `cpfLookupHash` CHAR(64) NOT NULL,
    `birthDateEncrypted` TEXT NOT NULL,
    `emailEncrypted` TEXT NOT NULL,
    `phoneEncrypted` TEXT NOT NULL,
    `addressEncrypted` TEXT NOT NULL,
    `employmentEncrypted` TEXT NOT NULL,
    `incomeEncrypted` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ApplicantData_applicationId_key`(`applicationId`),
    INDEX `ApplicantData_cpfLookupHash_idx`(`cpfLookupHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ApplicantData` ADD CONSTRAINT `ApplicantData_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `CreditApplication`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
