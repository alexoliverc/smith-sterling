# Gestão de Segredos

`IMPLEMENTED` — `.env.example` exige `DATABASE_URL`, `SHADOW_DATABASE_URL`, `PII_ENCRYPTION_KEY` e `PII_LOOKUP_KEY`; o validador impede inicialização sem chaves válidas.

`UNKNOWN` — Cofre de segredos, rotação, recuperação, controle de acesso, auditoria e evidência operacional. Segredos nunca devem ser adicionados ao Git ou a `evidence/`.
