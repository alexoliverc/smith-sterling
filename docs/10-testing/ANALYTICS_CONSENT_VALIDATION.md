# Validação de Analytics e Consentimento

## Teste de código já realizado

`IMPLEMENTED` — `npm test` passou no commit `39129c3` em 2026-09-07: 29 arquivos e 142 testes.

## Validação externa pendente da fase 61

Execute em Preview/Tag Assistant do container GTM antes de publicar:

1. Limpar o armazenamento local; visitar o site; confirmar que `GA4 | Etiqueta do Google | Smith Sterling` não dispara.
2. Autorizar somente Analytics; confirmar emissão de `smith_consent_update`, `analytics_consent = granted` e disparo da Google Tag.
3. Recarregar; confirmar que `JS | Analytics consent salvo` é verdadeiro e o acionador Initialization dispara a Google Tag.
4. Revogar/recusar Analytics; confirmar que não há disparo em visita posterior.

Registre data, versão do container GTM, ambiente, resultado e captura/URL de evidência em `evidence/analytics/` sem incluir dados pessoais.
