import 'server-only';

import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const KEY_LENGTH = 32;
const VERSION = 'v1';

function getEncryptionKey() {
  const value = process.env.PII_ENCRYPTION_KEY;

  if (!value) {
    throw new Error('PII_ENCRYPTION_KEY não está configurada.');
  }

  const key = Buffer.from(value, 'base64');

  if (key.length !== KEY_LENGTH) {
    throw new Error('PII_ENCRYPTION_KEY precisa conter exatamente 32 bytes.');
  }

  return key;
}

function getLookupKey() {
  const value = process.env.PII_LOOKUP_KEY;

  if (!value) {
    throw new Error('PII_LOOKUP_KEY não está configurada.');
  }

  const key = Buffer.from(value, 'base64');

  if (key.length !== KEY_LENGTH) {
    throw new Error('PII_LOOKUP_KEY precisa conter exatamente 32 bytes.');
  }

  return key;
}

export function encryptPii(value: string, context: string) {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  cipher.setAAD(Buffer.from(context, 'utf8'));

  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);

  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString('base64url'),
    authTag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

export function decryptPii(payload: string, context: string) {
  const parts = payload.split('.');

  if (parts.length !== 4) {
    throw new Error('Formato de dado criptografado inválido.');
  }

  const [version, ivValue, authTagValue, encryptedValue] = parts;

  if (version !== VERSION) {
    throw new Error('Versão de criptografia não suportada.');
  }

  const key = getEncryptionKey();

  const iv = Buffer.from(ivValue, 'base64url');

  const authTag = Buffer.from(authTagValue, 'base64url');

  const encrypted = Buffer.from(encryptedValue, 'base64url');

  const decipher = createDecipheriv(ALGORITHM, key, iv);

  decipher.setAAD(Buffer.from(context, 'utf8'));

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}

export function createLookupHash(value: string) {
  return createHmac('sha256', getLookupKey()).update(value).digest('hex');
}
