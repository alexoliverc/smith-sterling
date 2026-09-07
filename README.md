# Smith Sterling

Plataforma digital de crédito da Smith Sterling. Este repositório e sua documentação versionada são a fonte de verdade para continuidade entre pessoas e agentes de IA.

## Estado verificado

- `DECIDED` — Direção do projeto: Sociedade de Crédito Direto (SCD) brasileira, com crédito digital por recursos próprios.
- `DECIDED` — Seguros estão definitivamente excluídos do escopo.
- `IMPLEMENTED` — Aplicação Next.js/React/TypeScript, Prisma e MySQL, com fluxo público de solicitação, acompanhamento, proposta e formalização, além de backoffice administrativo. Consulte `docs/00-master/PROJECT_STATE.md`.
- `IMPLEMENTED` — Em 2026-09-07, no commit `39129c3`, `npm test` passou: 29 arquivos e 142 testes.
- `IN_PROGRESS` — Segurança é uma trilha transversal; produção e autorização regulatória não estão comprovadas.
- `UNKNOWN` — As ~130 fases e o checkpoint exato da fase 61 ainda precisam ser recuperados do plano original.

## Comece aqui

1. Leia `AGENTS.md`, `MEMORY.md`, `HANDOFF.md` e `docs/00-master/`.
2. Verifique branch, commit e estado do worktree antes de qualquer alteração.
3. Leia os ADRs relacionados em `decisions/`.
4. Atualize memória, checkpoint e documentação com evidência ao encerrar uma sessão.

## Comandos

```text
npm test
npm run test:integration
npm run lint
npm run staging:preflight
npm run production:readiness
```

O sucesso de testes não é evidência de prontidão para produção. Consulte `docs/11-deployment/PRODUCTION_READINESS.md`.
