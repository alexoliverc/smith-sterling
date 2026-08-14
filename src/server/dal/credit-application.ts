import 'server-only';

import { createApplicationAccess, hashApplicationToken } from '@/lib/security/application-session';
import { prisma } from '@/lib/prisma';
import { createLookupHash, encryptPii } from '@/lib/security/pii';
import { applicationSchema, type ApplicationFormData } from '@/lib/schemas/application';
import { cleanCpf } from '@/lib/validation/cpf';

type CreateCreditApplicationInput = {
  amount: number;
  months: number;
  applicant: ApplicationFormData;
};

export async function createCreditApplicationRecord(input: CreateCreditApplicationInput) {
  const access = createApplicationAccess();
  const applicant = applicationSchema.parse(input.applicant);

  const cpf = cleanCpf(applicant.cpf);
  const email = applicant.email.trim().toLowerCase();

  const cpfLookupHash = createLookupHash(cpf);

  return prisma.$transaction(async (tx) => {
    const application = await tx.creditApplication.create({
      data: {
        amount: input.amount,
        months: input.months,

        status: 'SUBMITTED',

        publicProtocol: access.protocol,
        accessTokenHash: access.tokenHash,
        submittedAt: new Date(),
      },

      select: {
        id: true,
        status: true,
        publicProtocol: true,
      },
    });

    const applicationId = application.id;

    await tx.applicantData.create({
      data: {
        applicationId,

        nameEncrypted: encryptPii(applicant.name.trim(), `${applicationId}:name`),

        cpfEncrypted: encryptPii(cpf, `${applicationId}:cpf`),

        cpfLookupHash,

        birthDateEncrypted: encryptPii(applicant.birthDate, `${applicationId}:birthDate`),

        emailEncrypted: encryptPii(email, `${applicationId}:email`),

        phoneEncrypted: encryptPii(applicant.phone, `${applicationId}:phone`),

        addressEncrypted: encryptPii(
          JSON.stringify({
            cep: applicant.cep,
            street: applicant.street.trim(),
            number: applicant.number.trim(),
            complement: applicant.complement?.trim() || null,
            neighborhood: applicant.neighborhood.trim(),
            city: applicant.city.trim(),
            state: applicant.state.trim().toUpperCase(),
          }),
          `${applicationId}:address`,
        ),

        employmentEncrypted: encryptPii(
          JSON.stringify({
            employmentType: applicant.employmentType,
            occupation: applicant.occupation.trim(),
          }),
          `${applicationId}:employment`,
        ),

        incomeEncrypted: encryptPii(applicant.monthlyIncome, `${applicationId}:income`),
      },
    });

    return {
      id: application.id,
      status: application.status,
      protocol: access.protocol,
      accessToken: access.token,
    };
  });
}

export async function findApplicationForSession(protocol: string, accessToken: string) {
  const tokenHash = hashApplicationToken(accessToken);

  return prisma.creditApplication.findFirst({
    where: {
      publicProtocol: protocol,
      accessTokenHash: tokenHash,
    },

    select: {
      publicProtocol: true,
      status: true,
      amount: true,
      months: true,
      submittedAt: true,
    },
  });
}
