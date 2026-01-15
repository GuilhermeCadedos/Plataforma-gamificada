const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

// Ensure DB directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "app.db");
const db = new sqlite3.Database(dbPath);

// Initialize schema
db.serialize(() => {
  // Enforce foreign keys
  db.run("PRAGMA foreign_keys = ON");

  // usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      xp INTEGER NOT NULL DEFAULT 0,
      nivel INTEGER NOT NULL DEFAULT 1,
      cargo TEXT NOT NULL CHECK (cargo IN ('admin','aluno')),
      avatar TEXT,
      foto_perfil TEXT
    )
  `);

  // Ensure legacy DBs get new columns
  db.all("PRAGMA table_info(usuarios)", [], (err, rows) => {
    if (!err && Array.isArray(rows)) {
      const hasAvatar = rows.some((r) => r.name === "avatar");
      const hasFoto = rows.some((r) => r.name === "foto_perfil");
      if (!hasAvatar) {
        db.run("ALTER TABLE usuarios ADD COLUMN avatar TEXT");
        console.log("Migrated: added column avatar to usuarios");
      }
      if (!hasFoto) {
        db.run("ALTER TABLE usuarios ADD COLUMN foto_perfil TEXT");
        console.log("Migrated: added column foto_perfil to usuarios");
      }
      const hasFotoBlob = rows.some((r) => r.name === "foto_blob");
      if (!hasFotoBlob) {
        // store image binary optionally as BLOB for stronger persistence
        try {
          db.run("ALTER TABLE usuarios ADD COLUMN foto_blob BLOB");
          console.log("Migrated: added column foto_blob to usuarios");
        } catch (e) {}
      }
    }
  });

  // conteudos
  db.run(`
    CREATE TABLE IF NOT EXISTS conteudos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materia TEXT NOT NULL,
      titulo TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('video','texto')),
      url TEXT,
      explicacao TEXT,
      ordem INTEGER,
      xp INTEGER DEFAULT 10
    )
  `);

  // Migrar coluna xp se banco antigo não possuir
  db.all("PRAGMA table_info(conteudos)", [], (err, rows) => {
    if (!err && Array.isArray(rows)) {
      const hasXp = rows.some((r) => r.name === "xp");
      if (!hasXp) {
        db.run("ALTER TABLE conteudos ADD COLUMN xp INTEGER DEFAULT 10");
      }
    }
  });

  // quizzes
  db.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conteudo_id INTEGER NOT NULL,
      pergunta TEXT NOT NULL,
      op_a TEXT NOT NULL,
      op_b TEXT NOT NULL,
      op_c TEXT NOT NULL,
      op_d TEXT NOT NULL,
      correta TEXT NOT NULL CHECK (correta IN ('A','B','C','D')),
      FOREIGN KEY (conteudo_id) REFERENCES conteudos(id) ON DELETE CASCADE
    )
  `);

  // progresso
  db.run(`
    CREATE TABLE IF NOT EXISTS progresso (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      conteudo_id INTEGER NOT NULL,
      concluido INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (conteudo_id) REFERENCES conteudos(id) ON DELETE CASCADE,
      UNIQUE(usuario_id, conteudo_id)
    )
  `);

  // tutor_conversas: histórico de conversas com o tutor
  db.run(`
    CREATE TABLE IF NOT EXISTS tutor_conversas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NULL,
      pergunta TEXT NOT NULL,
      resposta TEXT NOT NULL,
      contexto TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
    )
  `);
});

// Function to create or update an admin user
async function createOrUpdateAdminUser() {
  const email = "cadcadedos@gmail.com";
  const nome = "administrador principal";
  const senha = "silvane80";
  const hash = await bcrypt.hash(senha, 12);

  const findUserSql = "SELECT id FROM usuarios WHERE email = ?";
  const insertUserSql =
    "INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?, ?, ?, ?)";

  return new Promise((resolve, reject) => {
    db.get(findUserSql, [email], (err, row) => {
      if (err) return reject(err);

      if (row) {
        // Update existing user
        db.run(
          `UPDATE usuarios SET nome = ?, senha = ?, cargo = ? WHERE email = ?`,
          [nome, hash, "admin", email],
          function (err) {
            if (err) return reject(err);
            resolve({ id: row.id, updated: true });
          }
        );
      } else {
        // Insert new user
        db.run(insertUserSql, [nome, email, hash, "admin"], function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID, updated: false });
        });
      }
    });
  });
}

// Call the function to create or update the admin user
createOrUpdateAdminUser()
  .then((result) => {
    if (result.updated) {
      console.log(`Admin user updated with ID: ${result.id}`);
    } else {
      console.log(`Admin user created with ID: ${result.id}`);
    }
  })
  .catch((err) => console.error("Error creating or updating admin user:", err));

module.exports = db;
