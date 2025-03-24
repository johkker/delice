# API Tests

This document contains examples of API requests to test the Delice API.

## Authentication Flow

### 1. Start Registration Process

```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "phone": "+1234567890",
    "document": "123.456.789-09"
  }'
```

Example response:
```json
{
  "success": true,
  "data": {
    "token": "e7c5a-8f2b1-d9c3e-4a9b6",
    "expiresIn": 10
  }
}
```

### 2. Verify Email Code

```bash
curl -X POST http://localhost:3333/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "e7c5a-8f2b1-d9c3e-4a9b6",
    "code": "123456"
  }'
```

Example response:
```json
{
  "success": true,
  "message": "Email verificado com sucesso",
  "emailVerified": true,
  "phoneVerified": false
}
```

### 3. Verify Phone Code

```bash
curl -X POST http://localhost:3333/api/auth/verify-phone \
  -H "Content-Type: application/json" \
  -d '{
    "token": "e7c5a-8f2b1-d9c3e-4a9b6",
    "code": "654321"
  }'
```

Example response:
```json
{
  "success": true,
  "message": "Telefone verificado com sucesso",
  "phoneVerified": true,
  "emailVerified": true
}
```

### 4. Resend Verification Code (if needed)

```bash
curl -X POST http://localhost:3333/api/auth/resend-code \
  -H "Content-Type: application/json" \
  -d '{
    "token": "e7c5a-8f2b1-d9c3e-4a9b6",
    "type": "email"
  }'
```

Example response:
```json
{
  "success": true,
  "message": "Códigos de verificação reenviados para email"
}
```

### 5. Complete Registration

```bash
curl -X POST http://localhost:3333/api/auth/complete-registration \
  -H "Content-Type: application/json" \
  -d '{
    "token": "e7c5a-8f2b1-d9c3e-4a9b6"
  }'
```

Example response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "document": "123.456.789-09",
      "roles": ["customer"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 6. Login

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

Example response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "document": "123.456.789-09",
      "roles": ["customer"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## User Endpoints

### 1. Get User Profile (Requires Authentication)

```bash
curl -X GET http://localhost:3333/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Example response:
```json
{
  "success": true,
  "data": {
    "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "document": "123.456.789-09",
    "avatar_url": null,
    "roles": ["customer"],
    "rating": 0,
    "rating_count": 0,
    "created_at": "2023-05-01T10:20:30.000Z",
    "updated_at": "2023-05-01T10:20:30.000Z"
  }
}
```

### 2. Change Password (Requires Authentication)

```bash
curl -X PUT http://localhost:3333/api/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "oldPassword": "securepassword123",
    "newPassword": "newsecurepassword456"
  }'
```

Example response:
```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
``` 