import 'dotenv/config';

import { randomBytes } from 'node:crypto';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';

import { hashPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/prisma';

const rl = createInterface({
  input,
  output,
});

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function generateTemporaryPassword() {
  return `Ss!${randomBytes(18).toString('base64url')}`;
}

async function main() {
  console.log('');
  console.log('Smith Sterling — redefinição de senha');
  console.log('--------------------------------------');
  console.log('');

  const email = normalizeEmail(await rl.question('E-mail do administrador: '));

  const admin = await prisma.adminUser.findUnique({
    where: {
      email,
    },

    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });

  if (!admin) {
    throw new Error('Administrador não encontrado.');
  }

  if (!admin.isActive) {
    throw new Error('Este administrador está desativado.');
  }

  const newPassword = generateTemporaryPassword();

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.adminUser.update({
      where: {
        id: admin.id,
      },

      data: {
        passwordHash,
      },
    });

    await tx.adminSession.deleteMany({
      where: {
        userId: admin.id,
      },
    });
  });

  console.log('');
  console.log('Senha redefinida com sucesso ✅');
  console.log('');

  console.log(`Administrador: ${admin.name}`);
  console.log(`E-mail: ${admin.email}`);

  console.log('');
  console.log('NOVA SENHA — exibida uma única vez:');
  console.log('');

  console.log(newPassword);

  console.log('');
  console.log('As sessões administrativas anteriores foram encerradas.');
  console.log('Guarde esta senha em local seguro.');
}

main()
  .catch((error) => {
    console.error('');

    console.error(error instanceof Error ? error.message : error);

    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();

    await prisma.$disconnect();
  });
