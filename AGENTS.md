# Smith Sterling — Regras para Agentes

- Trate Git e a documentação versionada como fonte de verdade; conversas são contexto, nunca evidência suficiente de implementação.
- Antes de mudar produto, arquitetura, segurança, compliance ou roadmap, leia `README.md`, `MEMORY.md`, `HANDOFF.md`, `docs/00-master/`, `roadmap/` e ADRs relevantes.
- Não reinicie o projeto, não renumere fases e não reconstitua fases ausentes por inferência.
- Smith Sterling segue a direção de uma SCD brasileira de crédito digital com recursos próprios. Seguro está definitivamente fora de escopo.
- Segurança é transversal: incorpore-a às mudanças sem usá-la como motivo para reiniciar o programa.
- Use somente `DECIDED`, `IMPLEMENTED`, `IN_PROGRESS`, `PLANNED` e `UNKNOWN` para afirmações de estado. Código, commit, teste, pipeline ou aprovação devem ser citados como evidência.
- Não exponha ou adicione segredos ao Git. Preserve a separação entre ambientes e os bloqueios de produção existentes.
- Registre decisões duráveis em `decisions/`, atualize `MEMORY.md` para fatos consolidados e adicione uma nota em `memory/YYYY-MM-DD.md` ao fim de trabalho substantivo.
