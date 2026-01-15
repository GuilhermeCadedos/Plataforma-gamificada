const db = require('./database');
const email = process.argv[2];
if (!email) { console.error('Uso: node check-user.js <email>'); process.exit(1); }
function get(sql, params=[]) { return new Promise((resolve,reject)=> db.get(sql, params, (e,row)=> e?reject(e):resolve(row)); }
(async () => {
  const user = await get('SELECT id, nome, email, cargo, xp, nivel FROM usuarios WHERE email = ?', [email]);
  if (!user) { console.log('Usuário não encontrado'); process.exit(2); }
  console.log(JSON.stringify(user, null, 2));
  db.close();
})();
