# Conectividade GTM e GA4

## Implementação versionada

- `IMPLEMENTED` — `src/app/layout.tsx` carrega o container `GTM-K4LWQKTM` e executa um bootstrap `beforeInteractive` que lê `smith_sterling_consent_v1`.
- `IMPLEMENTED` — O bootstrap define `analytics_storage`, `ad_storage`, `ad_user_data` e `ad_personalization` como `granted` ou `denied` antes do carregamento normal da aplicação.
- `IMPLEMENTED` — `ConsentBanner` persiste a preferência, envia atualização de consentimento e publica o evento `smith_consent_update` no `dataLayer`.
- `IMPLEMENTED` — Commits `e7933f3` e `39129c3` adicionam e separam o analytics de funil, com contrato de eventos não identificadores em `src/lib/analytics/funnel-events.ts`.

## Configuração externa do GTM

`IN_PROGRESS` — A fase 61 registra uma Google Tag GA4 com ID `G-XMJVDV1DLW` e dois acionadores condicionados ao consentimento. A configuração do container é externa ao Git; a ligação final, Preview e publicação exigem evidência própria.

Consulte `../../roadmap/phases/PHASE-061-GTM-ADS-CONNECTIVITY.md` para a especificação e o estado de aceite.
