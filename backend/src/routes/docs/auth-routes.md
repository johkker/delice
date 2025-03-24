# Authentication API Documentation

## Overview

The Authentication API provides endpoints for user registration and login. It now includes a verification flow before completing registration.

## Base URL

```
/api/auth
```

## Endpoints

### Start Registration Process

Initiates the registration process by sending verification codes to email and phone.

```
POST /register
```

#### Request Body

| Field      | Type     | Description                              | Required |
|------------|----------|------------------------------------------|----------|
| `name`     | string   | The user's full name                     | Yes      |
| `email`    | string   | The user's email address                 | Yes      |
| `password` | string   | The user's password (min 6 characters)   | Yes      |
| `phone`    | string   | The user's phone number                  | Yes      |
| `document` | string   | The user's CPF or CNPJ                   | Yes      |

#### Example Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone": "+1234567890",
  "document": "123.456.789-09"
}
```

#### Success Response

**Code**: 200 OK

```json
{
  "success": true,
  "data": {
    "token": "e7c5a-8f2b1-d9c3e-4a9b6",
    "expiresIn": 10
  }
}
```

#### Error Responses

**Code**: 400 Bad Request

*Email already in use*
```json
{
  "success": false,
  "error": {
    "message": "Este email já está sendo usado por outro usuário"
  }
}
```

*Phone already in use*
```json
{
  "success": false,
  "error": {
    "message": "Este telefone já está sendo usado por outro usuário"
  }
}
```

*Document already in use*
```json
{
  "success": false,
  "error": {
    "message": "Este documento já está sendo usado por outro usuário"
  }
}
```

*Invalid document*
```json
{
  "success": false,
  "error": {
    "message": "Documento inválido. Informe um CPF ou CNPJ válido."
  }
}
```

---

### Verify Email Code

Verifies the code sent to the user's email.

```
POST /verify-email
```

#### Request Body

| Field   | Type   | Description                               | Required |
|---------|--------|-------------------------------------------|----------|
| `token` | string | The token received during registration    | Yes      |
| `code`  | string | The verification code sent to the email   | Yes      |

#### Example Request

```json
{
  "token": "e7c5a-8f2b1-d9c3e-4a9b6",
  "code": "123456"
}
```

#### Success Response

**Code**: 200 OK

```json
{
  "success": true,
  "message": "Email verificado com sucesso",
  "emailVerified": true,
  "phoneVerified": false
}
```

#### Error Responses

**Code**: 400 Bad Request

*Invalid or expired token*
```json
{
  "success": false,
  "error": {
    "message": "Token de verificação expirado ou inválido"
  }
}
```

*Invalid code*
```json
{
  "success": false,
  "error": {
    "message": "Código de verificação do email inválido"
  }
}
```

---

### Verify Phone Code

Verifies the code sent to the user's phone.

```
POST /verify-phone
```

#### Request Body

| Field   | Type   | Description                               | Required |
|---------|--------|-------------------------------------------|----------|
| `token` | string | The token received during registration    | Yes      |
| `code`  | string | The verification code sent to the phone   | Yes      |

#### Example Request

```json
{
  "token": "e7c5a-8f2b1-d9c3e-4a9b6",
  "code": "654321"
}
```

#### Success Response

**Code**: 200 OK

```json
{
  "success": true,
  "message": "Telefone verificado com sucesso",
  "phoneVerified": true,
  "emailVerified": true
}
```

#### Error Responses

**Code**: 400 Bad Request

*Invalid or expired token*
```json
{
  "success": false,
  "error": {
    "message": "Token de verificação expirado ou inválido"
  }
}
```

*Invalid code*
```json
{
  "success": false,
  "error": {
    "message": "Código de verificação do telefone inválido"
  }
}
```

---

### Resend Verification Codes

Resends verification codes to email, phone, or both.

```
POST /resend-code
```

#### Request Body

| Field   | Type   | Description                                               | Required |
|---------|--------|-----------------------------------------------------------|----------|
| `token` | string | The token received during registration                    | Yes      |
| `type`  | string | Type of code to resend (options: "email", "phone", "both") | Yes      |

#### Example Request

```json
{
  "token": "e7c5a-8f2b1-d9c3e-4a9b6",
  "type": "email"
}
```

#### Success Response

**Code**: 200 OK

```json
{
  "success": true,
  "message": "Códigos de verificação reenviados para email"
}
```

#### Error Responses

**Code**: 400 Bad Request

*Invalid or expired token*
```json
{
  "success": false,
  "error": {
    "message": "Token de verificação expirado ou inválido"
  }
}
```

---

### Complete Registration

Completes the registration process after both email and phone are verified.

```
POST /complete-registration
```

#### Request Body

| Field   | Type   | Description                               | Required |
|---------|--------|-------------------------------------------|----------|
| `token` | string | The token received during registration    | Yes      |

#### Example Request

```json
{
  "token": "e7c5a-8f2b1-d9c3e-4a9b6"
}
```

#### Success Response

**Code**: 200 OK

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

#### Error Responses

**Code**: 400 Bad Request

*Invalid or expired token*
```json
{
  "success": false,
  "error": {
    "message": "Token de verificação expirado ou inválido"
  }
}
```

*Incomplete verification*
```json
{
  "success": false,
  "error": {
    "message": "É necessário verificar tanto o email quanto o telefone antes de completar o cadastro"
  }
}
```

---

### Login

Authenticates a user and returns a JWT token.

```
POST /login
```

#### Request Body

| Field      | Type     | Description                 | Required |
|------------|----------|-----------------------------|----------|
| `email`    | string   | The user's email address    | Yes      |
| `password` | string   | The user's password         | Yes      |

#### Example Request

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Success Response

**Code**: 200 OK

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

#### Error Response

**Code**: 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "message": "Email ou senha incorretos"
  }
}
```

## Authentication

After successful authentication, include the JWT token in subsequent requests as a Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## JWT Payload Structure

The JWT token contains the following information:

```json
{
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "email": "john@example.com",
  "roles": ["customer"],
  "iat": 1616239022,
  "exp": 1616325422
}
```

Where:
- `id` is the user's unique identifier
- `email` is the user's email address
- `roles` is an array of the user's roles
- `iat` is the "issued at" timestamp
- `exp` is the "expires at" timestamp 