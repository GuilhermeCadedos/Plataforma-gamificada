Instalação e dependências — Tutorial (Windows / PowerShell)

Pré-requisitos

- Node.js 18+ instalado
- npm (vem com Node.js)
- Git (opcional)

1. Backend — instalar dependências e iniciar

Abra PowerShell na pasta `backend`:

```powershell
cd "c:\Users\llccc\Desktop\Plataforma gamificada\backend"
npm install
# criar .env conforme necessário (ex.: JWT_SECRET, DB path)
# iniciar servidor
npm run start
```

Dependências principais (backend)

- express — servidor HTTP/rotas
- sqlite3 — banco de dados local (arquivo)
- multer — upload multipart/form-data
- jsonwebtoken — JWT para autenticação
- bcryptjs — hashing de senhas
- cors — habilitar CORS para frontend
- dotenv — variáveis de ambiente
- axios / form-data — (usados em scripts auxiliares)
- @google/generative-ai — biblioteca opcional presente no projeto

2. Frontend — instalar dependências e iniciar (React + Vite)

Abra PowerShell na pasta `frontend-react`:

```powershell
cd "c:\Users\llccc\Desktop\Plataforma gamificada\frontend-react"
npm install
# criar arquivo .env local com variáveis:
# VITE_API_BASE=http://localhost:3001
# iniciar em dev (porta padrão, ajuste se a porta 5281 estiver ocupada)
npm run dev
# ou forçar porta alternativa:
npx vite --port 5173
```

Dependências principais (frontend)

- react, react-dom — biblioteca UI
- react-router-dom — roteamento
- vite — bundler/dev server
- typescript — tipagem
- tailwindcss, postcss, autoprefixer — estilos
- canvas-confetti — pequenos efeitos de confete para acertos
- @types/react / @types/react-dom / @types/node — dev types

3. Variáveis de ambiente importantes

- `VITE_API_BASE` (frontend) — URL base da API backend
- `.env` (backend) — `JWT_SECRET`, `PORT` (opcional), `DATABASE_PATH` (se necessário)

4. Banco de dados e seeds

- O backend inclui scripts de seed (`seed/` e `seed.js`) e utilitários (`import-content.js`) para popular `conteudos`.
- Para popular o DB local, execute os scripts fornecidos, por exemplo:

```powershell
cd "c:\Users\llccc\Desktop\Plataforma gamificada\backend"
node import-content.js
# ou
node seed.js
```

5. Notas de execução e troubleshooting

- Porta ocupada: se `npm run dev` retornar erro de porta ocupada, force outra porta com `npx vite --port 5173` ou mate o processo que usa a porta (no PowerShell: `Get-Process -Id <PID> | Stop-Process -Force`).
- Logs: verifique a saída do terminal do backend para erros de DB/rotas e o console do navegador para erros CORS/autenticação.
- Produção: para implantar, construa o frontend (`npm run build`) e sirva os arquivos estáticos por um servidor (Nginx, S3+CloudFront). Use um DB gerenciado em vez de SQLite.

6. Comandos úteis resumidos

```powershell
# Backend
cd backend
npm install
npm run start

# Frontend
cd frontend-react
npm install
npm run dev
# ou
npx vite --port 5173
```

7. Onde procurar ajuda

- Logs: `backend/index.js` e arquivos na pasta `backend/`.
- Config: `frontend-react/vite.config.ts`, `frontend-react/tsconfig.json`, e `backend/.env`.

Fim do tutorial

Se quiser, eu posso:

- Gerar um `README_DOCS.md` que combine estes três documentos em um só arquivo principal;
- Adicionar exemplos de `.env.example` para backend e frontend;
- Criar scripts npm para popular o DB automaticamente.

Diga qual opção prefere.
