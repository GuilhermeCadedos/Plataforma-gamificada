const db = require('./database');
const chatdb = require('./chatdb');
const email = process.argv[2];
if (!email) { console.error('Uso: node delete-user.js <email>'); process.exit(1); }

function run(dbConn, sql, params=[]) { return new Promise((resolve,reject)=> dbConn.run(sql, params, function(e){ if(e) return reject(e); resolve({ changes: this.changes }); })); }
function get(sql, params=[]) { return new Promise((resolve,reject)=> db.get(sql, params, (e,row)=> e?reject(e):resolve(row)); }

(async () => {
  const user = await get('SELECT id, nome, email FROM usuarios WHERE email = ?', [email]);
  if (!user) { console.error('Usuário não encontrado:', email); process.exit(2); }
  // apagar histórico do chat no arquivo chat.db
  try {
    await run(chatdb, 'DELETE FROM chat_messages WHERE usuario_id = ?', [user.id]);
    console.log('Mensagens de chat removidas para usuario_id', user.id);
  } catch (e) {
    console.warn('Aviso: falha ao limpar chat.db:', e.message);
  }
  // apagar usuário (progresso e quizzes relacionados são em cascade)
  const res = await run(db, 'DELETE FROM usuarios WHERE id = ?', [user.id]);
  console.log('Usuário removido:', user.email, 'changes=', res.changes);
  db.close(); chatdb.close();
  process.exit(0);
})().catch(err => { console.error(err); process.exit(3); });
