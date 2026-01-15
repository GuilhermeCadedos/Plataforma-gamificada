const db = require("./database");
const https = require("https");

function toId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.replace(/^\//, "");
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      if (u.pathname.startsWith("/embed/"))
        return u.pathname.replace("/embed/", "");
    }
  } catch {}
  return null;
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "EmbedTest/1.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, text: data }));
      })
      .on("error", reject);
  });
}

(async () => {
  const all = await new Promise((resolve, reject) => {
    db.all(
      "SELECT id, materia, titulo, tipo, url FROM conteudos ORDER BY ordem ASC, id ASC",
      [],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });

  const origin = "http://localhost:5281";
  const results = [];
  for (const c of all) {
    if (c.tipo !== "video" || !c.url) {
      results.push({
        id: c.id,
        titulo: c.titulo,
        materia: c.materia,
        tipo: c.tipo,
        status: "skip",
      });
      continue;
    }
    const id = toId(c.url);
    if (!id) {
      results.push({
        id: c.id,
        titulo: c.titulo,
        materia: c.materia,
        status: "no-id",
      });
      continue;
    }
    // Match frontend: use youtube-nocookie domain and same origin param
    const embedUrl = `https://www.youtube-nocookie.com/embed/${id}?origin=${origin}&rel=0&modestbranding=1`;
    try {
      const resp = await fetchText(embedUrl);
      const text = resp.text || "";
      const blocked =
        resp.status !== 200 ||
        /Video unavailable|Vídeo indisponível|Playback on other websites has been disabled|A reprodução em outros sites foi desativada pelo proprietário do vídeo/i.test(
          text
        );
      results.push({
        id: c.id,
        titulo: c.titulo,
        materia: c.materia,
        status: blocked ? "blocked" : "ok",
        http: resp.status,
      });
    } catch (e) {
      results.push({
        id: c.id,
        titulo: c.titulo,
        materia: c.materia,
        status: "error",
        error: e.message,
      });
    }
  }

  // Print summary
  const summary = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  console.log("Embed test summary:", summary);
  for (const r of results) {
    console.log(
      `[${r.materia}] ${r.titulo} -> ${r.status}${r.http ? ` (${r.http})` : ""}`
    );
  }
  db.close();
})();
