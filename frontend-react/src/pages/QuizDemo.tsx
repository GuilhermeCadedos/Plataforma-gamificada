import React, { useEffect, useRef, useState, useCallback } from 'react';
import QuizInterativo from '../components/QuizInterativo';

// Use Vite env var (import.meta.env) instead of process.env to avoid runtime errors
const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001';

const QuizDemo: React.FC = () => {
  const [quiz, setQuiz] = useState<any>(null);
  const [materias, setMaterias] = useState<Array<{ materia: string; conteudoId: number }>>([]);
  const [conteudos, setConteudos] = useState<any[]>([]);
  const [distinctMaterias, setDistinctMaterias] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [xp, setXp] = useState<number | null>(null);
  const [nivel, setNivel] = useState<number | null>(null);
  const QUESTIONS_PER_ROUND = 5;
  const timeoutRef = useRef<number | null>(null);

  // generateRound moved outside the effect so it can be reused to regenerate new rounds
  const generateRound = useCallback((mat: string | null) => {
    // curated questions per TRILHA (if matéria name matches TRILHA X, use these)
    const getCustomQuestionsForTrilha = (matName: string | null) => {
      if (!matName) return null;
      const n = matName.toUpperCase();
      if (n.includes('TRILHA 1') || n.includes('PORTUGU') || n.includes('PORTUGUÊS')) {
        return [
          { pergunta: 'Qual a função da conjunção "embora" em uma frase?', alternativas: [ {key:'A',text:'Adição'},{key:'B',text:'Conclusão'},{key:'C',text:'Concessão (Oposição)'},{key:'D',text:'Causa'} ], correta: 'C', explicacao: '"Embora" indica concessão/oposição.' },
          { pergunta: 'O que é "Coesão Textual"?', alternativas: [ {key:'A',text:'O número de páginas'},{key:'B',text:'A ligação lógica entre palavras e frases'},{key:'C',text:'O uso de rimas'},{key:'D',text:'A quantidade de figuras'} ], correta: 'B' , explicacao: 'Coesão é a ligação lógica do texto.'},
          { pergunta: 'Qual o sentido da palavra "conotativo"?', alternativas: [ {key:'A',text:'Dicionário/Literal'},{key:'B',text:'Figurado/Simbólico'},{key:'C',text:'Errado'},{key:'D',text:'Científico'} ], correta: 'B' },
          { pergunta: '"Visto que" indica qual relação lógica?', alternativas: [ {key:'A',text:'Oposição'},{key:'B',text:'Causa/Explicação'},{key:'C',text:'Condição'},{key:'D',text:'Finalidade'} ], correta: 'B' },
          { pergunta: 'O que é ambiguidade?', alternativas: [ {key:'A',text:'Texto claro'},{key:'B',text:'Duplo sentido ou confusão na mensagem'},{key:'C',text:'Texto curto'},{key:'D',text:'Texto sem vírgulas'} ], correta: 'B' },
          { pergunta: 'Qual frase está na norma culta?', alternativas: [ {key:'A',text:'Me empresta o lápis?'},{key:'B',text:'Empreste-me o lápis.'},{key:'C',text:'Vi ele ontem.'},{key:'D',text:'Fazem dez meses.'} ], correta: 'B' },
          { pergunta: 'O que caracteriza o gênero "Resumo Acadêmico"?', alternativas: [ {key:'A',text:'Texto longo'},{key:'B',text:'Síntese objetiva de um trabalho'},{key:'C',text:'Crítica pessoal'},{key:'D',text:'Lista de nomes'} ], correta: 'B' },
          { pergunta: '"Todavia" é sinônimo de:', alternativas: [ {key:'A',text:'Então'},{key:'B',text:'Porém'},{key:'C',text:'Porque'},{key:'D',text:'Portanto'} ], correta: 'B' },
          { pergunta: 'Qual o papel do ponto e vírgula?', alternativas: [ {key:'A',text:'Finalizar texto'},{key:'B',text:'Separar itens em uma lista ou pausas maiores'},{key:'C',text:'Indicar dúvida'},{key:'D',text:'Indicar fala'} ], correta: 'B' },
          { pergunta: 'O que é um argumento de autoridade?', alternativas: [ {key:'A',text:'Um grito'},{key:'B',text:'Citar um especialista para validar a ideia'},{key:'C',text:'Uma mentira'},{key:'D',text:'Uma opinião pessoal'} ], correta: 'B' },
          { pergunta: '"Onde" deve ser usado apenas para:', alternativas: [ {key:'A',text:'Lugares físicos'},{key:'B',text:'Tempo'},{key:'C',text:'Situações'},{key:'D',text:'Pessoas'} ], correta: 'A' },
          { pergunta: 'Significado de "Retórica":', alternativas: [ {key:'A',text:'Estudo dos números'},{key:'B',text:'Arte da persuasão e do bem falar'},{key:'C',text:'Conserto de carros'},{key:'D',text:'Tipo de letra'} ], correta: 'B' },
          { pergunta: 'Diferença de "Mal" e "Mau":', alternativas: [ {key:'A',text:'Mal (oposto de bem), Mau (oposto de bom)'},{key:'B',text:'São iguais'},{key:'C',text:'Mal é animal'},{key:'D',text:'Mau é advérbio sempre'} ], correta: 'A' },
          { pergunta: 'O que é pleonasmo vicioso?', alternativas: [ {key:'A',text:'Rima'},{key:'B',text:'Repetição desnecessária (ex: subir para cima)'},{key:'C',text:'Falta de acento'},{key:'D',text:'Letra maiúscula'} ], correta: 'B' },
          { pergunta: '"A fim de" indica:', alternativas: [ {key:'A',text:'Afinidade'},{key:'B',text:'Finalidade/Objetivo'},{key:'C',text:'Tempo'},{key:'D',text:'Dúvida'} ], correta: 'B' },
          { pergunta: 'Qual a função do sinal de Crase?', alternativas: [ {key:'A',text:'Ênfase'},{key:'B',text:'Fusão da preposição \'a\' com artigo \'a\''},{key:'C',text:'Substituir o ponto'},{key:'D',text:'Indicar pergunta'} ], correta: 'B' },
          { pergunta: 'O que é linguagem denotativa?', alternativas: [ {key:'A',text:'Linguagem literal/real'},{key:'B',text:'Linguagem poética'},{key:'C',text:'Gíria'},{key:'D',text:'Linguagem de sinais'} ], correta: 'A' },
          { pergunta: 'Uso da vírgula antes de "mas":', alternativas: [ {key:'A',text:'Obrigatório (oposição)'},{key:'B',text:'Proibido'},{key:'C',text:'Opcional'},{key:'D',text:'Apenas no fim da frase'} ], correta: 'A' },
          { pergunta: '"Portanto" indica:', alternativas: [ {key:'A',text:'Explicação'},{key:'B',text:'Conclusão'},{key:'C',text:'Dúvida'},{key:'D',text:'Adição'} ], correta: 'B' },
          { pergunta: 'O que é uma dissertação?', alternativas: [ {key:'A',text:'Um poema'},{key:'B',text:'Texto que expõe e defende uma ideia'},{key:'C',text:'Uma lista de compras'},{key:'D',text:'Um diário'} ], correta: 'B' }
        ];
      }
      if (n.includes('TRILHA 2') || n.includes('INGL')) {
        return [
          { pergunta: 'Significado de "Data":', alternativas: [{key:'A',text:'Data (dia)'},{key:'B',text:'Dados/Informações'},{key:'C',text:'Encontro'},{key:'D',text:'Objeto'}], correta: 'B' },
          { pergunta: 'Estratégia "Scanning":', alternativas: [{key:'A',text:'Ler tudo'},{key:'B',text:'Procurar informação específica'},{key:'C',text:'Traduzir'},{key:'D',text:'Ignorar o texto'}], correta: 'B' },
          { pergunta: 'O que é "Hardware"?', alternativas: [{key:'A',text:'Programas'},{key:'B',text:'Parte física do computador'},{key:'C',text:'Internet'},{key:'D',text:'Vírus'}], correta: 'B' },
          { pergunta: 'Significado de "Actually":', alternativas: [{key:'A',text:'Atualmente'},{key:'B',text:'Na verdade/Realmente'},{key:'C',text:'Talvez'},{key:'D',text:'Agora'}], correta: 'B' },
          { pergunta: '"Library" em computação:', alternativas: [{key:'A',text:'Livraria'},{key:'B',text:'Biblioteca de funções/códigos'},{key:'C',text:'Escola'},{key:'D',text:'Arquivo'}], correta: 'B' },
          { pergunta: 'O verbo "Push" significa:', alternativas: [{key:'A',text:'Puxar'},{key:'B',text:'Empurrar/Enviar'},{key:'C',text:'Parar'},{key:'D',text:'Correr'}], correta: 'B' },
          { pergunta: 'O que é "Output"?', alternativas: [{key:'A',text:'Entrada'},{key:'B',text:'Saída de dados'},{key:'C',text:'Processamento'},{key:'D',text:'Desligar'}], correta: 'B' },
          { pergunta: 'Significado de "However":', alternativas: [{key:'A',text:'Além disso'},{key:'B',text:'No entanto'},{key:'C',text:'Por causa'},{key:'D',text:'Onde'}], correta: 'B' },
          { pergunta: '"Keyword" traduz-se como:', alternativas: [{key:'A',text:'Teclado'},{key:'B',text:'Palavra-chave'},{key:'C',text:'Senha'},{key:'D',text:'Cadeado'}], correta: 'B' },
          { pergunta: 'O modal "Should" indica:', alternativas: [{key:'A',text:'Proibição'},{key:'B',text:'Conselho/Sugestão'},{key:'C',text:'Capacidade'},{key:'D',text:'Passado'}], correta: 'B' },
          { pergunta: '"Storage" refere-se a:', alternativas: [{key:'A',text:'Velocidade'},{key:'B',text:'Armazenamento'},{key:'C',text:'Tela'},{key:'D',text:'Som'}], correta: 'B' },
          { pergunta: 'O que é "Software"?', alternativas: [{key:'A',text:'Parte lógica/Programas'},{key:'B',text:'Mouse'},{key:'C',text:'Gabinete'},{key:'D',text:'Energia'}], correta: 'A' },
          { pergunta: '"Abstract" em um artigo é:', alternativas: [{key:'A',text:'Um desenho'},{key:'B',text:'O resumo'},{key:'C',text:'O título'},{key:'D',text:'A conclusão'}], correta: 'B' },
          { pergunta: 'Significado de "Notice":', alternativas: [{key:'A',text:'Notícia'},{key:'B',text:'Notar/Perceber'},{key:'C',text:'Anotar'},{key:'D',text:'Gritar'}], correta: 'B' },
          { pergunta: '"Velocity" é:', alternativas: [{key:'A',text:'Velocidade'},{key:'B',text:'Força'},{key:'C',text:'Tempo'},{key:'D',text:'Massa'}], correta: 'A' },
          { pergunta: '"Engineering" significa:', alternativas: [{key:'A',text:'Inglês'},{key:'B',text:'Engenharia'},{key:'C',text:'Motor'},{key:'D',text:'Mecânico'}], correta: 'B' },
          { pergunta: '"Available" traduz-se como:', alternativas: [{key:'A',text:'Avaliado'},{key:'B',text:'Disponível'},{key:'C',text:'Caro'},{key:'D',text:'Baixo'}], correta: 'B' },
          { pergunta: 'O que significa "Input"?', alternativas: [{key:'A',text:'Entrada de dados'},{key:'B',text:'Saída'},{key:'C',text:'Erro'},{key:'D',text:'Impressora'}], correta: 'A' },
          { pergunta: '"Although" indica:', alternativas: [{key:'A',text:'Adição'},{key:'B',text:'Embora/Contraste'},{key:'C',text:'Causa'},{key:'D',text:'Lugar'}], correta: 'B' },
          { pergunta: '"Research" significa:', alternativas: [{key:'A',text:'Responder'},{key:'B',text:'Pesquisa'},{key:'C',text:'Receber'},{key:'D',text:'Repetir'}], correta: 'B' }
        ];
      }
      if (n.includes('TRILHA 3') || n.includes('MATEM')) {
        return [
          { pergunta: 'Valor de X em $3x = 12$:', alternativas: [{key:'A',text:'3'},{key:'B',text:'4'},{key:'C',text:'36'},{key:'D',text:'9'}], correta: 'B' },
          { pergunta: 'Área de um quadrado de lado 5m:', alternativas: [{key:'A',text:'10m²'},{key:'B',text:'25m²'},{key:'C',text:'20m²'},{key:'D',text:'5m²'}], correta: 'B' },
          { pergunta: 'O que é o Teorema de Pitágoras?', alternativas: [{key:'A',text:'a^2 = b^2 + c^2'},{key:'B',text:'V = d/t'},{key:'C',text:'F = m \u00b7 a'},{key:'D',text:'E = mc^2'}], correta: 'A' },
          { pergunta: 'Resultado de (-4) × (-3):', alternativas: [{key:'A',text:'-12'},{key:'B',text:'+12'},{key:'C',text:'-7'},{key:'D',text:'+7'}], correta: 'B' },
          { pergunta: 'O que é uma função de 1º grau?', alternativas: [{key:'A',text:'Uma reta'},{key:'B',text:'Uma parábola'},{key:'C',text:'Um círculo'},{key:'D',text:'Um ponto'}], correta: 'A' },
          { pergunta: 'Qual o valor de 5^0?:', alternativas: [{key:'A',text:'0'},{key:'B',text:'1'},{key:'C',text:'5'},{key:'D',text:'50'}], correta: 'B' },
          { pergunta: '10% de 500 é:', alternativas: [{key:'A',text:'5'},{key:'B',text:'50'},{key:'C',text:'100'},{key:'D',text:'10'}], correta: 'B' },
          { pergunta: 'O que é o "Delta" na fórmula de Bhaskara?', alternativas: [{key:'A',text:'b^2 - 4ac'},{key:'B',text:'2a'},{key:'C',text:'-b'},{key:'D',text:'x+y'}], correta: 'A' },
          { pergunta: 'Raiz quadrada de 144:', alternativas: [{key:'A',text:'10'},{key:'B',text:'12'},{key:'C',text:'14'},{key:'D',text:'44'}], correta: 'B' },
          { pergunta: 'Média aritmética de 6, 8 e 10:', alternativas: [{key:'A',text:'8'},{key:'B',text:'7'},{key:'C',text:'24'},{key:'D',text:'9'}], correta: 'A' },
          { pergunta: 'O que é um ângulo reto?', alternativas: [{key:'A',text:'45º'},{key:'B',text:'90º'},{key:'C',text:'180º'},{key:'D',text:'0º'}], correta: 'B' },
          { pergunta: 'Valor de X em x/2 = 10:', alternativas: [{key:'A',text:'5'},{key:'B',text:'20'},{key:'C',text:'12'},{key:'D',text:'2'}], correta: 'B' },
          { pergunta: 'Soma dos ângulos internos de um triângulo:', alternativas: [{key:'A',text:'90º'},{key:'B',text:'180º'},{key:'C',text:'360º'},{key:'D',text:'100º'}], correta: 'B' },
          { pergunta: 'O que é o raio de um círculo?', alternativas: [{key:'A',text:'Metade do diâmetro'},{key:'B',text:'O dobro do diâmetro'},{key:'C',text:'O perímetro'},{key:'D',text:'O centro'}], correta: 'A' },
          { pergunta: 'Resultado de 10 - 2 × 3:', alternativas: [{key:'A',text:'24'},{key:'B',text:'4'},{key:'C',text:'8'},{key:'D',text:'6'}], correta: 'B' },
          { pergunta: 'O que é um número primo?', alternativas: [{key:'A',text:'Divisível apenas por 1 e por ele mesmo'},{key:'B',text:'Número par'},{key:'C',text:'Número negativo'},{key:'D',text:'Número com vírgula'}], correta: 'A' },
          { pergunta: 'Perímetro de um retângulo 3 × 4:', alternativas: [{key:'A',text:'7'},{key:'B',text:'12'},{key:'C',text:'14'},{key:'D',text:'10'}], correta: 'C' },
          { pergunta: 'O que é o coeficiente angular?', alternativas: [{key:'A',text:'A inclinação da reta'},{key:'B',text:'Onde corta o eixo Y'},{key:'C',text:'O zero da função'},{key:'D',text:'O tamanho da linha'}], correta: 'A' },
          { pergunta: 'Quanto é 2^3?:', alternativas: [{key:'A',text:'6'},{key:'B',text:'8'},{key:'C',text:'16'},{key:'D',text:'5'}], correta: 'B' },
          { pergunta: 'O que é hipotenusa?', alternativas: [{key:'A',text:'O maior lado do triângulo retângulo'},{key:'B',text:'O lado menor'},{key:'C',text:'O ângulo'},{key:'D',text:'A altura'}], correta: 'A' }
        ];
      }
      if (n.includes('TRILHA 4') || n.includes('FÍS') || n.includes('FIS')) {
        return [
          { pergunta: 'Unidade de Força (SI):', alternativas: [{key:'A',text:'Joule'},{key:'B',text:'Newton'},{key:'C',text:'Watt'},{key:'D',text:'Metro'}], correta: 'B' },
          { pergunta: '1ª Lei de Newton:', alternativas: [{key:'A',text:'Ação'},{key:'B',text:'Inércia'},{key:'C',text:'Gravidade'},{key:'D',text:'Atrito'}], correta: 'B' },
          { pergunta: 'Velocidade média de 200km em 2h:', alternativas: [{key:'A',text:'400 km/h'},{key:'B',text:'100 km/h'},{key:'C',text:'50 km/h'},{key:'D',text:'150 km/h'}], correta: 'B' },
          { pergunta: 'O que é aceleração?', alternativas: [{key:'A',text:'Mudança da velocidade no tempo'},{key:'B',text:'Distância percorrida'},{key:'C',text:'Peso'},{key:'D',text:'Parada'}], correta: 'A' },
          { pergunta: 'Unidade de Massa (SI):', alternativas: [{key:'A',text:'Grama'},{key:'B',text:'Quilograma'},{key:'C',text:'Newton'},{key:'D',text:'Litro'}], correta: 'B' },
          { pergunta: '3ª Lei de Newton:', alternativas: [{key:'A',text:'Inércia'},{key:'B',text:'Ação e Reação'},{key:'C',text:'Queda livre'},{key:'D',text:'Energia'}], correta: 'B' },
          { pergunta: 'Aceleração da gravidade na Terra (aprox):', alternativas: [{key:'A',text:'5 m/s²'},{key:'B',text:'10 m/s²'},{key:'C',text:'100 m/s²'},{key:'D',text:'0 m/s²'}], correta: 'B' },
          { pergunta: 'Grandeza escalar:', alternativas: [{key:'A',text:'Massa (apenas valor)'},{key:'B',text:'Força'},{key:'C',text:'Velocidade'},{key:'D',text:'Aceleração'}], correta: 'A' },
          { pergunta: 'Unidade de Energia:', alternativas: [{key:'A',text:'Joule'},{key:'B',text:'Newton'},{key:'C',text:'Watt'},{key:'D',text:'Segundo'}], correta: 'A' },
          { pergunta: 'O que é o Vácuo?', alternativas: [{key:'A',text:'Espaço sem matéria'},{key:'B',text:'Ar gelado'},{key:'C',text:'Espaço com muita pressão'},{key:'D',text:'Um tipo de gás'}], correta: 'A' },
          { pergunta: 'Fórmula da Força (F):', alternativas: [{key:'A',text:'m \u00b7 a'},{key:'B',text:'m/a'},{key:'C',text:'d/t'},{key:'D',text:'p \u00b7 v'}], correta: 'A' },
          { pergunta: 'O que é trajetória?', alternativas: [{key:'A',text:'O caminho percorrido'},{key:'B',text:'A velocidade'},{key:'C',text:'O ponto final'},{key:'D',text:'O tempo'}], correta: 'A' },
          { pergunta: 'O que é atrito?', alternativas: [{key:'A',text:'Uma força que ajuda o movimento'},{key:'B',text:'Força oposta ao movimento'},{key:'C',text:'Energia solar'},{key:'D',text:'Peso'}], correta: 'B' },
          { pergunta: 'O que é calor?', alternativas: [{key:'A',text:'Energia térmica em trânsito'},{key:'B',text:'Temperatura alta'},{key:'C',text:'Fogo'},{key:'D',text:'Sol'}], correta: 'A' },
          { pergunta: 'Unidade de Tempo (SI):', alternativas: [{key:'A',text:'Hora'},{key:'B',text:'Minuto'},{key:'C',text:'Segundo'},{key:'D',text:'Dia'}], correta: 'C' },
          { pergunta: 'O que é repouso?', alternativas: [{key:'A',text:'Posição não muda em relação ao referencial'},{key:'B',text:'Estar dormindo'},{key:'C',text:'Velocidade máxima'},{key:'D',text:'Queda'}], correta: 'A' },
          { pergunta: 'O que é um vetor?', alternativas: [{key:'A',text:'Segmento com módulo, direção e sentido'},{key:'B',text:'Apenas um número'},{key:'C',text:'Uma linha curva'},{key:'D',text:'O tempo'}], correta: 'A' },
          { pergunta: 'Trabalho (W) em física é:', alternativas: [{key:'A',text:'Força \u00d7 Deslocamento'},{key:'B',text:'Salário'},{key:'C',text:'Massa \u00d7 Velocidade'},{key:'D',text:'Calor'}], correta: 'A' },
          { pergunta: 'O que é potência?', alternativas: [{key:'A',text:'Rapidez com que o trabalho é realizado'},{key:'B',text:'Força bruta'},{key:'C',text:'Tamanho do motor'},{key:'D',text:'Eletricidade'}], correta: 'A' },
          { pergunta: 'Densidade é:', alternativas: [{key:'A',text:'Massa / Volume'},{key:'B',text:'Peso \u00d7 Altura'},{key:'C',text:'Velocidade / Tempo'},{key:'D',text:'Força / Área'}], correta: 'A' }
        ];
      }
      return null;
    };

    if (!mat) {
      setQuestions([]);
      setQIndex(0);
      return;
    }
    // use curated trilha questions when applicable
    const custom = getCustomQuestionsForTrilha(mat);
    if (custom && custom.length > 0) {
      // ensure we return exactly QUESTIONS_PER_ROUND by slicing or repeating
      const pool = [...custom];
      while (pool.length < QUESTIONS_PER_ROUND) pool.push(...custom);
      const chosen = pool.slice(0, QUESTIONS_PER_ROUND).map((q, idx) => ({ ...q, conteudoId: q.conteudoId ?? -1 }));
      setQuestions(chosen);
      setQIndex(0);
      return;
    }
    const items = conteudos.filter(c => c.materia === mat);

    const pool = [...items];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    let chosenSet = pool.slice(0, Math.min(QUESTIONS_PER_ROUND, pool.length));
    // If there are fewer than QUESTIONS_PER_ROUND distinct conteúdos, allow sampling with replacement
    if (chosenSet.length < QUESTIONS_PER_ROUND) {
      const extra: any[] = [];
      while (chosenSet.length + extra.length < QUESTIONS_PER_ROUND) {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (pick) extra.push(pick);
        // safety: break if pool empty
        if (pool.length === 0) break;
      }
      chosenSet = chosenSet.concat(extra).slice(0, QUESTIONS_PER_ROUND);
    }

    const buildQuestion = (chosen: any) => {
      let candidates = conteudos
        .filter((c: any) => c.id !== chosen.id && c.explicacao && String(c.explicacao).trim().length > 0)
        .map((c: any) => String(c.explicacao).trim());
      if (candidates.length < 3) {
        candidates = conteudos
          .filter((c: any) => c.id !== chosen.id)
          .map((c: any) => (c.explicacao && String(c.explicacao).trim().length > 0) ? String(c.explicacao).trim() : String(c.titulo).trim());
      }
      candidates = Array.from(new Set(candidates));
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }

      const correctText = (chosen.explicacao && String(chosen.explicacao).trim()) || String(chosen.titulo).trim();
      const opts: string[] = [correctText];
      for (const cand of candidates) {
        if (opts.length >= 4) break;
        if (cand === correctText) continue;
        opts.push(cand);
      }
      if (opts.length < 4) {
        for (const c of conteudos) {
          const t = String(c.titulo).trim();
          if (opts.length >= 4) break;
          if (t === correctText) continue;
          if (!opts.includes(t)) opts.push(t);
        }
      }
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      const letters = ['A', 'B', 'C', 'D'];
      const alternativas = opts.map((t, idx) => ({ key: letters[idx] || `X${idx}`, text: t }));
      const correta = alternativas.find((a: any) => a.text === correctText)?.key || 'A';
      return { pergunta: `Qual é a descrição correta para: "${chosen.titulo}"?`, alternativas, correta, conteudoId: chosen.id, explicacao: correctText };
    };

    const qs = chosenSet.map((c: any) => buildQuestion(c));
    setQuestions(qs);
    // try to persist generated questions to backend (best-effort). Requires admin token on server.
    const persistQuestion = async (q: any) => {
      try {
        const token = String(localStorage.getItem('token') || '').replace(/^Bearer\s+/i, '').trim();
        if (!token) return; // won't attempt without token
        const [a, b, c, d] = q.alternativas;
        const body = {
          conteudo_id: q.conteudoId,
          pergunta: q.pergunta,
          op_a: a?.text || '',
          op_b: b?.text || '',
          op_c: c?.text || '',
          op_d: d?.text || '',
          correta: q.correta
        };
        const res = await fetch(`${API_BASE}/api/quizzes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body)
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          console.debug('persistQuestion failed', res.status, j);
        }
      } catch (err) {
        console.debug('persistQuestion error', err);
      }
    };
    qs.forEach(q => void persistQuestion(q));
    setQIndex(0);
  }, [conteudos]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/conteudos`);
        if (!r.ok) return;
        const list = await r.json();
        // Some environments (PowerShell tests) return { value: [...] } — normalize
        const dataList = Array.isArray(list) ? list : (Array.isArray(list?.value) ? list.value : []);
        setConteudos(dataList || []);
        // group by materia and pick first conteudo id per materia
        const map = new Map<string, number>();
        for (const c of dataList) {
          if (!c || !c.materia) continue;
          if (!map.has(c.materia)) map.set(c.materia, c.id);
        }
        const arr = Array.from(map.entries()).map(([materia, id]) => ({ materia, conteudoId: id }));
        setMaterias(arr);
        const distinct = Array.from(new Set((dataList || []).map((c: any) => c.materia))).filter(Boolean);
        setDistinctMaterias(distinct);
        if (arr.length > 0) setSelected(arr[0].materia);
      } catch (e) {
        console.error('Erro ao buscar conteúdos:', e);
      }
    })();
    // try to load current user XP if logged in
    (async () => {
      try {
        const token = String(localStorage.getItem('token') || '').replace(/^Bearer\s+/i, '').trim();
        if (!token) return;
        const r = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) return;
        const j = await r.json();
        setXp(typeof j.xp === 'number' ? j.xp : null);
        setNivel(typeof j.nivel === 'number' ? j.nivel : null);
      } catch (e) {
        console.error('Erro ao carregar usuário autenticado:', e);
      }
    })();
  }, []);

  useEffect(() => {
    // build a round when selection or conteudos change
    generateRound(selected);
    // cleanup timer when selection changes
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [selected, conteudos]);

  const onAcerto = async (conteudoId?: number) => {
    try {
      const token = String(localStorage.getItem('token') || '').replace(/^Bearer\s+/i, '').trim();
      if (!conteudoId) return;
      const res = await fetch(`${API_BASE}/api/progresso/${conteudoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const j = await res.json().catch(() => ({}));
        if (typeof j.xp === 'number') setXp(j.xp);
        if (typeof j.nivel === 'number') setNivel(j.nivel);
      }
    } catch (e) {
      console.error('Erro ao reportar progresso:', e);
    }
  };

  const handleAnswered = (correct: boolean) => {
    // when answered, show explanation (component already does) and auto-advance
    const current = questions[qIndex];
    // if correct, report progresso
    if (correct && current && current.conteudoId) {
      onAcerto(current.conteudoId);
    }
    // schedule next question
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      if (qIndex + 1 < questions.length) {
        setQIndex(i => i + 1);
      } else {
        // round finished: regenerate a new round for the same matéria
        generateRound(selected);
      }
    }, 1400);
  };
  // safe current question accessor to avoid runtime errors when qIndex is out of range
  const currentQuestion = (questions && questions.length > 0 && qIndex >= 0 && qIndex < questions.length)
    ? questions[qIndex]
    : (questions && questions.length > 0 ? questions[0] : null);

  return (
    <div className="container-page py-8">
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Quiz Demo — escolha uma matéria</h2>
        <div className="flex gap-2 flex-wrap mb-4">
          {materias.length === 0 && <div>Carregando matérias…</div>}
          {materias.map(m => (
            <button
              key={m.materia}
              className={`px-3 py-1 rounded ${selected === m.materia ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setSelected(m.materia)}
            >
              {m.materia}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-3">
          {selected && <div className="text-sm text-gray-600">Matéria selecionada: <strong>{selected}</strong></div>}
          <div className="text-sm text-gray-600">XP: <strong>{xp ?? '—'}</strong> {nivel ? <>| Nível <strong>{nivel}</strong></> : null}</div>
        </div>

        {currentQuestion ? (
          <>
            <div className="mb-2 font-medium">Pergunta {Math.min(qIndex + 1, questions.length)} de {questions.length || QUESTIONS_PER_ROUND}</div>
            <QuizInterativo
              pergunta={currentQuestion.pergunta}
              alternativas={currentQuestion.alternativas}
              correta={currentQuestion.correta}
              explicacao={currentQuestion.explicacao}
              onAcerto={() => onAcerto(currentQuestion.conteudoId)}
              onAnswered={(correct: boolean) => handleAnswered(correct)}
            />
          </>
        ) : (
          <div className="text-sm text-gray-600">Nenhum quiz disponível para a matéria selecionada.</div>
        )}

        <div className="mt-4 text-sm text-gray-600">Ao acertar, XP é somado via PUT `/api/progresso/:conteudoId`.</div>
      </div>
    </div>
  );
};

export default QuizDemo;
