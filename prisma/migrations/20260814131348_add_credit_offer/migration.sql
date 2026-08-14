-- CreateTable
CREATE TABLE `CreditOffer` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'PRESENTED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `principalCents` INTEGER NOT NULL,
    `netDisbursementCents` INTEGER NOT NULL,
    `installmentCents` INTEGER NOT NULL,
    `totalRepaymentCents` INTEGER NOT NULL,
    `iofCents` INTEGER NOT NULL DEFAULT 0,
    `otherFeesCents` INTEGER NOT NULL DEFAULT 0,
    `months` INTEGER NOT NULL,
    `installmentCount` INTEGER NOT NULL,
    `monthlyRatePercent` DECIMAL(12, 8) NOT NULL,
    `annualRatePercent` DECIMAL(12, 8) NOT NULL,
    `cetAnnualPercent` DECIMAL(12, 8) NOT NULL,
    `firstDueDate` DATETIME(3) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `termsVersion` VARCHAR(50) NOT NULL,
    `presentedAt` DATETIME(3) NULL,
    `acceptedAt` DATETIME(3) NULL,
    `declinedAt` DATETIME(3) NULL,
    `expiredAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CreditOffer_applicationId_status_idx`(`applicationId`, `status`),
    INDEX `CreditOffer_status_expiresAt_idx`(`status`, `expiresAt`),
    UNIQUE INDEX `CreditOffer_applicationId_version_key`(`applicationId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditOfferStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `offerId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('DRAFT', 'PRESENTED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED') NOT NULL,
    `toStatus` ENUM('DRAFT', 'PRESENTED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED') NOT NULL,
    `actorType` ENUM('SYSTEM', 'OPERATOR', 'APPLICANT') NOT NULL DEFAULT 'SYSTEM',
    `actorId` VARCHAR(191) NULL,
    `reason` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CreditOfferStatusHistory_offerId_createdAt_idx`(`offerId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CreditOffer` ADD CONSTRAINT `CreditOffer_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `CreditApplication`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditOfferStatusHistory` ADD CONSTRAINT `CreditOfferStatusHistory_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `CreditOffer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
