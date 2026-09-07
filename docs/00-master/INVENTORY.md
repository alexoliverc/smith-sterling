# Inventário de Evidências

| Alegação | Estado | Evidência |
| --- | --- | --- |
| SCD e crédito com recursos próprios | `DECIDED` | contexto de projeto; ADR-0001 |
| Sem seguros | `DECIDED` | contexto de projeto; ADR-0002 |
| Segurança transversal | `DECIDED` | contexto de projeto; ADR-0003 |
| Plataforma e fluxos de crédito | `IMPLEMENTED` | `src/`, `prisma/`, `tests/` no commit `39129c3` |
| 29 arquivos/142 testes | `IMPLEMENTED` | execução local em cópia limpa de `39129c3`, 2026-09-07 |
| Produção bloqueada por requisitos institucionais | `IMPLEMENTED` | `src/config/institution.ts` e `src/config/runtime-env.ts` |
| Dados e autorização oficiais | `IN_PROGRESS` | valores provisórios e `authorizationConfirmed: false` |
| Fase 60 de DR | `IN_PROGRESS` | branch `ops/phase-60-disaster-recovery`, sem merge |
| Fase 61 em 2026-08-22 e ~130 fases | `UNKNOWN` | sem fonte recuperada no Git acessível |

## Observação de conteúdo

Há menções genéricas a seguro em páginas públicas de termos/contato, orientando que ele não pode ser condição do crédito. Isso não comprova funcionalidade de seguro, mas requer revisão editorial para garantir aderência à decisão de escopo do ADR-0002.
