# Roadmap Master

## Regra de recuperação

O roadmap original, relatado como aproximadamente 130 fases, ainda não foi encontrado no Git acessível. Não criar, renumerar ou preencher fases por inferência a partir de commits.

## Evidência disponível

- `IN_PROGRESS` — Existe `ops/phase-60-disaster-recovery` em `02c4997`, branch não mesclada que adiciona runbooks de backup e disaster recovery.
- `UNKNOWN` — Não há fonte verificável para fases 1–59, fase 61, fases seguintes ou para o checkpoint relatado em 2026-08-22.

## Procedimento

1. Recuperar o plano original da fonte primária.
2. Copiar IDs e títulos sem alteração para `PHASES.md`.
3. Ligar cada fase a commits, testes, ADRs, artefatos e critérios de aceite apenas quando houver evidência.
4. Atualizar `PHASE_STATUS.md` e `DEPENDENCY_MAP.md` mantendo lacunas como `UNKNOWN`.
