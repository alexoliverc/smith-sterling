-- CreateTable
CREATE TABLE `ApplicationRecoveryRateLimitBucket` (
    `id` VARCHAR(191) NOT NULL,
    `keyHash` CHAR(64) NOT NULL,
    `bucketStart` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ApplicationRecoveryRateLimitBucket_bucketStart_idx`(`bucketStart`),
    UNIQUE INDEX `ApplicationRecoveryRateLimitBucket_keyHash_bucketStart_key`(`keyHash`, `bucketStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
