const db = require("./database");

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

const items = [
  // --- Matemática (EN com legendas quando não houver PT-BR) ---
  {
    materia: "Matemática",
    titulo: "Regra dos Sinais (Matemática)",
    tipo: "video",
    url: "https://www.youtube.com/embed/4XuFt3cDxR8",
    explicacao: "Regra dos sinais em operações aritméticas.",
    ordem: 10,
    xp: 120,
  },

  // --- Física ---
  {
    materia: "Física",
    titulo: "Leis de Newton (Khan Academy EN)",
    tipo: "video",
    url: "https://www.youtube.com/watch?v=kKKM8Y-u7ds",
    explicacao: "As três leis do movimento.",
    ordem: 14,
    xp: 150,
  },
  {
    materia: "Física",
    titulo: "As 3 Leis de Newton: Resumo em 5 Minutos",
    tipo: "video",
    url: "https://www.youtube.com/embed/W9fnE9NdFzo?si=QrS6MUZkCppwbnB4",
    explicacao: "Resumo das três leis de Newton em 5 minutos.",
    ordem: 25,
    xp: 120,
  },
  {
    materia: "Física",
    titulo: "Movimento Uniforme | M.U Física",
    tipo: "video",
    url: "https://www.youtube.com/embed/C93tQjswQgU?si=nLaF4j7JdGe37PI8",
    explicacao: "Introdução ao movimento uniforme.",
    ordem: 26,
    xp: 120,
  },
  {
    materia: "Física",
    titulo: "Vetores",
    tipo: "video",
    url: "https://www.youtube.com/embed/eAAKzZcbITI?si=5dHjJ7-3LcrD9gV_",
    explicacao: "Conceitos básicos sobre vetores.",
    ordem: 27,
    xp: 120,
  },
  {
    materia: "Física",
    titulo: "Unidades de Medida: Comprimento",
    tipo: "video",
    url: "https://www.youtube.com/embed/AEq9ykJkR2U?si=k1PKtPBeN2rRrGRN",
    explicacao: "Como converter unidades de comprimento.",
    ordem: 28,
    xp: 120,
  },
  {
    materia: "Física",
    titulo: "Unidades de Medida: Tempo",
    tipo: "video",
    url: "https://www.youtube.com/embed/XPVu6ThD3O0?si=qenhSURqR3NxExAr",
    explicacao: "Como converter unidades de tempo.",
    ordem: 29,
    xp: 120,
  },
  {
    materia: "Física",
    titulo: "Unidades de Medida: Massa",
    tipo: "video",
    url: "https://www.youtube.com/embed/WFGQelMfd5U?si=wNuNr7HhlXuokpoa",
    explicacao: "Como converter unidades de massa.",
    ordem: 30,
    xp: 120,
  },

  // (Português e Inglês Instrumental) removido conforme solicitação
  // --- Matemática (extras) ---
  {
    materia: "Matemática",
    titulo: "Frações: Introdução",
    tipo: "video",
    url: "https://www.youtube.com/embed/dZfWflhf_IU",
    explicacao: "Introdução ao conceito de frações.",
    ordem: 18,
    xp: 120,
  },
  {
    materia: "Matemática",
    titulo: "Adição e Subtração de Números Decimais",
    tipo: "video",
    url: "https://www.youtube.com/embed/DxNrMiTk-Bg",
    explicacao: "Operações com números decimais: soma e subtração.",
    ordem: 19,
    xp: 120,
  },
  {
    materia: "Matemática",
    titulo: "Multiplicação e Divisão com Números Decimais",
    tipo: "video",
    url: "https://www.youtube.com/embed/9LeCpU_cR0E",
    explicacao: "Operações com números decimais: multiplicar e dividir.",
    ordem: 20,
    xp: 120,
  },
  {
    materia: "Matemática",
    titulo: "Fatoração: Introdução",
    tipo: "video",
    url: "https://www.youtube.com/embed/BoJaNfpV4Tk",
    explicacao: "Introdução à fatoração em álgebra.",
    ordem: 21,
    xp: 120,
  },
  {
    materia: "Matemática",
    titulo: "Produtos Notáveis",
    tipo: "video",
    url: "https://www.youtube.com/embed/UECy1XbL6w8",
    explicacao: "Produtos notáveis e aplicações.",
    ordem: 22,
    xp: 120,
  },
  {
    materia: "Matemática",
    titulo: "Equação do 1º Grau",
    tipo: "video",
    url: "https://www.youtube.com/embed/x4k8950MVeg",
    explicacao: "Introdução às equações de primeiro grau.",
    ordem: 23,
    xp: 120,
  },
  {
    materia: "Matemática",
    titulo: "Equação do 2º Grau",
    tipo: "video",
    url: "https://www.youtube.com/embed/r-Vuvb18kUk",
    explicacao: "Conceitos e resolução de equações de segundo grau.",
    ordem: 24,
    xp: 150,
  },
  {
    materia: "Matemática",
    titulo: "Função Logarítmica",
    tipo: "video",
    url: "https://www.youtube.com/embed/oza6zrCMOPM",
    explicacao: "Introdução à função logarítmica.",
    ordem: 25,
    xp: 150,
  },
  {
    materia: "Matemática",
    titulo: "Função Exponencial",
    tipo: "video",
    url: "https://www.youtube.com/embed/Ggh77h1Cs4M",
    explicacao: "Introdução à função exponencial.",
    ordem: 26,
    xp: 150,
  },
  {
    materia: "Português",
    titulo: "Infográfico: Como criar um bom infográfico",
    tipo: "video",
    url: "https://www.youtube.com/embed/F3nR3g5Ol4g?si=lU6OmsjLC6rkBxmm",
    explicacao: "Dicas para criar infográficos eficazes.",
    ordem: 31,
    xp: 120,
  },
  {
    materia: "Português",
    titulo: "Infográfico: Exemplos e Aplicações",
    tipo: "video",
    url: "https://www.youtube.com/embed/joseq83vyXI?si=m3oGZMIsdHBwkpj-",
    explicacao: "Exemplos práticos de infográficos.",
    ordem: 32,
    xp: 120,
  },
  {
    materia: "Português",
    titulo: "Coesão e Coerência",
    tipo: "video",
    url: "https://www.youtube.com/embed/cHcFDNkxpmQ?si=Uy69hhbRv7B_IxfK",
    explicacao: "Entenda os conceitos de coesão e coerência textual.",
    ordem: 33,
    xp: 120,
  },
  {
    materia: "Português",
    titulo: "Gêneros Acadêmicos: Resumo e Artigo Científico",
    tipo: "video",
    url: "https://www.youtube.com/embed/zLdiD0YYSlw?si=2q_mNtKlVKfv6GJ_",
    explicacao:
      "Como identificar a ideia principal em resumos e artigos científicos.",
    ordem: 34,
    xp: 120,
  },
  {
    materia: "Português",
    titulo: "Vícios de Linguagem e Clareza: Parte 1",
    tipo: "video",
    url: "https://www.youtube.com/embed/cC_d-IXYhvo?si=__qmdxzwFp59rI5k",
    explicacao: "Evite ambiguidades e gírias em textos acadêmicos.",
    ordem: 35,
    xp: 120,
  },
  {
    materia: "Português",
    titulo: "Vícios de Linguagem e Clareza: Parte 2",
    tipo: "video",
    url: "https://www.youtube.com/embed/jneIZxH4JRY?si=_UmGzoA4MLi69G8D",
    explicacao: "Dicas para melhorar a clareza e evitar vícios de linguagem.",
    ordem: 36,
    xp: 120,
  },
  {
    materia: "Inglês",
    titulo: "Técnicas de Leitura para Interpretação de Textos em Inglês",
    tipo: "video",
    url: "https://www.youtube.com/embed/C-Mc6SlvrfM?si=xjWtpoc4BkW59sU3",
    explicacao: "Dicas para melhorar a interpretação de textos em inglês.",
    ordem: 37,
    xp: 120,
  },
  {
    materia: "Inglês",
    titulo: "Falsos Cognatos",
    tipo: "video",
    url: "https://www.youtube.com/embed/Tz5WW3xPzqY?si=immyHXWdvH3eFo1Y",
    explicacao: "Aprenda a identificar e evitar falsos cognatos em inglês.",
    ordem: 38,
    xp: 120,
  },
  {
    materia: "Inglês",
    titulo: "Modal Verbs – O que são e como usar?",
    tipo: "video",
    url: "https://www.youtube.com/embed/cjtbK8Ax-q8?si=AbqUeFTeiaQDiHgv",
    explicacao: "Entenda o uso dos modal verbs em inglês.",
    ordem: 39,
    xp: 120,
  },
  {
    materia: "Inglês",
    titulo: "Verbo To Be - Presente, Passado e Futuro",
    tipo: "video",
    url: "https://www.youtube.com/embed/NiuivTVEZkQ?si=zVFyfimbbVfjrmB9",
    explicacao: "Aprenda o verbo to be nos tempos presente, passado e futuro.",
    ordem: 40,
    xp: 120,
  },
  {
    materia: "Inglês",
    titulo: "Todos os Tempos Verbais em Inglês em 30 Minutos",
    tipo: "video",
    url: "https://www.youtube.com/embed/w1TbQEPP020?si=RarCP9rOJfiC18Wu",
    explicacao: "Resumo de todos os tempos verbais em inglês.",
    ordem: 41,
    xp: 150,
  },
];

const filteredItems = items.filter(
  (item) =>
    ![
      "Dev Web: HTML e CSS",
      "Dev Web: JavaScript",
      "Lógica e Tecnologia",
    ].includes(item.materia)
);

async function seed() {
  try {
    await run("DELETE FROM progresso");
    await run("DELETE FROM quizzes");
    await run("DELETE FROM conteudos");

    for (const it of filteredItems) {
      await run(
        `INSERT INTO conteudos (materia, titulo, tipo, url, explicacao, ordem, xp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [it.materia, it.titulo, it.tipo, it.url, it.explicacao, it.ordem, it.xp]
      );
      console.log(`Inserido: [${it.materia}] ${it.titulo}`);
    }
    console.log("Importação concluída com sucesso.");
  } catch (err) {
    console.error("Erro ao importar conteúdos:", err);
  } finally {
    db.close();
  }
}

seed();
