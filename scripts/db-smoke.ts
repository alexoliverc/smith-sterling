import 'dotenv/config';

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Testando conexão com o banco...');

  const application = await prisma.creditApplication.create({
    data: {
      amount: 5000,
      months: 12,
    },
  });

  console.log('Registro criado:', {
    id: application.id,
    status: application.status,
    amount: application.amount,
    months: application.months,
  });

  const foundApplication = await prisma.creditApplication.findUnique({
    where: {
      id: application.id,
    },
  });

  if (!foundApplication) {
    throw new Error('O registro criado não pôde ser recuperado.');
  }

  console.log('Registro encontrado no banco.');

  await prisma.creditApplication.delete({
    where: {
      id: application.id,
    },
  });

  console.log('Registro de teste removido.');
  console.log('Banco operacional ✅');
}

main()
  .catch((error) => {
    console.error('Falha no teste do banco:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
