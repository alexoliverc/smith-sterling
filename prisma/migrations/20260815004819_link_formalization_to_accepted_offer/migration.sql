/*
  Warnings:

  - A unique constraint covering the columns `[acceptedOfferId]` on the table `CreditFormalization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CreditFormalization` ADD COLUMN `acceptedOfferId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CreditFormalization_acceptedOfferId_key` ON `CreditFormalization`(`acceptedOfferId`);

-- AddForeignKey
ALTER TABLE `CreditFormalization` ADD CONSTRAINT `CreditFormalization_acceptedOfferId_fkey` FOREIGN KEY (`acceptedOfferId`) REFERENCES `CreditOffer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
