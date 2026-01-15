import React, { useEffect, useState } from 'react';

// Usar mesma origem do app; Vite proxy encaminha /api para o backend
const API_BASE = '';

const ApiHealth: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'ok' | 'error' | 'loading'>('idle');
  const [detail, setDetail] = useState<string>('');

  const check = async () => {
    try {
      setStatus('loading');
      setDetail('');
      const res = await fetch(`${API_BASE}/api/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const tutor = data?.hasGemini ? 'ativo' : 'indisponível';
      const model = data?.model || 'desconhecido';
      setStatus('ok');
      setDetail(`API OK — Tutor: ${tutor} — Modelo: ${model}`);
    } catch (e: any) {
      setStatus('error');
      setDetail(e?.message || 'Erro ao conectar');
    }
  };

  useEffect(() => { check(); }, []);

  return (
    <div className="mb-4 p-3 rounded border flex items-center gap-3" role="status" aria-live="polite" aria-label="Verificação da API e do Tutor">
      <span className={
        status === 'ok' ? 'text-green-700' : status === 'error' ? 'text-red-700' : 'text-gray-700'
      }>
        {status === 'loading' && 'Verificando API...'}
        {status === 'ok' && 'API conectada'}
        {status === 'error' && 'API indisponível'}
        {status === 'idle' && 'Aguardando...'}
      </span>
      <span className="text-sm text-gray-600" aria-label="Detalhes da verificação">{detail}</span>
      <button
        className="ml-auto bg-blue-700 text-white px-3 py-1 rounded"
        onClick={check}
        aria-label="Reverificar API"
      >Tentar novamente</button>
    </div>
  );
};

export default ApiHealth;
