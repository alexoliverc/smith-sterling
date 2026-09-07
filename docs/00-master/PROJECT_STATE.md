# Estado do Projeto

Avaliado em 2026-09-07, no commit `39129c3e94a27c12ec716ab1698536e2943bfedf` de `main`.

| Domínio | Estado | Evidência |
| --- | --- | --- |
| Plataforma web | `IMPLEMENTED` | Next.js 16, React 19 e TypeScript em `src/` |
| Dados | `IMPLEMENTED` | Prisma/MySQL em `prisma/schema.prisma`; MySQL 8.4.11 em `compose.yaml` |
| Fluxo de crédito | `IMPLEMENTED` | páginas, workflows, DAL, migrações e testes em `src/`, `prisma/`, `tests/` |
| Backoffice | `IMPLEMENTED` | rotas `src/app/admin/`, autenticação e sessões administrativas |
| Testes unitários | `IMPLEMENTED` | `npm test`: 29 arquivos / 142 testes aprovados em 2026-09-07 |
| Hardening de runtime | `IMPLEMENTED` | `src/config/runtime-env.ts`, `next.config.ts`, controles de sessão e PII |
| Produção | `IN_PROGRESS` | bloqueios explícitos para dados institucionais e autorização regulatória pendentes |
| Autorização regulatória | `UNKNOWN` | código declara não confirmada; não há aprovação no repositório |
| Roadmap ~130 fases | `UNKNOWN` | plano não localizado no Git acessível |
| Fase 61 — conectividade GTM e Ads | `IN_PROGRESS` | conversa compartilhada recuperada; GTM/consentimento no código; Preview e publicação do container pendentes de evidência |
