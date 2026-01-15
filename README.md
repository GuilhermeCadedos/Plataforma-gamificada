# Plataforma Gamificada — Arquitetura e Execução

## Estrutura

- frontend-react/: Aplicação React (Dashboard do aluno, Módulos, Vídeo+Quiz, Chat, Painel Admin)
- backend/: API Node + SQLite (rotas, seeds, middleware)
- frontend-legacy/: Conteúdo anterior (não utilizado)
- client-legacy/: Conteúdo anterior (não utilizado)

## Como rodar

### Frontend (React + Vite)

1. Instalar deps

```
powershell
cd "C:\Users\llccc\Desktop\Plataforma gamificada\frontend-react"
npm install
```

2. Iniciar

```
powershell
npm run dev
```

### Backend (Node + SQLite)

1. Instalar deps

```
powershell
cd "C:\Users\llccc\Desktop\Plataforma gamificada\backend"
npm install
```

2. Rodar seeds (opcional)

```
powershell
node seed.js
```

3. Iniciar servidor

```
powershell
node index.js
```

## Notas

- Ajuste variáveis em backend/.env conforme necessário.
- O frontend espera a API do backend (URLs podem ser configuradas conforme a necessidade).
- Pastas legacy foram mantidas apenas para referência; podem ser removidas quando não forem mais necessárias.
