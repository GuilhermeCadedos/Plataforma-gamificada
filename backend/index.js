require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('./database');
const chatdb = require('./chatdb');
const { authenticateToken, requireAdmin, requireSelfOrAdmin } = require('./middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

app.use(cors());
app.use(express.json());

// Servir arquivos enviados (fotos de perfil / avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Tratamento de erro de JSON inválido para sempre responder em JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  next(err);
});

// Health check simples para depurar integração no frontend
app.get('/api/health', (req, res) => {
  return res.json({
    ok: true,
    port: PORT,
    hasGemini: !!GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  });
});

// Helpers to use sqlite3 with Promises
const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) return reject(err);
    resolve({ id: this.lastID, changes: this.changes });
  });
});
const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) return reject(err);
    resolve(row);
  });
});
const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows);
  });
});

// Helpers for chat DB
const chatRun = (sql, params = []) => new Promise((resolve, reject) => {
  chatdb.run(sql, params, function (err) {
    if (err) return reject(err);
    resolve({ id: this.lastID, changes: this.changes });
  });
});
const chatAll = (sql, params = []) => new Promise((resolve, reject) => {
  chatdb.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows);
  });
});

// Auth: cadastro e login
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, email, senha' });
    }
    // validação básica de email
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) return res.status(400).json({ error: 'Email inválido' });
    // senha forte mínima: 8+ caracteres, letra e número
    const senhaOk = typeof senha === 'string' && senha.length >= 8 && /[A-Za-z]/.test(senha) && /\d/.test(senha);
    if (!senhaOk) return res.status(400).json({ error: 'Senha fraca: mínimo 8 caracteres com letras e números' });

    const existing = await get('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Email já cadastrado' });

    // custo maior para hash
    const hash = await bcrypt.hash(senha, 12);
    // nunca permitir definir cargo via registro público
    const role = 'aluno';
    const result = await run(
      'INSERT INTO usuarios (nome, email, senha, xp, nivel, cargo) VALUES (?, ?, ?, 0, 1, ?)',
      [nome, email, hash, role]
    );
    return res.status(201).json({ id: result.id, message: 'Usuário cadastrado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    const user = await get('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ id: user.id, cargo: user.cargo, nome: user.nome, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao efetuar login' });
  }
});

// Retorna o usuário autenticado a partir do token
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    // incluir avatar e foto_perfil para que front-end possa mostrar a foto persistida
    const user = await get('SELECT id, nome, email, xp, nivel, cargo, avatar, foto_perfil FROM usuarios WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao obter usuário autenticado' });
  }
});

// CRUD de usuários
app.get('/api/usuarios', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // incluir avatar e foto_perfil para administração
    const users = await all('SELECT id, nome, email, xp, nivel, cargo, avatar, foto_perfil FROM usuarios ORDER BY id ASC');
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

app.get('/api/usuarios/:id', authenticateToken, requireSelfOrAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await get('SELECT id, nome, email, xp, nivel, cargo, avatar, foto_perfil FROM usuarios WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao obter usuário' });
  }
});

app.put('/api/usuarios/:id', authenticateToken, requireSelfOrAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, email, cargo } = req.body;
    const user = await get('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Apenas admin pode alterar cargo
    const newCargo = req.user.cargo === 'admin' && (cargo === 'admin' || cargo === 'aluno') ? cargo : user.cargo;
    const newNome = nome ?? user.nome;
    const newEmail = email ?? user.email;

    await run('UPDATE usuarios SET nome = ?, email = ?, cargo = ? WHERE id = ?', [newNome, newEmail, newCargo, id]);
    return res.json({ message: 'Usuário atualizado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

app.delete('/api/usuarios/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await run('DELETE FROM usuarios WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    return res.json({ message: 'Usuário removido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao remover usuário' });
  }
});

// Ranking público: top usuários por XP
app.get('/api/ranking', async (req, res) => {
  try {
    const top = await all('SELECT id, nome, xp, nivel, avatar, foto_perfil FROM usuarios ORDER BY xp DESC, nivel DESC LIMIT 50');
    return res.json(top || []);
  } catch (err) {
    console.error('Erro ao buscar ranking:', err);
    return res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

// Conteúdos
app.get('/api/conteudos', async (req, res) => {
  try {
    const items = await all('SELECT * FROM conteudos ORDER BY ordem ASC, id ASC');
    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar conteúdos' });
  }
});

app.post('/api/conteudos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { materia, titulo, tipo, url, explicacao, ordem } = req.body;
    if (!materia || !titulo || !tipo) {
      return res.status(400).json({ error: 'Campos obrigatórios: materia, titulo, tipo' });
    }
    if (!['video','texto'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo deve ser "video" ou "texto"' });
    }
    const result = await run(
      'INSERT INTO conteudos (materia, titulo, tipo, url, explicacao, ordem) VALUES (?, ?, ?, ?, ?, ?)',
      [materia, titulo, tipo, url ?? null, explicacao ?? null, ordem ?? null]
    );
    return res.status(201).json({ id: result.id, message: 'Conteúdo criado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar conteúdo' });
  }
});

// Atualizar conteúdo (admin)
app.put('/api/conteudos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await get('SELECT * FROM conteudos WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Conteúdo não encontrado' });

    const { materia, titulo, tipo, url, explicacao, ordem, xp } = req.body || {};
    if (tipo && !['video','texto'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo deve ser "video" ou "texto"' });
    }

    const newMateria = materia ?? existing.materia;
    const newTitulo = titulo ?? existing.titulo;
    const newTipo = tipo ?? existing.tipo;
    const newUrl = (url === undefined) ? existing.url : (url ?? null);
    const newExp = (explicacao === undefined) ? existing.explicacao : (explicacao ?? null);
    const newOrdem = (ordem === undefined) ? existing.ordem : (ordem ?? null);
    const newXp = (typeof xp === 'number') ? xp : (existing.xp ?? 10);

    await run('UPDATE conteudos SET materia = ?, titulo = ?, tipo = ?, url = ?, explicacao = ?, ordem = ?, xp = ? WHERE id = ?',
      [newMateria, newTitulo, newTipo, newUrl, newExp, newOrdem, newXp, id]);
    return res.json({ message: 'Conteúdo atualizado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar conteúdo' });
  }
});

// Remover conteúdo (admin)
app.delete('/api/conteudos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await run('DELETE FROM conteudos WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Conteúdo não encontrado' });
    // Quizzes e progresso vinculados são removidos por ON DELETE CASCADE
    return res.json({ message: 'Conteúdo removido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao remover conteúdo' });
  }
});

// Quizzes
app.post('/api/quizzes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { conteudo_id, pergunta, op_a, op_b, op_c, op_d, correta } = req.body;
    if (!conteudo_id || !pergunta || !op_a || !op_b || !op_c || !op_d || !correta) {
      return res.status(400).json({ error: 'Campos obrigatórios do quiz não preenchidos' });
    }
    if (!['A','B','C','D'].includes(correta)) {
      return res.status(400).json({ error: 'Resposta correta deve ser A, B, C ou D' });
    }
    const content = await get('SELECT id FROM conteudos WHERE id = ?', [conteudo_id]);
    if (!content) return res.status(404).json({ error: 'Conteúdo não encontrado' });

    const result = await run(
      'INSERT INTO quizzes (conteudo_id, pergunta, op_a, op_b, op_c, op_d, correta) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [conteudo_id, pergunta, op_a, op_b, op_c, op_d, correta]
    );
    return res.status(201).json({ id: result.id, message: 'Quiz criado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar quiz' });
  }
});

// Listar quizzes (admin) com resposta correta; opcional filtro por conteudoId
app.get('/api/admin/quizzes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const conteudoId = req.query.conteudoId ? Number(req.query.conteudoId) : null;
    let rows;
    if (conteudoId) {
      rows = await all('SELECT * FROM quizzes WHERE conteudo_id = ? ORDER BY id ASC', [conteudoId]);
    } else {
      rows = await all('SELECT * FROM quizzes ORDER BY id ASC');
    }
    return res.json(rows || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar quizzes' });
  }
});

// Obter quiz individual (admin)
app.get('/api/admin/quizzes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = await get('SELECT * FROM quizzes WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: 'Quiz não encontrado' });
    return res.json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao obter quiz' });
  }
});

// Atualizar quiz (admin)
app.put('/api/quizzes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await get('SELECT * FROM quizzes WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Quiz não encontrado' });

    const { pergunta, op_a, op_b, op_c, op_d, correta } = req.body || {};
    if (correta && !['A','B','C','D'].includes(correta)) {
      return res.status(400).json({ error: 'Resposta correta deve ser A, B, C ou D' });
    }

    const newPergunta = pergunta ?? existing.pergunta;
    const newA = op_a ?? existing.op_a;
    const newB = op_b ?? existing.op_b;
    const newC = op_c ?? existing.op_c;
    const newD = op_d ?? existing.op_d;
    const newCorreta = correta ?? existing.correta;

    await run('UPDATE quizzes SET pergunta = ?, op_a = ?, op_b = ?, op_c = ?, op_d = ?, correta = ? WHERE id = ?',
      [newPergunta, newA, newB, newC, newD, newCorreta, id]);
    return res.json({ message: 'Quiz atualizado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar quiz' });
  }
});

// Remover quiz (admin)
app.delete('/api/quizzes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await run('DELETE FROM quizzes WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Quiz não encontrado' });
    return res.json({ message: 'Quiz removido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao remover quiz' });
  }
});

// Obter quiz por conteúdo
app.get('/api/quizzes/:conteudoId', async (req, res) => {
  try {
    const conteudoId = Number(req.params.conteudoId);
    const quiz = await all('SELECT id, conteudo_id, pergunta, op_a, op_b, op_c, op_d FROM quizzes WHERE conteudo_id = ?', [conteudoId]);
    return res.json(quiz);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao obter quiz' });
  }
});

// Progresso: atualizar XP e nível ao concluir aula
const computeLevel = (xp) => Math.floor(xp / 100) + 1;

app.put('/api/progresso/:conteudoId', authenticateToken, async (req, res) => {
  try {
    const conteudoId = Number(req.params.conteudoId);
    const usuarioId = req.user.id;
    const content = await get('SELECT id, xp FROM conteudos WHERE id = ?', [conteudoId]);
    if (!content) return res.status(404).json({ error: 'Conteúdo não encontrado' });

    // Marcar progresso concluído (upsert)
    await run(
      'INSERT INTO progresso (usuario_id, conteudo_id, concluido) VALUES (?, ?, 1) ON CONFLICT(usuario_id, conteudo_id) DO UPDATE SET concluido = excluded.concluido',
      [usuarioId, conteudoId]
    );

    // Atualizar XP e nível
    const user = await get('SELECT xp FROM usuarios WHERE id = ?', [usuarioId]);
    const award = typeof content?.xp === 'number' ? content.xp : 10;
    const newXp = (user?.xp ?? 0) + award; // usa XP do conteúdo (default 10)
    const newNivel = computeLevel(newXp);
    await run('UPDATE usuarios SET xp = ?, nivel = ? WHERE id = ?', [newXp, newNivel, usuarioId]);

    return res.json({ message: 'Progresso atualizado', xp: newXp, nivel: newNivel, awarded: award });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar progresso' });
  }
});

// Removido duplicado: já existe health detalhado acima

// Tutor (Gemini) com localizador
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

async function resolveLocator(req) {
  const now = new Date();
  const timeIso = now.toISOString();
  let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const formatLocal = (tz) => ({
    hours: new Date().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: tz }),
    date: new Date().toLocaleDateString('pt-BR', { timeZone: tz }),
  });
  let localFmt = formatLocal(timeZone);

  // Preferir dados enviados pelo cliente
  const { lat, lon, cidade, pais } = req.body || {};
  let location = { lat: null, lon: null, cidade: cidade || null, pais: pais || null };

  if (typeof lat === 'number' && typeof lon === 'number') {
    location.lat = lat; location.lon = lon;
  }

  // Se não veio coordenada, tentar geolocalização por IP (best effort)
  if (!location.lat || !location.lon) {
    try {
      const resp = await fetch('https://ipapi.co/json/');
      if (resp.ok) {
        const j = await resp.json();
        location.lat = j.latitude || location.lat;
        location.lon = j.longitude || location.lon;
        location.cidade = location.cidade || j.city || null;
        location.pais = location.pais || j.country_name || null;
        if (j.timezone) {
          timeZone = j.timezone;
          localFmt = formatLocal(timeZone);
        }
      }
    } catch (_) {}
  }

  // Clima via Open-Meteo se tiver coordenadas
  let temperatura = null;
  if (location.lat && location.lon) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        temperatura = data?.current?.temperature_2m ?? null;
      }
    } catch (_) {}
  }

  return { timeIso, timeZone, hoursLocal: localFmt.hours, dateLocal: localFmt.date, location, temperatura };
}

function sanitizeTutorText(t) {
  let s = String(t || '');
  // Remove markdown headings, bullets, emphasis and decorative lines
  s = s.replace(/^#+\s*/gm, '');
  s = s.replace(/^\s*[-*•]\s+/gm, '');
  s = s.replace(/\*{1,3}/g, '');
  s = s.replace(/_{1,3}/g, '');
  s = s.replace(/`{1,3}[^`]*`{1,3}/g, '');
  s = s.replace(/^\s*---+\s*$/gm, '');
  s = s.replace(/^>\s+/gm, '');
  // Collapse excessive whitespace
  s = s.replace(/[ \t]{2,}/g, ' ');
  s = s.replace(/\n{3,}/g, '\n\n');
  s = s.trim();
  // Enforce length limit to keep answers concise
  const maxChars = 800;
  if (s.length > maxChars) s = s.slice(0, maxChars).trim() + '…';
  return s;
}

app.post('/api/tutor', async (req, res) => {
  try {
    const { pergunta } = req.body || {};
    if (!pergunta) return res.status(400).json({ error: 'Informe o campo "pergunta"' });

    const locator = await resolveLocator(req);
    const locStr = [
      locator.location.cidade && locator.location.pais ? `${locator.location.cidade}, ${locator.location.pais}` : null,
      locator.dateLocal ? `data: ${locator.dateLocal}` : null,
      locator.hoursLocal ? `hora local: ${locator.hoursLocal}` : null,
      locator.timeZone ? `fuso: ${locator.timeZone}` : null,
      (typeof locator.temperatura === 'number') ? `temperatura: ${locator.temperatura}°C` : null
    ].filter(Boolean).join(' | ');

    const systemPrompt = [
      'Você é um Tutor de Nivelamento Acadêmico em PT-BR (Português, Inglês e Exatas).',
      'Responda apenas ao que foi perguntado, de forma curta (máx. 5–6 linhas).',
      'Não use markdown, títulos ou símbolos decorativos (sem *, -, #, **, ---). Texto plano apenas.',
      'Opcionalmente, estruture em até 3 frases: diagnóstico breve; plano com 2–3 passos; pergunta final curta.',
      'Se a pergunta envolver hora/data/clima, use o contexto fornecido; se faltar dado (ex.: temperatura), diga claramente que não há essa informação exata agora.',
      'Seja direto e coerente, em português claro.',
      locStr ? `Contexto do usuário (local): ${locStr}.` : null
    ].filter(Boolean).join('\n');

    // Se Gemini não estiver configurado, responda com fallback em vez de 500
    let text = null;
    let usedModel = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    let errorInfo = null;
    if (!genAI) {
      text = 'Tutor indisponível no momento. Configure GEMINI_API_KEY para ativar respostas inteligentes.';
      errorInfo = 'GEMINI_API_KEY ausente';
    } else {
      try {
        const model = genAI.getGenerativeModel({ model: usedModel });
        const prompt = `${systemPrompt}\n\nPergunta do usuário:\n${pergunta}`;
        const result = await model.generateContent(prompt);
        text = result?.response?.text?.() || result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta.';
        text = sanitizeTutorText(text);
      } catch (modelErr) {
        console.error('Gemini error:', modelErr);
        text = 'Não consegui responder agora. Tente novamente em instantes.';
        errorInfo = modelErr?.message || String(modelErr);
        text = sanitizeTutorText(text);
      }
    }

    // tentar identificar usuario via token opcional
    let usuarioId = null;
    try {
      const authHeader = req.headers['authorization'] || '';
      const tok = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (tok) {
        const payload = jwt.verify(tok, JWT_SECRET);
        if (payload?.id) usuarioId = payload.id;
      }
    } catch (_) {}

    // persistir conversa (par user/tutor) na tabela consolidada
    const contextJson = JSON.stringify({ locator, model: usedModel, error: errorInfo });
    await run(
      'INSERT INTO tutor_conversas (usuario_id, pergunta, resposta, contexto) VALUES (?, ?, ?, ?)',
      [usuarioId, pergunta, text, contextJson]
    );

    // persistir no novo arquivo chat.db como mensagens separadas por papel
    try {
      await chatRun('INSERT INTO chat_messages (usuario_id, role, text) VALUES (?, ?, ?)', [usuarioId, 'user', pergunta]);
      await chatRun('INSERT INTO chat_messages (usuario_id, role, text) VALUES (?, ?, ?)', [usuarioId, 'tutor', text]);
    } catch (e) {
      console.error('Erro ao salvar no chat.db:', e);
    }

    return res.json({
      answer: sanitizeTutorText(text),
      context: {
        locator,
        model: usedModel,
        error: errorInfo
      }
    });
  } catch (err) {
    console.error(err);
    // Responder com fallback para evitar 500 no chat
    const fallback = 'O tutor encontrou um erro inesperado. Tente novamente mais tarde.';
    return res.status(200).json({ answer: fallback, context: { error: err?.message || String(err) } });
  }
});

// Histórico do chat por usuário (novo arquivo chat.db)
app.get('/api/chat/messages/me', authenticateToken, async (req, res) => {
  try {
    const rows = await chatAll('SELECT id, role, text, created_at FROM chat_messages WHERE usuario_id = ? ORDER BY id DESC LIMIT 200', [req.user.id]);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar histórico de chat' });
  }
});

// Listar conversas do próprio usuário
app.get('/api/tutor/conversas/me', authenticateToken, async (req, res) => {
  try {
    const rows = await all('SELECT id, pergunta, resposta, contexto, created_at FROM tutor_conversas WHERE usuario_id = ? ORDER BY id DESC', [req.user.id]);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar conversas' });
  }
});

// Listagem geral para admin
app.get('/api/tutor/conversas', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rows = await all('SELECT id, usuario_id, pergunta, resposta, contexto, created_at FROM tutor_conversas ORDER BY id DESC LIMIT 200');
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar conversas (admin)' });
  }
});

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, 'uploads', 'profile-pictures');
    cb(null, dest); // Pasta onde as imagens serão salvas
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

// Garantir que a pasta de uploads exista (evita erros no Windows/ambientes sem a pasta)
try {
  fs.mkdirSync(path.join(__dirname, 'uploads', 'profile-pictures'), { recursive: true });
} catch (e) {
  console.error('Não foi possível criar pasta de uploads:', e);
}

// Endpoint para upload de foto de perfil
app.post('/api/profile/upload-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.user.id;
    // Normalizar caminho para URL pública (usar /uploads/...)
    const relativePath = path.relative(__dirname, req.file.path).replace(/\\/g, '/');
    const filePath = '/' + relativePath;

    // Atualizar o caminho da foto no banco de dados (guardamos o caminho relativo /uploads/...)
    // Também gravar o conteúdo binário na coluna foto_blob para garantir persistência
    try {
      const fileBuf = fs.readFileSync(req.file.path);
      await run('UPDATE usuarios SET foto_perfil = ?, foto_blob = ? WHERE id = ?', [filePath, fileBuf, userId]);
    } catch (e) {
      // fallback: update only path
      await run('UPDATE usuarios SET foto_perfil = ? WHERE id = ?', [filePath, userId]);
    }

    // Construir URL pública absoluta para o frontend (útil com proxies de dev)
    const fileUrl = `${req.protocol}://${req.get('host')}${filePath}`;

    res.status(200).json({ message: 'Foto de perfil atualizada com sucesso', filePath, fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer upload da foto de perfil' });
  }
});

// Endpoint para atualizar o avatar do usuário
app.post('/api/profile/update-avatar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ error: 'Avatar é obrigatório' });
    }

    // Atualizar o avatar no banco de dados
    await run('UPDATE usuarios SET avatar = ? WHERE id = ?', [avatar, userId]);

    res.status(200).json({ message: 'Avatar atualizado com sucesso', avatar });
  } catch (err) {
    console.error('Erro em /api/profile/update-avatar:', err);
    res.status(500).json({ error: 'Erro ao atualizar o avatar', detail: err?.message || String(err) });
  }
});

// Serve user photo by id. Prefers foto_blob (BLOB) when present, falls back to stored file path.
app.get('/api/usuarios/:id/photo', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const row = await get('SELECT foto_perfil, foto_blob FROM usuarios WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: 'Usuário não encontrado' });

    if (row.foto_blob) {
      // Infer mime type from foto_perfil extension if available
      let mime = 'image/png';
      try {
        const fp = row.foto_perfil || '';
        const ext = path.extname(fp || '').toLowerCase();
        if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
        else if (ext === '.png') mime = 'image/png';
        else if (ext === '.gif') mime = 'image/gif';
        else if (ext === '.svg') mime = 'image/svg+xml';
        else if (ext === '.webp') mime = 'image/webp';
      } catch (e) {}
      res.set('Content-Type', mime);
      return res.send(row.foto_blob);
    }

    if (row.foto_perfil) {
      const filePath = path.join(__dirname, row.foto_perfil);
      if (fs.existsSync(filePath)) return res.sendFile(filePath);
    }

    return res.status(404).json({ error: 'Foto não encontrada' });
  } catch (err) {
    console.error('Error serving user photo:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor ouvindo em http://localhost:${PORT}`);
});
