import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  describe,
  expect,
  it,
} from 'vitest';

const packageJson = JSON.parse(
  readFileSync(
    resolve(
      process.cwd(),
      'package.json',
    ),
    'utf8',
  ),
) as {
  scripts: Record<
    string,
    string
  >;
};

const readinessSource =
  readFileSync(
    resolve(
      process.cwd(),
      'scripts/db-readiness.ts',
    ),
    'utf8',
  );

describe('staging preflight', () => {
  it('uses runtime validation, migration status and read-only database readiness', () => {
    expect(
      packageJson.scripts[
        'staging:preflight'
      ],
    ).toBe(
      'npm run prestart && prisma migrate status && npm run db:readiness',
    );

    expect(
      packageJson.scripts[
        'staging:preflight'
      ],
    ).not.toContain(
      'db:smoke',
    );

    expect(
      packageJson.scripts[
        'staging:preflight'
      ],
    ).not.toContain(
      'migrate dev',
    );
  });

  it('does not mutate application data during database readiness', () => {
    expect(
      readinessSource,
    ).not.toMatch(
      /\.(?:create|createMany|update|updateMany|upsert|delete|deleteMany)\s*\(/,
    );

    expect(
      readinessSource,
    ).not.toContain(
      '$executeRaw',
    );

    expect(
      readinessSource,
    ).not.toContain(
      '$executeRawUnsafe',
    );

    expect(
      readinessSource,
    ).not.toContain(
      '$queryRawUnsafe',
    );

    expect(
      readinessSource,
    ).toContain(
      'creditApplication.findFirst',
    );
  });

  it('does not print database records or raw exception details', () => {
    expect(
      readinessSource,
    ).not.toContain(
      'error.message',
    );

    expect(
      readinessSource,
    ).not.toMatch(
      /console\.(?:log|info|warn|error)\([^)]*application/,
    );
  });
});