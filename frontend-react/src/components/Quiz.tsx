import React, { useEffect, useRef, useState } from 'react';

type QuizProps = {
  questions: { question: string; options: string[]; answer: number }[];
  onComplete: () => void;
};

const Quiz = ({ questions, onComplete }: QuizProps) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState<boolean | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const handleOption = (idx: number) => setSelected(idx);

  const handleNext = () => {
    if (selected === questions[current].answer) setScore(score + 1);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      const total = questions.length;
      const nextScore = selected === questions[current].answer ? score + 1 : score;
      const threshold = Math.ceil(total * 0.7); // 70% para passar
      setPassed(nextScore >= threshold);
      setFinished(true);
      // Dar tempo para a animação aparecer antes de esconder o Quiz
      setTimeout(() => onComplete(), 1200);
    }
  };

  useEffect(() => {
    if (finished && resultRef.current) {
      resultRef.current.focus();
    }
  }, [finished]);

  if (finished)
    return (
      <div className={`relative p-4 rounded shadow border ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} ${passed ? 'anim-pop-in' : 'anim-shake'}`} role="alert" aria-live="polite">
        <h3 className="font-bold text-lg mb-2" ref={resultRef} tabIndex={-1}>
          {passed ? 'Você passou! 🎉' : 'Você não atingiu a pontuação mínima'}
        </h3>
        <p>
          Você acertou {score} de {questions.length} perguntas.
          {passed ? ' Excelente desempenho!' : ' Continue praticando e tente novamente.'}
        </p>

        {passed && (
          <div aria-hidden="true">
            <span className="confetti-piece" style={{ left: '15%', bottom: '0', animationDelay: '0ms' }}>🎉</span>
            <span className="confetti-piece" style={{ left: '35%', bottom: '0', animationDelay: '100ms' }}>🎊</span>
            <span className="confetti-piece" style={{ left: '55%', bottom: '0', animationDelay: '200ms' }}>✨</span>
            <span className="confetti-piece" style={{ left: '75%', bottom: '0', animationDelay: '300ms' }}>🎉</span>
          </div>
        )}
      </div>
    );

  return (
    <div className="relative p-4 bg-white rounded shadow" aria-label="Quiz" role="group">
      <h3 className="font-bold mb-2">{questions[current].question}</h3>
      <ul className="mb-2" role="list">
        {questions[current].options.map((opt, idx) => (
          <li key={idx}>
            <button
              className={`w-full text-left p-2 rounded mb-1 border ${selected === idx ? 'bg-blue-200' : 'bg-gray-100'}`}
              onClick={() => handleOption(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOption(idx);
                }
              }}
              aria-pressed={selected === idx}
              aria-label={`Opção ${idx + 1}: ${opt}`}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
      <button
        className="bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleNext}
        disabled={selected === null}
        aria-disabled={selected === null}
        aria-label={current + 1 === questions.length ? 'Finalizar quiz' : 'Próxima pergunta'}
      >
        {current + 1 === questions.length ? 'Finalizar' : 'Próxima'}
      </button>
    </div>
  );
};

export default Quiz;
