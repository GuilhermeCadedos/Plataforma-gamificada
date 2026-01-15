const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Ensure DB directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Separate chat database file
const dbPath = path.join(dataDir, "chat.db");
const db = new sqlite3.Database(dbPath);

// Initialize schema for chat messages (no cross-DB foreign key)
// Stores both user and tutor messages, per user, with timestamps.
// role: 'user' | 'tutor'
// usuario_id: numeric id from main app DB (optional for anonymous)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NULL,
      role TEXT NOT NULL CHECK (role IN ('user','tutor')),
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
});

module.exports = db;
