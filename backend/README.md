# Backend - Plataforma Gamificada

Servidor Express com SQLite para usuários, conteúdos, quizzes e progresso.

## Requisitos

- Node.js 18+

## Instalação

```powershell
Push-Location "C:\Users\llccc\Desktop\Plataforma gamificada\server"
npm install
Pop-Location
```

## Configuração

Crie o arquivo `.env` (já criado) e defina:

```
PORT=3001
JWT_SECRET=troque-esta-chave-em-producao
```

## Executar

```powershell
Push-Location "C:\Users\llccc\Desktop\Plataforma gamificada\server"
npm start
# Servidor em http://localhost:3001
Pop-Location
```

## Rotas

- POST `/api/auth/register`: cadastra usuário (bcrypt)
- POST `/api/auth/login`: retorna token JWT
- GET `/api/usuarios`: lista (admin)
- GET `/api/usuarios/:id`: detalhar (self/admin)
- PUT `/api/usuarios/:id`: atualizar (self/admin, cargo só admin)
- DELETE `/api/usuarios/:id`: remover (admin)
- GET `/api/conteudos`: listar conteúdos por ordem
- POST `/api/conteudos`: criar conteúdo (admin)
- PUT `/api/conteudos/:id`: atualizar conteúdo (admin)
- DELETE `/api/conteudos/:id`: remover conteúdo (admin, apaga quizzes/progresso por cascade)
- POST `/api/quizzes`: criar quiz (admin)
- GET `/api/admin/quizzes`: listar quizzes (admin, inclui `correta`; query opcional `conteudoId`)
- GET `/api/admin/quizzes/:id`: obter quiz por id (admin)
- PUT `/api/quizzes/:id`: atualizar quiz (admin)
- DELETE `/api/quizzes/:id`: remover quiz (admin)
- PUT `/api/progresso/:conteudoId`: concluir aula (+10 XP e nível)

### Tutor (Gemini)

- POST `/api/tutor`: corpo JSON `{ pergunta: string, lat?: number, lon?: number, cidade?: string, pais?: string }`

  - Usa `@google/generative-ai` com `GEMINI_API_KEY` do `.env`.
  - Localizador: tenta usar `lat/lon` fornecidos; caso contrário, tenta geolocalização por IP e busca temperatura atual via Open‑Meteo; inclui hora local.
  - Resposta inclui `answer` e `context.locator` com localização/temperatura/horário.
  - Conversas são salvas em `tutor_conversas` (SQLite), com vínculo ao usuário se token JWT for enviado.

- GET `/api/tutor/conversas/me` (autenticado): lista seu histórico.
- GET `/api/tutor/conversas` (admin): lista histórico global (limite 200).

Exemplo:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/tutor" -ContentType "application/json" -Body (@{pergunta="Explique frações"; lat=-23.55; lon=-46.63; cidade="São Paulo"; pais="Brasil"} | ConvertTo-Json)
```

## Popular conteúdo (seed)

```powershell
Push-Location "C:\Users\llccc\Desktop\Plataforma gamificada\server"
node seed.js
Pop-Location
```

## Preencher URLs de vídeos

1. Edite [server/seed/urls.json](server/seed/urls.json) e substitua `null` por links reais do YouTube.
2. Rode o atualizador:

```powershell
Push-Location "C:\Users\llccc\Desktop\Plataforma gamificada\server"
node update-urls.js
Pop-Location
```

## Observações

- Regra de nível: `level = floor(xp / 100) + 1`.
- Conteúdos suportam `tipo` = `video` ou `texto`.

## Chat DB (novo arquivo)

- Arquivo: `backend/data/chat.db` com tabela `chat_messages`.
- Cada troca do chat salva duas linhas: `{usuario_id, role: 'user', text}` e `{usuario_id, role: 'tutor', text}`.
- Endpoint autenticado: `GET /api/chat/messages/me` retorna as últimas 200 mensagens do usuário logado.
- Observação: `usuario_id` é gravado a partir do token JWT; sem token, será `NULL`.
