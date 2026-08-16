# Smith Sterling — Disaster Recovery Runbook

## 1. Propósito

Este documento descreve o procedimento técnico mínimo para recuperar
a Smith Sterling após indisponibilidade grave, perda de banco,
corrupção de dados ou perda do ambiente de hospedagem.

## 2. Princípio fundamental

Recuperação deve ser executada de forma controlada.

Nunca restaurar imediatamente sobre produção sem antes:

1. identificar o incidente;
2. preservar evidências;
3. selecionar um backup válido;
4. verificar checksum;
5. executar restore isolado;
6. validar estrutura e migrations;
7. decidir formalmente pelo cutover.

## 3. Fontes de recuperação

### Código

Fonte:

GitHub.

Recuperar:

- commit estável;
- tag/checkpoint correspondente;
- migrations Prisma;
- package-lock;
- configuração versionada.

### Banco

Fonte:

backup MariaDB criptografado.

O backup deve possuir:

- arquivo `.sql.gz.enc`;
- manifest correspondente;
- SHA-256 válido.

### Segredos

Segredos devem ser recuperados através do processo seguro de custódia.

Incluem:

- DATABASE_URL;
- PII_ENCRYPTION_KEY;
- PII_LOOKUP_KEY;
- credenciais administrativas;
- passphrase de backup.

Segredos não estão e não devem estar no Git.

## 4. Triagem inicial

Antes de qualquer restore:

- confirmar indisponibilidade;
- determinar se o problema é aplicação, banco ou infraestrutura;
- verificar último deployment conhecido;
- verificar logs disponíveis;
- evitar alterações destrutivas;
- registrar horário aproximado do incidente.

## 5. Seleção do backup

Selecionar o backup anterior ao incidente.

Verificar:

- data;
- manifest;
- tamanho;
- SHA-256;
- migrations registradas.

Se o checksum divergir, o arquivo não deve ser utilizado.

## 6. Restore isolado

Antes de qualquer restore de produção:

- criar MariaDB temporário;
- não publicar portas;
- utilizar rede isolada quando possível;
- utilizar armazenamento descartável;
- descriptografar o backup;
- descompactar;
- importar;
- validar banco restaurado.

O SQL plaintext não deve ser gravado persistentemente em disco.

## 7. Validação mínima

Após restore isolado, validar:

- conexão;
- versão MariaDB compatível;
- quantidade de tabelas;
- `_prisma_migrations`;
- migrations aplicadas;
- migrations incompletas;
- migrations revertidas;
- integridade mínima das entidades fundamentais.

Os valores esperados devem corresponder ao manifest e ao estado
conhecido no momento do backup.

## 8. Validação de aplicação

Depois que o banco for considerado recuperável:

- configurar ambiente não público;
- executar runtime validation;
- executar Prisma migration status;
- executar database readiness;
- executar testes aplicáveis;
- validar autenticação administrativa;
- validar fluxo de leitura essencial.

## 9. Cutover

Somente após aprovação técnica:

- preparar infraestrutura definitiva;
- aplicar configuração segura;
- restaurar banco aprovado;
- configurar chaves corretas;
- iniciar aplicação;
- validar health/readiness;
- validar rotas públicas;
- validar autenticação;
- monitorar erros.

## 10. Pós-recuperação

Após estabilização:

- registrar causa;
- registrar backup utilizado;
- registrar tempo de recuperação;
- registrar eventual perda de dados;
- revisar RPO/RTO;
- atualizar este runbook;
- criar novo backup completo validado.

## 11. Evidência de primeiro restore validado

Em 16/08/2026 foi realizado o primeiro teste técnico de disaster recovery.

Resultado:

- backup criptografado disponível off-site;
- SHA-256 validado;
- MariaDB 11.8 isolado;
- rede do container desativada;
- armazenamento temporário;
- descriptografia validada;
- gzip validado;
- importação SQL validada;
- 11 tabelas restauradas;
- 13 migrations aplicadas;
- 0 migrations incompletas;
- 0 migrations revertidas;
- produção não alterada;
- banco de integração não alterado;
- ambiente temporário destruído após a prova.

Este teste comprova recuperabilidade técnica do backup utilizado.