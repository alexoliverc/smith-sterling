import { createRequire } from 'node:module';

import { validateRuntimeEnvironment } from '@/config/runtime-env';

const require = createRequire(import.meta.url);

const {
  loadEnvConfig,
}: typeof import('@next/env') =
  require('@next/env');

loadEnvConfig(
  process.cwd(),
);

validateRuntimeEnvironment();

console.log(
  'Runtime environment validado.',
);
