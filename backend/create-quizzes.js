const db = require("./database");
const path = require("path");

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

(async () => {
  try {
    const materiasRows = await all("SELECT DISTINCT materia FROM conteudos");
    const materias = materiasRows.map((r) => r.materia).filter(Boolean);
    if (materias.length === 0) {
      console.log("Nenhuma matéria encontrada em conteudos. Nada a fazer.");
      process.exit(0);
    }

    for (const materia of materias) {
      // pick a representative conteudo id for this materia
      const content = await get(
        "SELECT id, titulo FROM conteudos WHERE materia = ? ORDER BY ordem ASC LIMIT 1",
        [materia]
      );
      if (!content) continue;

      // build question and options
      const question = `Qual disciplina trata dos tópicos abordados em "${content.titulo}"?`;

      // pick distractors
      const other = materias.filter((m) => m !== materia);
      shuffle(other);
      const distractors = other.slice(0, 3);
      const opts = [materia, ...distractors];
      shuffle(opts);

      const mapLetter = { 0: "A", 1: "B", 2: "C", 3: "D" };
      const opA = opts[0] || "N/A";
      const opB = opts[1] || "N/A";
      const opC = opts[2] || "N/A";
      const opD = opts[3] || "N/A";
      const corretaIndex = opts.findIndex((x) => x === materia);
      const correta = mapLetter[corretaIndex] || "A";

      // Insert quiz
      const res = await run(
        "INSERT INTO quizzes (conteudo_id, pergunta, op_a, op_b, op_c, op_d, correta) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [content.id, question, opA, opB, opC, opD, correta]
      );
      console.log(
        `Inserted quiz for materia='${materia}' (conteudo_id=${content.id}) as quiz id ${res.id}`
      );
    }

    console.log("Done inserting quizzes.");
    process.exit(0);
  } catch (err) {
    console.error("Error creating quizzes:", err);
    process.exit(1);
  }
})();
