const db = require('./database');

const items = [
  { materia:'Matemática', titulo:'Fatoração e Produtos Notáveis', tipo:'video', url:'https://www.youtube.com/watch?v=OonL7Pst86A', explicacao:null, ordem:1, xp:100 },
  { materia:'Matemática', titulo:'Funções de 1º e 2º Grau', tipo:'video', url:'https://www.youtube.com/watch?v=vV_TfSXYKno', explicacao:null, ordem:2, xp:100 },
  { materia:'Lógica e Tecnologia', titulo:'Introdução a Algoritmos e Lógica', tipo:'video', url:'https://www.youtube.com/watch?v=8mei6uVttho', explicacao:null, ordem:3, xp:100 },
  { materia:'Lógica e Tecnologia', titulo:'Tabelas Verdade (Raciocínio Lógico)', tipo:'video', url:'https://www.youtube.com/watch?v=mC6H7uXN_k4', explicacao:null, ordem:4, xp:100 },
  { materia:'Física', titulo:'Introdução aos Vetores', tipo:'video', url:'https://www.youtube.com/watch?v=hBf1S62mI5w', explicacao:null, ordem:5, xp:100 },
  { materia:'Física', titulo:'As 3 Leis de Newton', tipo:'video', url:'https://www.youtube.com/watch?v=8V_7_P7eW4U', explicacao:null, ordem:6, xp:100 },
  { materia:'Português', titulo:'Interpretação de Gráficos e Tabelas', tipo:'video', url:'https://www.youtube.com/watch?v=p4vWbYpbe6E', explicacao:null, ordem:7, xp:100 },
  { materia:'Inglês', titulo:'Inglês Técnico para TI e Engenharia', tipo:'video', url:'https://www.youtube.com/watch?v=z0vN89P_664', explicacao:null, ordem:8, xp:100 },
  { materia:'Inglês', titulo:'Falsos Cognatos no Inglês (False Friends)', tipo:'video', url:'https://www.youtube.com/watch?v=XWk3rVv6l1c', explicacao:null, ordem:9, xp:100 },
];

function run(sql, params=[]) { return new Promise((resolve,reject)=> db.run(sql, params, function(e){ if(e) return reject(e); resolve({ id: this.lastID, changes: this.changes }); })); }

(async () => {
  for (const it of items) {
    const res = await run(
      'INSERT INTO conteudos (materia, titulo, tipo, url, explicacao, ordem, xp) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [it.materia, it.titulo, it.tipo, it.url, it.explicacao, it.ordem, it.xp]
    );
    console.log('Inserido conteudo id', res.id, it.titulo);
  }
  db.close();
  console.log('Concluído.');
})();
