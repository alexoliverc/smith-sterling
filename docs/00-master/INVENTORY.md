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
| Fase 61 — conectividade GTM e Ads | `IN_PROGRESS` | conversa compartilhada `CONECTIVIDADE GTM E ADS`; subfase 61.3B registrada e reconciliada com o código |
| Demais fases do roadmap (~130) | `UNKNOWN` | sem fonte recuperada no Git acessível |

## Metadados GitHub recuperados

- `IMPLEMENTED` — PR [#1](https://github.com/alexoliverc/smith-sterling/pull/1) foi mesclada em 2026-08-15 e contém 96 commits de implementação.
- `IMPLEMENTED` — A consulta pública retornou zero milestones, zero tags, zero releases e nenhuma issue de roadmap; existe apenas a PR nº 1.
- `UNKNOWN` — Projetos, documentos privados, conversas e outros sistemas externos que possam conter o plano original.

## Observação de conteúdo

Há menções genéricas a seguro em páginas públicas de termos/contato, orientando que ele não pode ser condição do crédito. Isso não comprova funcionalidade de seguro, mas requer revisão editorial para garantir aderência à decisão de escopo do ADR-0002.
