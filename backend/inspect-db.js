const db = require("./database");

db.serialize(() => {
  db.all("PRAGMA table_info(usuarios)", [], (err, rows) => {
    if (err) return console.error("Erro PRAGMA:", err.message);
    console.log("usuarios columns:");
    console.table(
      rows.map((r) => ({ cid: r.cid, name: r.name, type: r.type }))
    );

    db.all(
      "SELECT id, nome, email, avatar, foto_perfil FROM usuarios LIMIT 10",
      [],
      (e, users) => {
        if (e) return console.error("Erro SELECT usuarios:", e.message);
        console.log("usuarios rows:");
        console.table(users);
        process.exit(0);
      }
    );
  });
});
