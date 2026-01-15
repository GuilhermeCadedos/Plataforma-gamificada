Arquitetura do Projeto — Frontend e Backend

Visão geral

A aplicação segue uma arquitetura cliente-servidor clássica:
- Frontend: SPA em React + TypeScript (Vite) que consome APIs REST do backend.
- Backend: Node.js + Express que expõe endpoints para autenticação, conteúdos, quizzes, progresso e upload de arquivos.
- Banco de dados: SQLite (arquivo local) para protótipo; contém tabelas para `usuarios`, `conteudos`, `quizzes` e `progresso`.

Frontend (componentes principais)
- `src/pages/*`: rotas e páginas (ex.: `QuizDemo.tsx`, `Profile.tsx`, `TrilhaAprendizado.tsx`).
- `src/components/*`: componentes reutilizáveis (ex.: `QuizInterativo.tsx`, `Navbar.tsx`).
- Estado: hooks React (`useState`, `useEffect`, `useCallback`) e localStorage para persistir token e avatar localmente.
- Builds e ferramentas: Vite para dev/build, TypeScript para tipagem, TailwindCSS para estilos.

Comunicação frontend-backend
- API base configurável via `import.meta.env.VITE_API_BASE`.
- Endpoints típicos:
  - `GET /api/conteudos` — lista conteúdos/trilhas
  - `POST /api/quizzes` — (opcional/admin) persistir quizzes gerados
  - `PUT /api/progresso/:conteudoId` — reportar acerto/progresso
  - `POST /api/profile/upload-picture` — upload e associação de foto de perfil
  - `GET /api/usuarios/:id/photo` — servir a foto do usuário
- Autenticação: JWT em cabeçalho `Authorization: Bearer <token>` para rotas protegidas.

Backend (componentes principais)
- `index.js`: monta o servidor Express, middlewares (CORS, JSON parsing), rotas e endpoints.
- Uploads: `multer` usado para receber arquivos; imagens são armazenadas tanto como BLOB (`foto_blob`) quanto como caminho (`foto_perfil`).
- Persistência: `sqlite3` com acesso direto via queries; em produção recomenda-se migrar para um SGBD mais robusto (Postgres/MySQL) e utilizar migrations.
- Segurança: senha com `bcryptjs`, tokens via `jsonwebtoken`, uso de `dotenv` para variáveis sensíveis.

Fluxo típico
1. Usuário acessa SPA (React).
2. SPA requisita `GET /api/conteudos` para listar trilhas e conteúdos.
3. Usuário joga um quiz; quando acerta, SPA chama `PUT /api/progresso/:conteudoId` para registrar.
4. Upload de foto usa `POST /api/profile/upload-picture` com `multipart/form-data`.

Escalabilidade e melhorias futuras
- Mover a mídia (imagens/vídeos) para um storage externo (S3, GCS) e armazenar apenas referências.
- Usar um ORM (Sequelize, TypeORM) e migrations para gerenciar esquema de DB.
- Implementar cache no backend (Redis) para conteúdos estáticos e reduzir latência.
- Adicionar testes automatizados (unit/integration) e pipeline CI/CD.

Conclusão

A arquitetura atual é adequada para um protótipo local que combina simplicidade e facilidade de experimentação. A transição para produção exigirá melhorias em persistência, segurança e escalabilidade.