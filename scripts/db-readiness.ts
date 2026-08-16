import 'dotenv/config';

import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.creditApplication.findFirst({
    select: {
      id: true,
    },
  });

  console.log(
    'Conectividade com o banco e schema Prisma validados.',
  );
}

main()
  .catch(() => {
    console.error(
      'Falha ao validar conectividade com o banco.',
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });