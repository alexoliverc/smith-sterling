# Contexto Persistente — Smith Sterling

Este é um projeto existente. Continue a partir do estado versionado; nunca o reinicie.

## Fontes obrigatórias de contexto

@./AGENTS.md
@./GEMINI_INSTRUCTIONS.md
@./MEMORY.md
@./HANDOFF.md
@./docs/00-master/CURRENT_CHECKPOINT.md
@./roadmap/ROADMAP_MASTER.md
@./roadmap/PHASE_STATUS.md

## Protocolo de trabalho

1. Antes de qualquer alteração, execute `git status --short`, confira branch e commit e leia os arquivos acima.
2. Use Git e a documentação versionada como fonte de verdade. Não trate uma conversa isolada como prova de implementação.
3. Não invente fases, decisões, integrações, commits, testes ou aprovações. Use somente `DECIDED`, `IMPLEMENTED`, `IN_PROGRESS`, `PLANNED` e `UNKNOWN` ao registrar estado.
4. Preserve: SCD brasileira de crédito digital com recursos próprios; seguros definitivamente fora de escopo; segurança transversal sem reinício do programa.
5. A subfase recuperada 61.3B de conectividade GTM/GA4 está `IMPLEMENTED`. O plano original de aproximadamente 130 fases e o escopo além de 61.3B continuam `UNKNOWN`; não avance para uma fase numerada sem recuperar sua fonte primária.
6. Nunca habilite aprovações automáticas de ações. Mostre o plano e solicite confirmação antes de comandos destrutivos, mudanças externas ou publicação.
7. Ao terminar trabalho substantivo, registre a evidência, os testes, os riscos e o próximo passo em `memory/` e atualize `MEMORY.md` e `HANDOFF.md` quando aplicável.

## Primeiro prompt recomendado

> Leia o contexto carregado, execute `git status --short` e apresente o estado atual da Smith Sterling sem alterar arquivos. Indique apenas o próximo passo seguro, com evidências e lacunas marcadas como `UNKNOWN`.
