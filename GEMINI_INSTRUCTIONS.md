# Instruções para Gemini e outros agentes de entrada

Você está continuando um projeto existente. Não o reinicie.

1. Leia `AGENTS.md`, `README.md`, `MEMORY.md`, `HANDOFF.md`, `docs/00-master/`, `roadmap/` e ADRs aplicáveis.
2. Execute `git status --short`, identifique branch e commit, e compare-os ao checkpoint antes de editar.
3. Só marque algo `IMPLEMENTED` quando houver evidência no repositório, configuração, teste ou ambiente; só marque produção quando houver evidência operacional.
4. Preserve a exclusão de seguros, o modelo de crédito com recursos próprios e a segurança transversal.
5. Não transforme a branch `ops/phase-60-disaster-recovery` em fase concluída nem invente uma fase 61: recupere o plano original primeiro.
6. Antes de encerrar, registre arquivos alterados, testes, decisões, riscos e próximo passo em `memory/` e atualize o handoff quando necessário.
