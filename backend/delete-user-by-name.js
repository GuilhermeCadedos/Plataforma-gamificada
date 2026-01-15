const db = require('./database');
const chatdb = require('./chatdb');
const nome = process.argv.slice(2).join(' ').trim();
if (!nome) { console.error('Uso: node delete-user-by-name.js <nome completo>'); process.exit(1); }

function all(sql, params=[]) { return new Promise((resolve,reject)=> db.all(sql, params, (e,rows)=> e?reject(e):resolve(rows)); }
function run(conn, sql, params=[]) { return new Promise((resolve,reject)=> conn.run(sql, params, function(e){ if(e) return reject(e); resolve({ changes: this.changes }); })); }

(async () => {
  const users = await all('SELECT id, nome, email FROM usuarios WHERE nome = ?', [nome]);
  if (!users || users.length === 0) { console.error('Nenhum usuário encontrado com nome:', nome); process.exit(2); }
  console.log('Encontrados', users.length, 'usuário(s) com nome', nome);
  for (const u of users) {
    try {
      await run(chatdb, 'DELETE FROM chat_messages WHERE usuario_id = ?', [u.id]);
      console.log('Chat limpo para', u.email);
    } catch (e) {
      console.warn('Falha ao limpar chat para', u.email, e.message);
    }
    const res = await run(db, 'DELETE FROM usuarios WHERE id = ?', [u.id]);
    console.log('Removido', u.email, 'changes=', res.changes);
  }
  db.close(); chatdb.close();
  console.log('Concluído.');
  process.exit(0);
})().catch(err => { console.error(err); process.exit(3); });
