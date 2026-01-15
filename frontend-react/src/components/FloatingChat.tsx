import React, { useState, useRef, useEffect } from "react";

// Usar mesma origem do app (Vite proxy envia /api para o backend)
const API_BASE = "";

const FloatingChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "tutor", text: "Olá! Sou o Tutor Gêmeos. Como posso ajudar?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [checkingTutor, setCheckingTutor] = useState(false);
  const [tutorOk, setTutorOk] = useState<boolean | null>(null);
  const [tutorModel, setTutorModel] = useState<string>("");
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [lastStatus, setLastStatus] = useState<string>("");

  useEffect(() => {
    if (open && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, open]);

  const cleanText = (t: string) => {
    let s = String(t || "");
    s = s.replace(/^#+\s*/gm, "");
    s = s.replace(/^\s*[-*•]\s+/gm, "");
    s = s.replace(/\*{1,3}/g, "");
    s = s.replace(/_{1,3}/g, "");
    s = s.replace(/`{1,3}[^`]*`{1,3}/g, "");
    s = s.replace(/^\s*---+\s*$/gm, "");
    s = s.replace(/^>\s+/gm, "");
    s = s.replace(/[ \t]{2,}/g, " ");
    s = s.replace(/\n{3,}/g, "\n\n");
    s = s.trim();
    const maxChars = 800;
    if (s.length > maxChars) s = s.slice(0, maxChars).trim() + "…";
    return s;
  };

  const checkTutorStatus = async () => {
    try {
      setCheckingTutor(true);
      const res = await fetch(`${API_BASE}/api/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTutorOk(!!data?.hasGemini);
      setTutorModel(typeof data?.model === "string" ? data.model : "");
    } catch (_) {
      setTutorOk(false);
    } finally {
      setCheckingTutor(false);
    }
  };

  useEffect(() => {
    checkTutorStatus();
  }, []);

  const testTutorGeneration = async () => {
    try {
      const started = performance.now();
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`/api/tutor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pergunta: "Teste do tutor: diga Olá de forma breve.",
        }),
      });
      const elapsed = performance.now() - started;
      setLastLatencyMs(Math.round(elapsed));
      if (!res.ok) {
        setLastStatus(`HTTP ${res.status}`);
        setMessages((prev) => [
          ...prev,
          { from: "tutor", text: `Teste: falha (HTTP ${res.status}).` },
        ]);
      } else {
        const data = await res.json();
        const answer =
          typeof data?.answer === "string"
            ? data.answer
            : "Sem resposta do tutor.";
        const details = data?.context?.error
          ? ` (detalhe: ${String(data.context.error).slice(0, 120)})`
          : "";
        setLastStatus("OK");
        setMessages((prev) => [
          ...prev,
          { from: "tutor", text: `Teste: ${answer}${details}` },
        ]);
      }
    } catch (e: any) {
      setLastStatus(e?.message || "Erro de rede");
      setMessages((prev) => [
        ...prev,
        { from: "tutor", text: `Teste: ${e?.message || "Falha de conexão."}` },
      ]);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const token = localStorage.getItem("token") || "";

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/tutor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ pergunta: text }),
      });
      if (!res.ok) {
        const msg = `Erro ${res.status}: não foi possível obter resposta.`;
        setMessages((prev) => [...prev, { from: "tutor", text: msg }]);
      } else {
        const data = await res.json();
        const answer =
          typeof data?.answer === "string"
            ? data.answer
            : "Sem resposta do tutor.";
        setMessages((prev) => [
          ...prev,
          { from: "tutor", text: cleanText(answer) },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { from: "tutor", text: e?.message || "Falha de conexão com a API." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div
          className="w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Janela de chat com Tutor Gemini"
        >
          <div className="bg-bridgeBlue-700 text-white p-3 rounded-t-xl flex justify-between items-center">
            <span id="chat-title" className="flex items-center gap-2">
              Tutor Gemini
              <span
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                  tutorOk ? "bg-green-600" : "bg-red-600"
                }`}
                aria-label={`Status do tutor: ${
                  tutorOk ? "online" : "offline"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white inline-block" />
                {tutorOk ? "online" : "offline"}
              </span>
              {tutorModel && (
                <span
                  className="text-xs bg-white/10 px-2 py-0.5 rounded"
                  aria-label={`Modelo do tutor: ${tutorModel}`}
                >
                  {tutorModel}
                </span>
              )}
              {lastLatencyMs !== null && (
                <span
                  className="text-xs bg-white/10 px-2 py-0.5 rounded"
                  aria-label={`Latência do último teste: ${lastLatencyMs}ms`}
                >
                  {lastLatencyMs}ms {lastStatus && `• ${lastStatus}`}
                </span>
              )}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-white"
              aria-label="Fechar chat"
            >
              ✕
            </button>
          </div>
          <div
            ref={chatRef}
            className="p-3 h-[28rem] max-h-[75vh] overflow-y-auto overscroll-contain flex-1"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-labelledby="chat-title"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 flex ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-sm whitespace-pre-wrap ${
                    msg.from === "user"
                      ? "bg-bridgeTeal-500/20 text-gray-900"
                      : "bg-gray-200 dark:bg-gray-800 dark:text-gray-100"
                  }`}
                  aria-label={`${msg.from === "user" ? "Você" : "Tutor"} diz: ${
                    msg.text
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex">
            <input
              className="flex-1 border rounded-l px-2 py-1 focus:outline-none bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              aria-label="Digite sua mensagem"
              placeholder="Digite sua mensagem..."
            />
            <button
              className="bg-bridgeBlue-700 text-white px-4 py-1 rounded-r disabled:opacity-60"
              onClick={sendMessage}
              disabled={sending}
              aria-label="Enviar mensagem"
            >
              {sending ? "Enviando..." : "Enviar"}
            </button>
            <button
              className="ml-2 bg-bridgeTeal-600 text-white px-3 py-1 rounded disabled:opacity-60"
              onClick={checkTutorStatus}
              disabled={checkingTutor}
              aria-label="Testar Tutor"
            >
              {checkingTutor ? "Testando..." : "Testar Tutor"}
            </button>
            <button
              className="ml-2 bg-bridgeGold-600 text-gray-900 px-3 py-1 rounded"
              onClick={testTutorGeneration}
              aria-label="Teste Completo do Tutor"
            >
              Teste Completo
            </button>
          </div>
        </div>
      ) : (
        <button
          className="bg-bridgeGold-500 text-gray-900 rounded-full w-16 h-16 shadow-xl flex items-center justify-center text-3xl hover:bg-bridgeGold-600"
          onClick={() => setOpen(true)}
          aria-label="Abrir chat com Tutor Gemini"
          aria-expanded={open}
        >
          💬
        </button>
      )}
    </div>
  );
};

export default FloatingChat;
