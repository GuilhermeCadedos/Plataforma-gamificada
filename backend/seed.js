const fs = require('fs');
const path = require('path');
const db = require('./database');

const sqlPath = path.join(__dirname, 'seed', 'seeds.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

console.log('Inserindo trilha de nivelamento...');
db.exec(sql, (err) => {
  if (err) {
    console.error('Erro ao executar seed:', err.message);
    process.exit(1);
  }
  console.log('Seed concluído com sucesso.');
  db.close();
});
