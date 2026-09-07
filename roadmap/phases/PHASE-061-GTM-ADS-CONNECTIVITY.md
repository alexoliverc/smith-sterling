# Fase 61 — Conectividade GTM e Ads

## Fonte

- Conversa compartilhada: `CONECTIVIDADE GTM E ADS`.
- Registro fornecido em 2026-09-07: cobre explicitamente a subfase `61.3B`.
- Evidência técnica relacionada: commits `2e75cc6`, `8aeed12`, `e7933f3` e `39129c3`.

## Objetivo recuperado

Conectar o Google Tag Manager ao GA4 sem disparar analytics antes do consentimento de Analytics, seguindo o desenho de Basic Consent Mode definido para a Smith Sterling.

## Identificadores de configuração

| Item | Valor |
| --- | --- |
| Container GTM | `GTM-K4LWQKTM` |
| Propriedade GA4 | `550172157` |
| Fluxo Web GA4 | `15448857568` |
| Measurement ID GA4 | `G-XMJVDV1DLW` |

Esses identificadores não são segredos; não incluem credenciais nem permissões administrativas.

## 61.3B — Google Tag condicionada ao consentimento

### Decisões

- `DECIDED` — Não usar `Initialization - All Pages` para a Google Tag.
- `DECIDED` — Não adicionar “consentimento adicional obrigatório” à Google Tag; o controle pretendido é feito pelos acionadores e pelo estado de consentimento.
- `DECIDED` — O GA4 não deve disparar para visitante novo antes de Analytics ser autorizado.

### Configuração recuperada do registro

| Artefato GTM | Configuração |
| --- | --- |
| Google Tag | `GA4 | Etiqueta do Google | Smith Sterling` com Tag ID `G-XMJVDV1DLW` |
| Variável | `JS | Analytics consent salvo`, JavaScript personalizado que lê `smith_sterling_consent_v1` e retorna verdadeiro somente quando `version === 1` e `analytics === true` |
| Acionador 1 | `GA4 | Analytics já autorizado`: tipo Initialization; condição `JS | Analytics consent salvo` igual a `true` |
| Acionador 2 | `GA4 | Analytics concedido agora`: evento personalizado `smith_consent_update`; condição `JS | Analytics consent salvo` igual a `true` |

### Estado de evidência

- `IMPLEMENTED` — O código injeta o container GTM e define o consentimento padrão antes da interação do usuário em `src/app/layout.tsx`.
- `IMPLEMENTED` — O banner grava a escolha em `smith_sterling_consent_v1`, emite `gtag('consent', 'update', ...)` e publica `smith_consent_update` com os estados de Analytics e Marketing em `src/components/consent/consent-banner.tsx`.
- `IN_PROGRESS` — O registro confirma a criação/validação visual da variável e dos dois acionadores no GTM. A confirmação final de que ambos foram adicionados à Google Tag, salvos no container e testados não está presente no trecho fornecido.
- `PLANNED` — Preview/Tag Assistant e publicação somente após os testes abaixo.

## Critérios de aceite recuperados

| Cenário | Resultado esperado |
| --- | --- |
| Primeira visita, sem consentimento | A tag GA4 não dispara. |
| Primeira visita, usuário autoriza Analytics | `smith_consent_update` ocorre e a tag GA4 dispara. |
| Visita posterior com Analytics autorizado | A tag GA4 dispara no acionador Initialization condicionado. |

## Pendências e riscos

- `UNKNOWN` — Se a Google Tag recebeu os dois acionadores e foi salva no container.
- `UNKNOWN` — Resultado do Preview/Tag Assistant para os três cenários.
- `UNKNOWN` — Se o container foi publicado e qual versão foi publicada.
- `UNKNOWN` — Configurações posteriores de Google Ads, conversões ou tags de marketing; elas não aparecem no material fornecido.

Não publicar ou declarar Basic Consent Mode operacional sem evidência dos três cenários de aceite.
