# Roadmap Master

## Regra de recuperação

O roadmap original, relatado como aproximadamente 130 fases, ainda não foi encontrado no Git acessível. Não criar, renumerar ou preencher fases por inferência a partir de commits.

## Evidência disponível

- `IN_PROGRESS` — Existe `ops/phase-60-disaster-recovery` em `02c4997`, branch não mesclada que adiciona runbooks de backup e disaster recovery.
- `IMPLEMENTED` — A subfase 61.3B da fase 61 foi recuperada, validada e publicada conforme confirmação do responsável em 2026-09-07. A versão e os artefatos visuais externos permanecem `UNKNOWN`.
- `UNKNOWN` — Não há fonte verificável para fases 1–59, para a parcela da fase 61 além da subfase 61.3B, para fases seguintes ou para o checkpoint relatado em 2026-08-22.

## Busca de fontes primárias

Em 2026-09-07 foram verificados Git, branches remotas, PRs, issues, milestones, tags e releases públicos. Foram encontrados 124 commits acessíveis e uma PR mesclada com 96 commits, mas nenhum roadmap de fases. Consulte `COMMIT_TIMELINE.md` para a linha do tempo técnica, que não substitui o plano.

## Procedimento

1. Recuperar o plano original da fonte primária.
2. Copiar IDs e títulos sem alteração para `PHASES.md`.
3. Ligar cada fase a commits, testes, ADRs, artefatos e critérios de aceite apenas quando houver evidência.
4. Atualizar `PHASE_STATUS.md` e `DEPENDENCY_MAP.md` mantendo lacunas como `UNKNOWN`.

Use `RECOVERY_TEMPLATE.md` ao importar a fonte original.
