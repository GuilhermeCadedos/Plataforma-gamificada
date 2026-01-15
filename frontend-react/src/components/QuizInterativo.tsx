import React, { useState, useEffect } from 'react';

type Props = {
  pergunta: string;
  alternativas: { key: 'A'|'B'|'C'|'D'; text: string }[];
  correta: 'A'|'B'|'C'|'D';
  explicacao?: string;
  onAcerto?: () => void;
  onAnswered?: (correct: boolean) => void;
};

const QuizInterativo: React.FC<Props> = ({ pergunta, alternativas, correta, onAcerto, explicacao, onAnswered }) => {
  const [sel, setSel] = useState<'A'|'B'|'C'|'D' | null>(null);
  const [status, setStatus] = useState<'idle'|'ok'|'fail'>('idle');

  // Reset internal selection/status whenever the question text changes
  useEffect(() => {
    setSel(null);
    setStatus('idle');
  }, [pergunta]);

  const verificar = () => {
    if (!sel) return;
    const correct = sel === correta;
    if (correct) {
      setStatus('ok');
      onAcerto && onAcerto();
      try { import('canvas-confetti').then(mod => mod.default()); } catch {}
    } else {
      setStatus('fail');
    }
    // notify parent
    onAnswered && onAnswered(correct);
  };


  return (
    <div className="card p-6">
      <div className="text-xl md:text-2xl font-bold mb-3 text-black bg-white p-3 rounded-md shadow-sm border border-gray-200">
        {pergunta}
      </div>
      <div className="grid grid-cols-1 gap-3 mb-4">
        {alternativas.map(a => {
          // compute classes depending on selection and status
          let cls = 'px-4 py-3 text-left rounded border transition-colors duration-150 focus:outline-none';
          if (status === 'idle') {
            if (sel === a.key) cls += ' bg-blue-600 text-white border-blue-700';
            else cls += ' bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700';
          } else {
            // reveal correct/incorrect after answer
            if (a.key === correta) {
              cls += ' bg-green-50 text-green-900 border-green-500';
            } else if (status === 'fail' && sel === a.key) {
              cls += ' bg-red-50 text-red-900 border-red-500';
            } else {
              cls += ' bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 opacity-90';
            }
          }
          return (
            <button
              key={a.key}
              className={cls}
              onClick={() => { if (status === 'idle') setSel(a.key); }}
              disabled={status !== 'idle'}
            >
              <div className="font-medium">{a.key}.</div>
              <div className="mt-1 text-sm">{a.text}</div>
            </button>
          );
        })}
      </div>
      <button className={`btn w-full ${status==='ok' ? 'bg-green-600 text-white' : status==='fail' ? 'bg-red-600 text-white' : 'btn-primary'}`} onClick={verificar}>
        Verificar Resposta
      </button>
      {status !== 'idle' && explicacao && (
        <div className={`mt-4 p-4 rounded shadow-sm border-l-4 ${status==='ok' ? 'bg-green-100 text-green-900 border-green-600' : 'bg-red-100 text-red-900 border-red-600'}`}>
          <div className="mb-2 font-semibold">Explicação</div>
          <div className="text-base leading-relaxed">{explicacao}</div>
        </div>
      )}
    </div>
  );
};

export default QuizInterativo;
