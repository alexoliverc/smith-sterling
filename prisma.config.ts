import 'dotenv/config';

import {
  defineConfig,
  env,
} from 'prisma/config';

const shadowDatabaseUrl =
  process.env.SHADOW_DATABASE_URL?.trim();

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
  },

  datasource: {
    url: env('DATABASE_URL'),

    ...(shadowDatabaseUrl
      ? {
          shadowDatabaseUrl,
        }
      : {}),
  },
});
