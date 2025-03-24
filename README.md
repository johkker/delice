# Delice - Aplicativo de Gestão de Produtos Artesanais

Uma aplicação fullstack para gerenciar produtos artesanais, lojas e pedidos.

## Requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuração com Docker

### Iniciar o ambiente

Para iniciar todos os serviços (PostgreSQL, PgAdmin e API):

```bash
npm run docker:up
```

A primeira execução pode levar alguns minutos enquanto as imagens são baixadas e construídas.

### Acessar os serviços

- **API**: http://localhost:3333
- **API Docs (Swagger)**: http://localhost:3333/documentation
- **PgAdmin**: http://localhost:5050
  - Email: admin@delice.com
  - Senha: delice

### Para conectar ao banco de dados via PgAdmin:

1. Acesse PgAdmin em http://localhost:5050
2. Faça login com as credenciais acima
3. Adicione um novo servidor com:
   - Nome: Delice
   - Host: postgres (nome do serviço no docker-compose)
   - Porta: 5432
   - Usuário: delice
   - Senha: delice

### Configuração de Email (Brevo)

O sistema envia emails de boas-vindas aos usuários quando eles se registram usando o serviço Brevo (anteriormente Sendinblue). Para configurar:

1. Configure as variáveis de ambiente relacionadas ao email no arquivo `.env`:
   ```
   BREVO_API_KEY=sua-chave-api-brevo
   BREVO_SMTP_SERVER=smtp-relay.brevo.com
   BREVO_SMTP_PORT=587
   BREVO_SMTP_LOGIN=seu-login-smtp
   BREVO_SENDER_EMAIL=no-reply@delice.com
   BREVO_SENDER_NAME=Delice
   ```

2. Para desenvolvimento e testes, você pode usar o servidor SMTP fornecido pela Brevo:
   - Servidor: smtp-relay.brevo.com
   - Porta: 587
   - Login: 88b419001@smtp-brevo.com

### Configuração de SMS

O sistema envia códigos de verificação por SMS durante o processo de registro. Para configurar:

1. Configure as variáveis de ambiente relacionadas ao SMS no arquivo `.env`:
   ```
   SMS_ENABLED=true
   SMS_LOG_ONLY=true # Em produção, altere para false
   ```

2. O sistema utiliza a API da Brevo para envio de SMS, assim como para emails. A mesma chave de API (BREVO_API_KEY) é usada para ambos os serviços, não sendo necessário nenhuma configuração adicional além da já existente para email.

3. Em ambiente de desenvolvimento, com SMS_LOG_ONLY=true, os SMS não são realmente enviados, apenas logados no console para facilitar testes.

4. Para ativar o envio real de SMS em produção, altere SMS_LOG_ONLY para false no arquivo .env.

### Configuração de Redis

O sistema utiliza Redis para armazenar dados temporários e fazer cache, especialmente para os tokens de verificação durante o cadastro. Configuração:

1. Configure as variáveis de ambiente relacionadas ao Redis no arquivo `.env`:
   ```
   REDIS_HOST=seu-host-redis
   REDIS_PORT=6379
   REDIS_USERNAME=default
   REDIS_PASSWORD=sua-senha
   ```

2. O sistema está configurado para usar o Redis Cloud por padrão, mas você pode usar qualquer instância Redis modificando as variáveis no `.env`.

3. Os dados de verificação de cadastro são armazenados no Redis com expiração automática de 10 minutos, não sendo necessário configurar mecanismos adicionais de limpeza.

### Parar os serviços

```bash
npm run docker:down
```

### Ver logs

```bash
npm run docker:logs
```

### Reconstruir os serviços (após alterações no código)

```bash
npm run docker:rebuild
```

## Desenvolvimento

Para desenvolvimento, é possível usar apenas o banco de dados no Docker e executar a API localmente:

1. Inicie apenas o banco de dados:
```bash
docker-compose up -d postgres pgadmin
```

2. Execute a API localmente:
```bash
cd backend
npm run dev
```

## Funcionalidades

### Sistema de Autenticação
- Registro de usuários com verificação de email e telefone
  - Códigos de verificação com validade de 10 minutos
  - Verificação em duas etapas (email e telefone)
  - Registro completo apenas após verificação
- Login com JWT
- Perfis de usuário (cliente, produtor, admin)

### Email e SMS
- Emails e SMS de verificação durante o processo de cadastro
- Emails de boas-vindas automatizados após cadastro completo
- Integração com Brevo para gerenciamento de contatos
- Processamento assíncrono para não bloquear operações principais

## Gerenciamento de Perfil de Usuário

O sistema possui funcionalidades para gerenciamento de perfil de usuário, incluindo atualização de dados pessoais e alteração de informações sensíveis com verificação.

### Fluxo de Atualização de Perfil

1. **Atualização de dados não sensíveis**:
   - O usuário pode atualizar seu nome diretamente sem necessidade de verificação adicional.

2. **Atualização de campos sensíveis (email, telefone, senha)**:
   - Quando o usuário deseja alterar um campo sensível, é iniciado um processo de verificação.
   - O sistema gera um código de verificação que é enviado ao novo email ou telefone.
   - O usuário deve fornecer esse código para confirmar a alteração.
   - O campo "document" (CPF/CNPJ) não pode ser alterado após o registro.

### API de Gerenciamento de Perfil

- `GET /profile`: Obter dados do perfil do usuário
- `PUT /profile`: Atualizar dados não sensíveis do perfil
- `POST /profile/email`: Iniciar alteração de email (requer verificação)
- `POST /profile/phone`: Iniciar alteração de telefone (requer verificação)
- `POST /profile/password/secure`: Iniciar alteração de senha (requer verificação)
- `POST /profile/verify`: Verificar e confirmar alteração de campo sensível
- `POST /profile/resend-code`: Reenviar código de verificação
- `PUT /change-password`: Alteração direta de senha (requer senha atual)

Todos os endpoints de gerenciamento de perfil (exceto verificação e reenvio de código) exigem autenticação.

### Exemplos de Requisições para Gerenciamento de Perfil

```bash
# Obter perfil do usuário
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json"

# Atualizar dados não sensíveis do perfil
curl -X PUT http://localhost:3000/profile \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Novo Nome"}'

# Iniciar alteração de email
curl -X POST http://localhost:3000/profile/email \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"newEmail": "novo@email.com", "currentPassword": "SuaSenhaAtual"}'

# Iniciar alteração de telefone
curl -X POST http://localhost:3000/profile/phone \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"newPhone": "11999998888", "currentPassword": "SuaSenhaAtual"}'

# Iniciar alteração de senha com verificação
curl -X POST http://localhost:3000/profile/password/secure \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"newPassword": "NovaS3nha@S3gura"}'

# Verificar alteração (usado para email, telefone ou senha)
curl -X POST http://localhost:3000/profile/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "TOKEN_RECEBIDO", "code": "CODIGO_RECEBIDO"}'

# Reenviar código de verificação
curl -X POST http://localhost:3000/profile/resend-code \
  -H "Content-Type: application/json" \
  -d '{"token": "TOKEN_RECEBIDO"}'

# Alterar senha diretamente (requer senha atual)
curl -X PUT http://localhost:3000/change-password \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword": "SenhaAtual", "newPassword": "NovaS3nha@S3gura"}'
```

## Credenciais padrão

- **Admin**
  - Email: admin@delice.com
  - Senha: admin123 