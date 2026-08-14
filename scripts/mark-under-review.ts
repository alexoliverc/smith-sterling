import 'dotenv/config';

import { prisma } from '@/lib/prisma';
import { transitionApplicationStatus } from '@/server/workflows/application-status';

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

  const updated = await transitionApplicationStatus(application.id, 'UNDER_REVIEW', {
    actorType: 'SYSTEM',
    reason: 'Análise iniciada por comando interno de desenvolvimento.',
  });

  console.log('Status atualizado com auditoria ✅');

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
