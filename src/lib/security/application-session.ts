import 'server-only';

import {
  createHash,
  randomBytes,
} from 'node:crypto';

export function createApplicationAccess() {
  const protocol =
    `SS-${randomBytes(9)
      .toString('base64url')
      .toUpperCase()}`;

  const token =
    createApplicationToken();

  return {
    protocol,
    token,
    tokenHash:
      hashApplicationToken(token),
  };
}

export function createApplicationToken() {
  return randomBytes(32).toString(
    'base64url',
  );
}

export function hashApplicationToken(
  token: string,
) {
  return createHash('sha256')
    .update(token)
    .digest('hex');
}
