import 'server-only';

import { prisma } from '@/lib/prisma';
import { createApplicationAccess, hashApplicationToken } from '@/lib/security/application-session';
import { createLookupHash, encryptPii } from '@/lib/security/pii';
import { applicationSchema, type ApplicationFormData } from '@/lib/schemas/application';
import { cleanCpf } from '@/lib/validation/cpf';

type CreateCreditApplicationInput = {
  amount: number;
  months: number;
  applicant: ApplicationFormData;
};

export async function createCreditApplicationRecord(input: CreateCreditApplicationInput) {
  const applicant = applicationSchema.parse(input.applicant);

  const cpf = cleanCpf(applicant.cpf);

  const email = applicant.email.trim().toLowerCase();

  const cpfLookupHash = createLookupHash(cpf);

  const access = createApplicationAccess();

  return prisma.$transaction(async (tx) => {
    /*
     * 1. A solicitação nasce formalmente
     *    como DRAFT.
     */
    const application = await tx.creditApplication.create({
      data: {
        amount: input.amount,
        months: input.months,

        status: 'DRAFT',

        publicProtocol: access.protocol,

        accessTokenHash: access.tokenHash,
      },

      select: {
        id: true,
        status: true,
        publicProtocol: true,
      },
    });

    const applicationId = application.id;

    /*
     * 2. Persistimos os dados cadastrais
     *    somente depois de criptografá-los.
     */
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

    /*
     * 3. Após o cadastro ter sido
     *    persistido com sucesso, a proposta
     *    é formalmente submetida.
     */
    const submittedAt = new Date();

    const submitted = await tx.creditApplication.update({
      where: {
        id: applicationId,
      },

      data: {
        status: 'SUBMITTED',
        submittedAt,
      },

      select: {
        id: true,
        status: true,
        publicProtocol: true,
        submittedAt: true,
      },
    });

    /*
     * 4. Registramos a primeira transição
     *    do ciclo de vida.
     */
    await tx.applicationStatusHistory.create({
      data: {
        applicationId,

        fromStatus: 'DRAFT',
        toStatus: 'SUBMITTED',

        actorType: 'SYSTEM',

        reason: 'Solicitação enviada pelo cliente.',
      },
    });

    /*
     * Tudo acima faz parte da mesma
     * transação.
     */
    return {
      id: submitted.id,
      status: submitted.status,

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
