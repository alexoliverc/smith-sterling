# Arquitetura de Sistema

## Baseline verificado

- `IMPLEMENTED` — Monólito web Next.js 16 com React 19 e TypeScript.
- `IMPLEMENTED` — Prisma 7 com datasource MySQL; `compose.yaml` define MySQL 8.4.11 para desenvolvimento local.
- `IMPLEMENTED` — Camadas explícitas de páginas/server actions, workflows (`src/server/workflows/`), acesso a dados (`src/server/dal/`) e validações (`src/lib/`).
- `IMPLEMENTED` — Migrações versionadas em `prisma/migrations/`.

## Não inferir

`UNKNOWN` — Topologia de produção, provedor de nuvem, rede, balanceamento, backups ativos, observabilidade e integrações externas.
