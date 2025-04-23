## Exemplos de Requisições CURL para Autenticação

### 1. Iniciar o Processo de Registro

```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "phone": "5511999887766",
    "document": "123.456.789-09"
  }'
```

Resposta:
```json
{
  "success": true,
  "data": {
    "token": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    "expiresIn": 10,
    "message": "Código de verificação enviado para seu telefone. Verifique seu telefone para completar o cadastro."
  }
}
```

### 2. Verificação do Telefone (Etapa Obrigatória - Completa o Cadastro)

```bash
curl -X POST http://localhost:3333/api/auth/verify-phone \
  -H "Content-Type: application/json" \
  -d '{
    "token": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    "code": "123456"
  }'
```

Resposta:
```json
{
  "success": true,
  "message": "Telefone verificado com sucesso. Cadastro realizado!",
  "phoneVerified": true,
  "emailVerified": false,
  "user": {
    "id": "uuid-here",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "5511999887766",
    "document": "12345678909",
    "roles": ["client"]
  },
  "token": "jwt-token-here"
}
```

**Nota:** Após a verificação do telefone bem-sucedida, o sistema automaticamente envia um código de verificação para o email do usuário. O usuário pode verificar o email seguindo o próximo passo.

### 3. Verificação de Email (Após o Registro)

Quando um usuário verifica seu telefone com sucesso, o sistema automaticamente envia um código de verificação para o email fornecido.

No modo de desenvolvimento, o código aparece no console:

```
=== EMAIL VERIFICATION CODE (DEVELOPMENT MODE) ===
To: joao@example.com
Name: João Silva
User ID: 550e8400-e29b-41d4-a716-446655440000
Code: 123456
=============================================
```

Em seguida, o usuário (já autenticado) pode verificar o email enviando o código:

```bash
curl -X POST http://localhost:3333/api/users/verify-email/confirm \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456"
  }'
```

Resposta:
```json
{
  "success": true,
  "message": "Email verificado com sucesso"
}
```

### 4. Reenvio de Código de Verificação de Email

Se o usuário não receber o código de verificação de email, ele pode solicitar um novo código:

```bash
curl -X POST http://localhost:3333/api/users/verify-email/send \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json"
```

Resposta:
```json
{
  "success": true,
  "message": "Código de verificação enviado para o seu email",
  "expiresIn": 10
}
```

### 5. Login

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

Resposta:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "5511999887766",
      "document": "12345678909",
      "roles": ["client"]
    },
    "token": "jwt-token-here"
  }
}
```

## Modo de Desenvolvimento

Quando `NODE_ENV=development` (configurado no arquivo .env), todos os códigos de verificação são exibidos no terminal do servidor em vez de serem enviados por email ou SMS. Isso facilita o teste durante o desenvolvimento.

Exemplos de logs que aparecem no terminal:

### Verificação de Registro
```
=== REGISTRATION VERIFICATION CODES (DEVELOPMENT MODE) ===
User: João Silva (joao@example.com)
Phone: 5511999887766
Token: a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
Phone Code: 654321
====================================================
```

### Verificação de Email Pós-Registro
```
=== EMAIL VERIFICATION CODE (DEVELOPMENT MODE) ===
To: joao@example.com
Name: João Silva
User ID: 550e8400-e29b-41d4-a716-446655440000
Code: 123456
=============================================
```

### Alteração de Email
```
=== EMAIL CHANGE VERIFICATION CODE (DEVELOPMENT MODE) ===
New Email: novo_email@example.com
Token: c1d2e3f4-g5h6-i7j8-k9l0-m1n2o3p4q5r6
Code: 123456
=====================================================
```

### Alteração de Telefone
```
=== PHONE CHANGE VERIFICATION CODE (DEVELOPMENT MODE) ===
New Phone: 5511988776655
Token: d1e2f3g4-h5i6-j7k8-l9m0-n1o2p3q4r5s6
Code: 123456
=====================================================
```

### Alteração de Senha
```
=== PASSWORD CHANGE VERIFICATION CODE (DEVELOPMENT MODE) ===
Email: joao@example.com
Token: e1f2g3h4-i5j6-k7l8-m9n0-o1p2q3r4s5t6
Code: 123456
=======================================================
```

Para alternar entre modo de desenvolvimento e produção, basta modificar a variável `NODE_ENV` no arquivo `.env`.