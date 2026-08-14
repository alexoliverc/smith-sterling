/*
  Warnings:

  - A unique constraint covering the columns `[publicProtocol]` on the table `CreditApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CreditApplication` ADD COLUMN `accessTokenHash` CHAR(64) NULL,
    ADD COLUMN `publicProtocol` VARCHAR(24) NULL,
    ADD COLUMN `submittedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CreditApplication_publicProtocol_key` ON `CreditApplication`(`publicProtocol`);
