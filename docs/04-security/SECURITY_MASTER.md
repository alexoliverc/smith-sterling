# Segurança — Baseline

`DECIDED` — Segurança é transversal ao programa.

## Controles verificados no código

- `IMPLEMENTED` — Cabeçalhos CSP, HSTS, X-Frame-Options, Permissions-Policy, nosniff e remoção de `X-Powered-By` em `next.config.ts`.
- `IMPLEMENTED` — Validação de ambiente exige banco MySQL, credenciais para staging/produção, e duas chaves PII Base64 de 32 bytes distintas em `src/config/runtime-env.ts`.
- `IMPLEMENTED` — Sessões e login administrativos, rate limit para login/recuperação, e hashing de senha com Argon2 WebAssembly são cobertos por código e testes.
- `IMPLEMENTED` — Proteção de dados sensíveis e não exposição indevida de dados bancários possuem testes em `tests/security/`.

## Limites de conclusão

`UNKNOWN` — Pentest, monitoramento de segurança, gestão operacional de chaves, revisão independente, incident response e eficácia em produção.
