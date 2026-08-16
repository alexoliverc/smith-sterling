import {
  randomUUID,
} from 'node:crypto';

import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  prisma,
} from '../../src/lib/prisma';

import {
  createAdminSession,
  findAdminSession,
} from '../../src/server/auth/admin-session';

const userIds =
  new Set<string>();

afterEach(
  async () => {
    vi.useRealTimers();

    if (
      userIds.size >
      0
    ) {
      await prisma
        .adminUser
        .deleteMany({
          where: {
            id: {
              in: [
                ...userIds,
              ],
            },
          },
        });

      userIds.clear();
    }
  },
);

async function createSyntheticAdmin() {
  const suffix =
    randomUUID();

  const admin =
    await prisma
      .adminUser
      .create({
        data: {
          name:
            'Synthetic Session Admin',

          email:
            `session-${suffix}@example.invalid`,

          /*
           * O teste não autentica por senha.
           */
          passwordHash:
            'synthetic-not-used',

          role:
            'SUPER_ADMIN',

          isActive:
            true,
        },

        select: {
          id:
            true,
        },
      });

  userIds.add(
    admin.id,
  );

  return admin;
}

describe(
  'admin session lifecycle integration',
  () => {
    it(
      'cria sessão com lastUsedAt preenchido',
      async () => {
        const admin =
          await createSyntheticAdmin();

        const session =
          await createAdminSession(
            admin.id,
          );

        const stored =
          await prisma
            .adminSession
            .findFirst({
              where: {
                userId:
                  admin.id,
              },

              select: {
                lastUsedAt:
                  true,

                expiresAt:
                  true,
              },
            });

        expect(
          stored,
        ).not.toBeNull();

        expect(
          stored?.lastUsedAt,
        ).toBeInstanceOf(
          Date,
        );

        expect(
          stored?.expiresAt.getTime(),
        ).toBeGreaterThan(
          Date.now(),
        );

        const resolved =
          await findAdminSession(
            session.token,
          );

        expect(
          resolved?.user.id,
        ).toBe(
          admin.id,
        );
      },
    );

    it(
      'invalida e remove sessão ociosa por trinta minutos',
      async () => {
        const admin =
          await createSyntheticAdmin();

        const created =
          await createAdminSession(
            admin.id,
          );

        const stored =
          await prisma
            .adminSession
            .findFirstOrThrow({
              where: {
                userId:
                  admin.id,
              },

              select: {
                id:
                  true,
              },
            });

        await prisma
          .adminSession
          .update({
            where: {
              id:
                stored.id,
            },

            data: {
              lastUsedAt:
                new Date(
                  Date.now() -
                    31 *
                      60 *
                      1000,
                ),
            },
          });

        const resolved =
          await findAdminSession(
            created.token,
          );

        expect(
          resolved,
        ).toBeNull();

        const remains =
          await prisma
            .adminSession
            .count({
              where: {
                id:
                  stored.id,
              },
            });

        expect(
          remains,
        ).toBe(0);
      },
    );

    it(
      'renova lastUsedAt depois do intervalo de touch',
      async () => {
        const admin =
          await createSyntheticAdmin();

        const created =
          await createAdminSession(
            admin.id,
          );

        const stored =
          await prisma
            .adminSession
            .findFirstOrThrow({
              where: {
                userId:
                  admin.id,
              },

              select: {
                id:
                  true,
              },
            });

        const oldActivity =
          new Date(
            Date.now() -
              6 *
                60 *
                1000,
          );

        await prisma
          .adminSession
          .update({
            where: {
              id:
                stored.id,
            },

            data: {
              lastUsedAt:
                oldActivity,
            },
          });

        const resolved =
          await findAdminSession(
            created.token,
          );

        expect(
          resolved,
        ).not.toBeNull();

        const touched =
          await prisma
            .adminSession
            .findUniqueOrThrow({
              where: {
                id:
                  stored.id,
              },

              select: {
                lastUsedAt:
                  true,
              },
            });

        expect(
          touched.lastUsedAt,
        ).not.toBeNull();

        expect(
          touched
            .lastUsedAt!
            .getTime(),
        ).toBeGreaterThan(
          oldActivity.getTime(),
        );
      },
    );

    it(
      'continua invalidando pela expiração absoluta',
      async () => {
        const admin =
          await createSyntheticAdmin();

        const created =
          await createAdminSession(
            admin.id,
          );

        const stored =
          await prisma
            .adminSession
            .findFirstOrThrow({
              where: {
                userId:
                  admin.id,
              },

              select: {
                id:
                  true,
              },
            });

        await prisma
          .adminSession
          .update({
            where: {
              id:
                stored.id,
            },

            data: {
              expiresAt:
                new Date(
                  Date.now() -
                    1000,
                ),

              lastUsedAt:
                new Date(),
            },
          });

        const resolved =
          await findAdminSession(
            created.token,
          );

        expect(
          resolved,
        ).toBeNull();

        const remains =
          await prisma
            .adminSession
            .count({
              where: {
                id:
                  stored.id,
              },
            });

        expect(
          remains,
        ).toBe(0);
      },
    );

    it(
      'remove sessão quando o administrador é desativado',
      async () => {
        const admin =
          await createSyntheticAdmin();

        const created =
          await createAdminSession(
            admin.id,
          );

        await prisma
          .adminUser
          .update({
            where: {
              id:
                admin.id,
            },

            data: {
              isActive:
                false,
            },
          });

        const resolved =
          await findAdminSession(
            created.token,
          );

        expect(
          resolved,
        ).toBeNull();

        const sessions =
          await prisma
            .adminSession
            .count({
              where: {
                userId:
                  admin.id,
              },
            });

        expect(
          sessions,
        ).toBe(0);
      },
    );
  },
);
