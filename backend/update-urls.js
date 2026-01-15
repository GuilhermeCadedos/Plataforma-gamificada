const fs = require('fs');
const path = require('path');
const db = require('./database');

const urlsPath = path.join(__dirname, 'seed', 'urls.json');
const items = JSON.parse(fs.readFileSync(urlsPath, 'utf-8'));

(async () => {
  try {
    for (const it of items) {
      if (!it.url) continue; // skip empty
      const { materia, ordem, titulo, url } = it;
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE conteudos SET url = ? WHERE materia = ? AND ordem = ? AND titulo = ?',
          [url, materia, ordem, titulo],
          function (err) {
            if (err) return reject(err);
            resolve();
          }
        );
      });
      console.log(`Atualizado: ${materia} #${ordem} - ${titulo}`);
    }
    console.log('URLs atualizadas.');
  } catch (err) {
    console.error('Erro ao atualizar URLs:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
})();
