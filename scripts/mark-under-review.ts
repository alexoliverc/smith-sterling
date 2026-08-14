import 'dotenv/config';

import { prisma } from '@/lib/prisma';

async function main() {
  const protocol = process.argv[2];

  if (!protocol) {
    throw new Error('Informe o protocolo. Exemplo: npm run status:review -- SS-XXXXXXXX');
  }

  const application = await prisma.creditApplication.findUnique({
    where: {
      publicProtocol: protocol,
    },
    select: {
      id: true,
      publicProtocol: true,
      status: true,
    },
  });

  if (!application) {
    throw new Error(`Solicitação ${protocol} não encontrada.`);
  }

  if (application.status !== 'SUBMITTED') {
    throw new Error(`A solicitação está em ${application.status}. Esperado: SUBMITTED.`);
  }

  const updated = await prisma.creditApplication.update({
    where: {
      id: application.id,
    },
    data: {
      status: 'UNDER_REVIEW',
    },
    select: {
      publicProtocol: true,
      status: true,
    },
  });

  console.log('Status atualizado ✅');
  console.log(updated);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
