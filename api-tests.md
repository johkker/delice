# API Delice - Exemplos de Requisições

Este documento contém exemplos de requisições para testar a API do projeto Delice. Você pode usar estas requisições para validar o MVP e entender o fluxo básico da aplicação.

## Configuração

- **URL Base**: `http://localhost:3333/api`
- **Content-Type**: `application/json`

## Autenticação

### 1. Registrar um Novo Usuário

**Requisição:**

```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Usuario",
    "email": "teste@exemplo.com",
    "password": "senha123",
    "phone": "11987654321",
    "document": "123.456.789-09"
  }'
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "name": "Teste Usuario",
      "email": "teste@exemplo.com",
      "roles": ["customer"],
      "created_at": "2023-06-24T12:34:56.789Z",
      "updated_at": "2023-06-24T12:34:56.789Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Resposta de Erro (400):**

```json
{
  "success": false,
  "error": {
    "message": "Este email já está sendo usado por outro usuário"
  }
}
```

### 2. Login

**Requisição:**

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123"
  }'
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "name": "Teste Usuario",
      "email": "teste@exemplo.com",
      "roles": ["customer"],
      "created_at": "2023-06-24T12:34:56.789Z",
      "updated_at": "2023-06-24T12:34:56.789Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Resposta de Erro (401):**

```json
{
  "success": false,
  "error": {
    "message": "Email ou senha incorretos"
  }
}
```

## Perfil do Usuário

### 3. Obter Perfil

**Requisição:**

```bash
curl -X GET http://localhost:3333/api/users/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "data": {
    "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "name": "Teste Usuario",
    "email": "teste@exemplo.com",
    "phone": "11987654321",
    "roles": ["customer"],
    "avatar_url": null,
    "rating": 0,
    "rating_count": 0,
    "created_at": "2023-06-24T12:34:56.789Z",
    "updated_at": "2023-06-24T12:34:56.789Z"
  }
}
```

**Resposta de Erro (401):**

```json
{
  "success": false,
  "error": {
    "message": "Você precisa estar logado para acessar este recurso"
  }
}
```

### 4. Mudar Senha

**Requisição:**

```bash
curl -X PUT http://localhost:3333/api/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "oldPassword": "senha123",
    "newPassword": "novaSenha456"
  }'
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

**Resposta de Erro (400):**

```json
{
  "success": false,
  "error": {
    "message": "A senha atual está incorreta"
  }
}
```

## Testando com Postman ou Insomnia

1. **Configurar variável de ambiente:**
   - Criar variável `base_url` com valor `http://localhost:3333/api`
   - Criar variável `token` para armazenar o token JWT após login

2. **Fluxo de testes:**
   - Registrar usuário
   - Login para obter token (salvar na variável `token`)
   - Acessar perfil usando o token
   - Alterar senha
   - Fazer login com a nova senha
   - Testar casos de erro (login inválido, etc)

## Exemplo de Fluxo Completo

1. **Registro** → Cria um novo usuário
2. **Login** → Obtém token de autenticação
3. **Perfil** → Verifica dados do usuário (autenticado)
4. **Alterar senha** → Muda credenciais (autenticado)
5. **Login com nova senha** → Valida alteração 