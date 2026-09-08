# Estado do Projeto

Avaliado em 2026-09-07, no commit `6b4bb20163bb3b65a82acf517a076aeb9a2ea9e6` de `main`. O núcleo da aplicação foi inicialmente verificado em `39129c3`; a PR #2 acrescenta a fronteira de navegação descrita abaixo.

| Domínio | Estado | Evidência |
| --- | --- | --- |
| Plataforma web | `IMPLEMENTED` | Next.js 16, React 19 e TypeScript em `src/` |
| Dados | `IMPLEMENTED` | Prisma/MySQL em `prisma/schema.prisma`; MySQL 8.4.11 em `compose.yaml` |
| Fluxo de crédito | `IMPLEMENTED` | páginas, workflows, DAL, migrações e testes em `src/`, `prisma/`, `tests/` |
| Backoffice | `IMPLEMENTED` | rotas `src/app/admin/`, autenticação e sessões administrativas |
| Testes unitários | `IMPLEMENTED` | `npm test`: 29 arquivos / 142 testes aprovados em 2026-09-07 |
| Hardening de runtime | `IMPLEMENTED` | `src/config/runtime-env.ts`, `next.config.ts`, controles de sessão e PII |
| Fronteira financeira pública | `IMPLEMENTED` | PR #2 / `6b4bb20`: `HardBoundaryLink` aplicado aos acessos públicos a solicitação e acompanhamento |
| Produção | `IN_PROGRESS` | bloqueios explícitos para dados institucionais e autorização regulatória pendentes |
| Autorização regulatória | `UNKNOWN` | código declara não confirmada; não há aprovação no repositório |
| Roadmap ~130 fases | `UNKNOWN` | plano não localizado no Git acessível |
| Fase 61 — conectividade GTM e Ads | `IMPLEMENTED` | conversa compartilhada recuperada; GTM/consentimento no código; responsável confirmou Preview/Tag Assistant e publicação em 2026-09-07; versão e capturas externas são `UNKNOWN` |
