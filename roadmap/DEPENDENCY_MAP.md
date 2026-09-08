# Mapa de Dependências

`UNKNOWN` — O plano original não foi recuperado, portanto dependências formais de fases não podem ser afirmadas.

| Item | Depende de | Evidência | Estado |
| --- | --- | --- | --- |
| Produção | dados institucionais definitivos e autorização regulatória | bloqueios em `src/config/institution.ts` e `src/config/runtime-env.ts` | `IN_PROGRESS` |
| Phase 60? — disaster recovery | decisão sobre a branch e validação operacional | `ops/phase-60-disaster-recovery` | `IN_PROGRESS` |
| Fase 61 — conectividade GTM e Ads | bootstrap de consentimento, evento `smith_consent_update`, variável e acionadores no GTM | `src/app/layout.tsx`, `src/components/consent/consent-banner.tsx`, conversa `CONECTIVIDADE GTM E ADS`; confirmação do responsável em 2026-09-07 | `IMPLEMENTED` |
