import React, { useState } from 'react';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface LessonForm {
  title: string;
  videoUrl: string;
  explanation: string;
  quiz: QuizQuestion[];
}

const defaultQuestion = { question: '', options: ['', '', '', ''], answer: 0 };

const AdminPanel: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [form, setForm] = useState<LessonForm>({
    title: '',
    videoUrl: '',
    explanation: '',
    quiz: [ { ...defaultQuestion } ],
  });

  if (userRole !== 'admin') {
    return <div className="text-red-700 font-bold" role="alert">Acesso restrito. Apenas administradores.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuizChange = (idx: number, field: string, value: string | number) => {
    const quiz = [...form.quiz];
    if (field === 'question') quiz[idx].question = value as string;
    else if (field === 'answer') quiz[idx].answer = Number(value);
    else quiz[idx].options[Number(field)] = value as string;
    setForm({ ...form, quiz });
  };

  const addQuestion = () => setForm({ ...form, quiz: [...form.quiz, { ...defaultQuestion }] });
  const removeQuestion = (idx: number) => setForm({ ...form, quiz: form.quiz.filter((_, i) => i !== idx) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || '';
    if (!token) {
      alert('Informe um token JWT válido na página de Admin.');
      return;
    }
    try {
      // 1) Criar conteúdo
      const res = await fetch('http://localhost:3001/api/conteudos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          materia: 'Geral',
          titulo: form.title,
          tipo: 'video',
          url: form.videoUrl,
          explicacao: form.explanation,
          ordem: null,
        }),
      });
      if (!res.ok) throw new Error(`Erro ao criar conteúdo: ${res.status}`);
      const created = await res.json();
      const conteudoId = created.id;

      // 2) Criar quizzes para o conteúdo
      for (const q of form.quiz) {
        const letras = ['A','B','C','D'];
        const correta = letras[q.answer] || 'A';
        const qRes = await fetch('http://localhost:3001/api/quizzes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            conteudo_id: conteudoId,
            pergunta: q.question,
            op_a: q.options[0],
            op_b: q.options[1],
            op_c: q.options[2],
            op_d: q.options[3],
            correta,
          }),
        });
        if (!qRes.ok) throw new Error(`Erro ao criar quiz: ${qRes.status}`);
      }

      alert('Aula e quiz cadastrados com sucesso!');
      setForm({ title: '', videoUrl: '', explanation: '', quiz: [ { ...defaultQuestion } ] });
    } catch (err: any) {
      alert(err?.message || 'Falha ao cadastrar aula/quiz');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Cadastrar Nova Aula</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold" htmlFor="title">Título da Aula</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-2 py-1" required aria-required="true" aria-label="Título da aula" />
        </div>
        <div>
          <label className="block font-semibold" htmlFor="videoUrl">Link do Vídeo</label>
          <input id="videoUrl" name="videoUrl" value={form.videoUrl} onChange={handleChange} className="w-full border rounded px-2 py-1" required aria-required="true" aria-label="Link do vídeo" />
        </div>
        <div>
          <label className="block font-semibold" htmlFor="explanation">Explicação</label>
          <textarea id="explanation" name="explanation" value={form.explanation} onChange={handleChange} className="w-full border rounded px-2 py-1" rows={3} required aria-required="true" aria-label="Explicação do conteúdo" />
        </div>
        <div>
          <label className="block font-semibold mb-2">Perguntas do Quiz</label>
          {form.quiz.map((q, idx) => (
            <div key={idx} className="mb-4 p-3 border rounded bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Pergunta {idx + 1}</span>
                {form.quiz.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(idx)} className="text-red-700" aria-label={`Remover pergunta ${idx + 1}`}>Remover</button>
                )}
              </div>
              <input
                placeholder="Pergunta"
                value={q.question}
                onChange={e => handleQuizChange(idx, 'question', e.target.value)}
                className="w-full border rounded px-2 py-1 mb-2"
                required aria-required="true" aria-label={`Texto da pergunta ${idx + 1}`}
              />
              <div className="grid grid-cols-2 gap-2 mb-2">
                {q.options.map((opt, oidx) => (
                  <input
                    key={oidx}
                    placeholder={`Opção ${oidx + 1}`}
                    value={opt}
                    onChange={e => handleQuizChange(idx, String(oidx), e.target.value)}
                    className="border rounded px-2 py-1"
                    required aria-required="true" aria-label={`Opção ${oidx + 1} da pergunta ${idx + 1}`}
                  />
                ))}
              </div>
              <div>
                <label className="block" htmlFor={`answer-${idx}`}>Resposta Correta</label>
                <select
                  id={`answer-${idx}`}
                  value={q.answer}
                  onChange={e => handleQuizChange(idx, 'answer', e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {q.options.map((_, oidx) => (
                    <option key={oidx} value={oidx}>{`Opção ${oidx + 1}`}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="bg-blue-700 text-white px-3 py-1 rounded" aria-label="Adicionar nova pergunta">Adicionar Pergunta</button>
        </div>
        <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded font-bold" aria-label="Cadastrar aula">Cadastrar Aula</button>
      </form>
    </div>
  );
};

export default AdminPanel;
