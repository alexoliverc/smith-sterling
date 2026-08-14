-- AlterTable
ALTER TABLE `ApplicationStatusHistory` MODIFY `actorType` ENUM('SYSTEM', 'OPERATOR', 'APPLICANT') NOT NULL DEFAULT 'SYSTEM';

-- AlterTable
ALTER TABLE `FormalizationStatusHistory` MODIFY `actorType` ENUM('SYSTEM', 'OPERATOR', 'APPLICANT') NOT NULL DEFAULT 'SYSTEM';
