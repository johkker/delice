#!/bin/bash

# Set the base URL
BASE_URL="http://localhost:3333/api"
TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Testando API Delice ===${NC}"
echo -e "${BLUE}------------------------${NC}\n"

# 1. Registrar um novo usuário
echo -e "${BLUE}1. Registrando novo usuário${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Usuario",
    "email": "teste@exemplo.com",
    "password": "senha123",
    "phone": "11987654321"
  }')

echo $REGISTER_RESPONSE | jq
echo -e "\n"

# 2. Login com usuário registrado
echo -e "${BLUE}2. Fazendo login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123"
  }')

echo $LOGIN_RESPONSE | jq
echo -e "\n"

# Extrair token para usar em requisições subsequentes
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo -e "${RED}Falha ao obter token. Não é possível continuar com os testes.${NC}"
  exit 1
fi

echo -e "${GREEN}Token obtido com sucesso: ${TOKEN:0:20}...${NC}\n"

# 3. Obter perfil do usuário
echo -e "${BLUE}3. Obtendo perfil do usuário${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/users/profile" \
  -H "Authorization: Bearer $TOKEN")

echo $PROFILE_RESPONSE | jq
echo -e "\n"

# 4. Mudar senha do usuário
echo -e "${BLUE}4. Alterando senha${NC}"
CHANGE_PASSWORD_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "oldPassword": "senha123",
    "newPassword": "novaSenha456"
  }')

echo $CHANGE_PASSWORD_RESPONSE | jq
echo -e "\n"

# 5. Login com nova senha
echo -e "${BLUE}5. Fazendo login com nova senha${NC}"
NEW_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "novaSenha456"
  }')

echo $NEW_LOGIN_RESPONSE | jq
echo -e "\n"

# Atualiza token
TOKEN=$(echo $NEW_LOGIN_RESPONSE | jq -r '.data.token')

# 6. Tentar login com senha errada (deve falhar)
echo -e "${BLUE}6. Teste de erro: login com senha errada${NC}"
WRONG_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senhaErrada"
  }')

echo $WRONG_LOGIN_RESPONSE | jq
echo -e "\n"

echo -e "${GREEN}Testes concluídos!${NC}" 