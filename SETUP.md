# Ponte do Saber — Guia de Instalação e Token Admin

Este guia explica como instalar, executar e obter o token de administrador para cadastrar conteúdos.

## Requisitos

- Node.js 18+ (verifique com `node -v`)
- NPM 9+

## Backend (API)

1. Instalar dependências:
   ```powershell
   cd "C:\Users\llccc\Desktop\Plataforma gamificada\backend"
   npm install
   ```
2. Configurar variáveis (opcional): crie um arquivo `.env` em `backend/` com:
   ```env
   PORT=3001
   JWT_SECRET=dev-secret
   GEMINI_API_KEY=SEU_TOKEN_GEMINI_OPCIONAL
   GEMINI_MODEL=gemini-1.5-flash
   ```
   Se não configurar, valores de desenvolvimento serão usados.
3. Inicializar banco e seeds (opcional):
   - O projeto inclui `backend/seed/` com SQL.
4. Rodar servidor:
   ```powershell
   cd "C:\Users\llccc\Desktop\Plataforma gamificada\backend"
   node index.js
   ```
   - Testes rápidos:
     - `http://localhost:3001/api/health`
     - `http://localhost:3001/api/conteudos`

## Frontend (React + Vite)

1. Instalar dependências:
   ```powershell
   cd "C:\Users\llccc\Desktop\Plataforma gamificada\frontend-react"
   npm install
   ```
2. (Opcional) Configurar URL da API criando `.env` em `frontend-react/`:
   ```env
   VITE_API_URL=http://localhost:3001
   ```
3. Rodar servidor de desenvolvimento:
   ```powershell
   cd "C:\Users\llccc\Desktop\Plataforma gamificada\frontend-react"
   npm run dev -- --host
   ```
   - O app abre em `http://localhost:5280` (porta configurada em `vite.config.ts`).

## Obter Token de Administrador

Você precisa de um usuário admin e do token JWT:

1. Criar usuário admin (via API):
   ```powershell
   # Substitua os campos conforme desejar
   $body = @{ nome = "Admin"; email = "admin@example.com"; senha = "senha123"; cargo = "admin" } | ConvertTo-Json
   Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/auth/register" -ContentType "application/json" -Body $body
   ```
2. Fazer login para obter o token:
   ```powershell
   $login = @{ email = "admin@example.com"; senha = "senha123" } | ConvertTo-Json
   $res = Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/auth/login" -ContentType "application/json" -Body $login
   $res.token  # Copie este JWT
   ```
3. Colar o token no app:
   - Abra a rota `Admin`.
   - No campo "JWT Token", cole o token e clique em "Salvar Token". O token fica em `localStorage` como `token`.

## Tutor Gemini no Chat

- O chat usa a rota `POST /api/tutor`.
- Se `GEMINI_API_KEY` não estiver configurada, a API retorna erro ao tentar consultar o tutor.
- Configure `GEMINI_API_KEY` no `.env` do backend para respostas do Gemini.

## Dicas

- Se a página parecer sem estilo, abra `http://localhost:5280` (React) e não a página HTML legada.
- O tema escuro pode ser alternado pela navbar (botão Claro/Escuro).
- Logs da API aparecem no terminal que rodar `node index.js`.
