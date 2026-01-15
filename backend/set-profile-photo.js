const db = require('./database');
const path = require('path');

// Usage: node set-profile-photo.js --email=user@example.com --photo=/assets/avatars/avatar1.svg

const argv = require('minimist')(process.argv.slice(2));
const email = argv.email;
const photo = argv.photo;

if (!email || !photo) {
  console.error('Usage: node set-profile-photo.js --email=EMAIL --photo=PHOTO_PATH');
  process.exit(1);
}

db.serialize(() => {
  db.run('UPDATE usuarios SET foto_perfil = ? WHERE email = ?', [photo, email], function (err) {
    if (err) {
      console.error('Erro ao atualizar foto_perfil:', err.message);
      process.exit(2);
    }
    if (this.changes === 0) {
      console.error('Nenhum usuário encontrado com o email informado');
      process.exit(3);
    }
    console.log(`foto_perfil atualizada para ${email} => ${photo}`);
    process.exit(0);
  });
});
