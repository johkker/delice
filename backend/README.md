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
    "message": "Códigos de verificação enviados. Verifique seu telefone para completar o cadastro e seu email para confirmar seu endereço de email."
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

### 3. Verificação do Email (Etapa Opcional)

```bash
curl -X POST http://localhost:3333/api/auth/verify-email \
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
  "message": "Email verificado com sucesso",
  "emailVerified": true,
  "phoneVerified": true
}
```

### 4. Reenvio de Códigos de Verificação

```bash
curl -X POST http://localhost:3333/api/auth/resend-code \
  -H "Content-Type: application/json" \
  -d '{
    "token": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    "type": "email"
  }'
```

Resposta (se o email não foi verificado):
```json
{
  "success": true,
  "message": "Códigos de verificação reenviados para email"
}
```

Resposta (se o email já foi verificado):
```json
{
  "success": true,
  "message": "Email já verificado"
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

### Observações

1. Os códigos de verificação gerados aparecem no console do servidor durante o desenvolvimento.
2. O token de verificação expira em 10 minutos.
3. Para usuários reais, os códigos são enviados por email e SMS.
4. A verificação do telefone é obrigatória e já completa o cadastro automaticamente.
5. A verificação do email é opcional, mas recomendada. 