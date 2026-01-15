const db = require("./database");
const email = process.argv[2];
if (!email) {
  console.error("Uso: node promote-admin.js <email>");
  process.exit(1);
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

(async () => {
  const user = await get(
    "SELECT id, nome, email, cargo FROM usuarios WHERE email = ?",
    [email]
  );
  if (!user) {
    console.error("Usuário não encontrado:", email);
    process.exit(2);
  }
  if (user.cargo === "admin") {
    console.log("Usuário já é admin:", user.email);
    process.exit(0);
  }
  const result = await run("UPDATE usuarios SET cargo = ? WHERE id = ?", [
    "admin",
    user.id,
  ]);
  console.log("Promovido para admin:", user.email, "changes=", result.changes);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(3);
});
