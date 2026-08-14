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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function generateTemporaryPassword() {
  return `Ss!${randomBytes(18).toString('base64url')}`;
}

async function main() {
  console.log('');
  console.log('Smith Sterling — criação de administrador');
  console.log('------------------------------------------');
  console.log('');

  const name = (await rl.question('Nome do administrador: ')).trim();

  const email = normalizeEmail(await rl.question('E-mail do administrador: '));

  if (name.length < 2) {
    throw new Error('Informe um nome válido para o administrador.');
  }

  if (!isValidEmail(email)) {
    throw new Error('Informe um endereço de e-mail válido.');
  }

  const existingUser = await prisma.adminUser.findUnique({
    where: {
      email,
    },

    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new Error(`Já existe um administrador cadastrado com o e-mail ${email}.`);
  }

  const temporaryPassword = generateTemporaryPassword();

  const passwordHash = await hashPassword(temporaryPassword);

  const admin = await prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  console.log('');
  console.log('Administrador criado com sucesso ✅');
  console.log('');

  console.log(`Nome: ${admin.name}`);
  console.log(`E-mail: ${admin.email}`);
  console.log(`Perfil: ${admin.role}`);
  console.log('');

  console.log('SENHA TEMPORÁRIA — exibida uma única vez:');
  console.log('');

  console.log(temporaryPassword);

  console.log('');
  console.log('Guarde essa senha em local seguro.');
  console.log('Ela não está armazenada em texto puro no banco.');
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
