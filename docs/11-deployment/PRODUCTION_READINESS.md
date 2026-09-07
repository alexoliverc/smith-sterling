# Prontidão de Produção

`IMPLEMENTED` — `npm run production:readiness` e a validação de runtime bloqueiam produção se razão social, documento, endereço, canais de atendimento/privacidade ou autorização regulatória estiverem provisórios.

`IN_PROGRESS` — `src/config/institution.ts` contém placeholders e `authorizationConfirmed: false`; portanto, produção não está pronta com o estado versionado atual.

`UNKNOWN` — Deploy ativo, pipeline de release, domínio, certificados, backup operacional, rollback, monitoramento e aprovação de go-live.
