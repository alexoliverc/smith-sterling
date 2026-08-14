-- AlterTable
ALTER TABLE `CreditOffer` ADD COLUMN `cetCompositionDescription` VARCHAR(1000) NULL,
    ADD COLUMN `defaultConsequences` VARCHAR(1000) NULL,
    ADD COLUMN `lateInterestMonthlyPercent` DECIMAL(12, 8) NULL,
    ADD COLUMN `lateOtherChargesDescription` VARCHAR(500) NULL,
    ADD COLUMN `latePenaltyPercent` DECIMAL(12, 8) NULL;
