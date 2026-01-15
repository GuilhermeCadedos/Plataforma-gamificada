const bcrypt = require('bcryptjs');
const db = require('./database');

const [,, nomeArg, emailArg, senhaArg] = process.argv;
if (!nomeArg || !emailArg || !senhaArg) {
  console.error('Uso: node create-admin.js <nome> <email> <senha>');
  process.exit(1);
}

function run(sql, params=[]) { return new Promise((resolve,reject)=> db.run(sql, params, function(e){ if(e) return reject(e); resolve({ id: this.lastID, changes: this.changes }); })); }
function get(sql, params=[]) { return new Promise((resolve,reject)=> db.get(sql, params, (e,row)=> e?reject(e):resolve(row))); }

(async () => {
  const email = emailArg.trim().toLowerCase();
  const nome = nomeArg.trim();
  const senha = senhaArg;
  const hash = await bcrypt.hash(senha, 12);

  const existing = await get('SELECT id, cargo FROM usuarios WHERE email = ?', [email]);
  if (!existing) {
    const res = await run('INSERT INTO usuarios (nome, email, senha, xp, nivel, cargo) VALUES (?, ?, ?, 0, 1, ?)', [nome, email, hash, 'admin']);
    console.log('Admin criado:', { id: res.id, nome, email });
  } else {
    await run('UPDATE usuarios SET nome = ?, senha = ?, cargo = ? WHERE id = ?', [nome, hash, 'admin', existing.id]);
    console.log('Usuário atualizado para admin:', { id: existing.id, nome, email });
  }
  db.close();
})().catch(err => { console.error(err); process.exit(2); });
