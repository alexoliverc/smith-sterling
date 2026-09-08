# Smith Sterling — Política de Backup

## 1. Objetivo

Esta política define os controles mínimos de backup e recuperação
dos dados operacionais da Smith Sterling.

O objetivo é garantir que uma falha de aplicação, banco de dados,
hospedagem ou erro operacional não resulte em perda irrecuperável
dos registros da plataforma.

## 2. Escopo

A estratégia de recuperação deve tratar separadamente:

- código-fonte;
- migrations;
- banco MariaDB;
- configuração de runtime;
- chaves de criptografia de PII;
- credenciais operacionais;
- artefatos de deployment;
- documentação de recuperação.

## 3. Código-fonte

O GitHub é a fonte autoritativa do código da aplicação.

Requisitos:

- main deve representar o estado publicado;
- checkpoints estáveis devem possuir tags;
- segredos nunca devem ser armazenados no Git;
- migrations Prisma devem permanecer versionadas.

## 4. Banco de dados

Os backups do MariaDB devem ser gerados com leitura consistente.

Requisitos mínimos:

- dump lógico;
- single transaction quando aplicável;
- compressão;
- criptografia antes do armazenamento permanente;
- checksum SHA-256;
- manifest contendo metadados técnicos;
- nenhuma cópia SQL plaintext persistente.

## 5. Criptografia

Backups contendo dados da plataforma devem permanecer criptografados.

O material necessário para descriptografia não deve ser armazenado:

- no Git;
- junto ao próprio backup;
- dentro do código-fonte;
- em arquivos públicos do servidor.

A perda da PII_ENCRYPTION_KEY pode tornar dados restaurados
criptograficamente inutilizáveis.

Portanto, chaves de PII devem possuir estratégia independente
de custódia e recuperação.

## 6. Retenção mínima

Durante a fase atual do projeto:

| Frequência | Retenção |
|---|---:|
| Diário | 7 cópias |
| Semanal | 4 cópias |
| Mensal | 6 cópias |

Esta política deverá ser reavaliada antes da operação comercial.

## 7. Off-site

Um backup não deve existir somente no mesmo ambiente da aplicação.

No mínimo:

- uma cópia no ambiente de hospedagem;
- uma cópia externa criptografada.

Para operação comercial, deverá existir uma segunda localização
off-site independente do computador operacional principal.

## 8. Validação

Cada backup deve possuir SHA-256.

A cópia off-site deve ser comparada contra o checksum produzido
na origem.

Backup sem verificação de integridade não deve ser considerado válido.

## 9. Restore drill

Deve ser realizado teste periódico de restauração.

Periodicidade mínima inicial:

- uma vez por mês;
- após mudanças significativas na arquitetura de persistência;
- após alterações relevantes na estratégia de backup.

O restore deve ocorrer em ambiente isolado.

Nunca restaurar diretamente sobre produção apenas para testar
a validade de um backup.

## 10. Critérios de restore

Uma recuperação somente é considerada válida quando:

- o arquivo criptografado pode ser descriptografado;
- a compressão pode ser validada;
- o SQL pode ser importado;
- todas as tabelas esperadas existem;
- todas as migrations esperadas estão aplicadas;
- não existem migrations incompletas inesperadas;
- verificações mínimas de integridade passam.

## 11. RPO e RTO

RPO e RTO comerciais ainda não estão formalmente definidos.

Até sua definição, esta política é uma baseline técnica de engenharia
e não deve ser interpretada como SLA contratual ou regulatório.

## 12. Proibições

É proibido:

- enviar backup plaintext por e-mail;
- colocar dump de produção no Git;
- armazenar senha de backup no repositório;
- armazenar chaves PII no repositório;
- restaurar backup de produção sobre banco ativo sem procedimento formal;
- utilizar banco de produção como ambiente de teste de disaster recovery.