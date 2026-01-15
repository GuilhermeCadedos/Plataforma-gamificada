import React, { useEffect, useState } from "react";

const PainelAdminNovo: React.FC = () => {
  const [materia, setMateria] = useState("Matemática");
  const [titulo, setTitulo] = useState("");
  const [url, setUrl] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [opA, setOpA] = useState("");
  const [opB, setOpB] = useState("");
  const [opC, setOpC] = useState("");
  const [opD, setOpD] = useState("");
  const [correta, setCorreta] = useState<"A" | "B" | "C" | "D">("A");
  const [items, setItems] = useState<any[]>([]);
  const [selectedConteudoId, setSelectedConteudoId] = useState<number | null>(
    null
  );
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const token = localStorage.getItem("token") || "";

  const load = async () => {
    const r = await fetch("/api/conteudos");
    const j = await r.json();
    setItems(Array.isArray(j) ? j : []);
  };
  useEffect(() => {
    load();
  }, []);

  const loadQuizzes = async (conteudoId: number) => {
    setLoadingQuizzes(true);
    try {
      const r = await fetch(`/api/admin/quizzes?conteudoId=${conteudoId}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Falha ao listar quizzes");
      setQuizzes(Array.isArray(j) ? j : []);
      setSelectedConteudoId(conteudoId);
    } catch (err: any) {
      setMsg(err?.message || "Erro ao carregar quizzes");
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      // criar conteúdo
      const rc = await fetch("/api/conteudos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ materia, titulo, tipo: "video", url }),
      });
      const jc = await rc.json();
      if (!rc.ok) throw new Error(jc?.error || "Falha ao criar conteúdo");
      const conteudoId = jc.id;
      // criar quiz
      const rq = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          conteudo_id: conteudoId,
          pergunta,
          op_a: opA,
          op_b: opB,
          op_c: opC,
          op_d: opD,
          correta,
        }),
      });
      const jq = await rq.json();
      if (!rq.ok) throw new Error(jq?.error || "Falha ao criar quiz");
      setMsg("Vídeo e quiz cadastrados com sucesso.");
      setTitulo("");
      setUrl("");
      setPergunta("");
      setOpA("");
      setOpB("");
      setOpC("");
      setOpD("");
      setCorreta("A");
      load();
    } catch (err: any) {
      setMsg(err?.message || "Erro inesperado");
    }
  };

  const excluir = async (id: number) => {
    try {
      const r = await fetch(`/api/conteudos/${id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Falha ao excluir");
      load();
      if (selectedConteudoId === id) {
        setSelectedConteudoId(null);
        setQuizzes([]);
      }
    } catch (err) {
      setMsg(String(err));
    }
  };

  const editarQuiz = async (q: any) => {
    try {
      const perguntaNovo = prompt("Pergunta:", q.pergunta);
      if (perguntaNovo === null) return;
      const op_a = prompt("Opção A:", q.op_a);
      if (op_a === null) return;
      const op_b = prompt("Opção B:", q.op_b);
      if (op_b === null) return;
      const op_c = prompt("Opção C:", q.op_c);
      if (op_c === null) return;
      const op_d = prompt("Opção D:", q.op_d);
      if (op_d === null) return;
      let correta = prompt("Correta (A/B/C/D):", q.correta || "A") || "A";
      correta = correta.toUpperCase();
      if (!["A", "B", "C", "D"].includes(correta)) {
        alert("Valor inválido para correta. Use A, B, C ou D.");
        return;
      }
      const r = await fetch(`/api/quizzes/${q.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pergunta: perguntaNovo,
          op_a,
          op_b,
          op_c,
          op_d,
          correta,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Falha ao atualizar quiz");
      if (selectedConteudoId) await loadQuizzes(selectedConteudoId);
    } catch (err: any) {
      alert(err?.message || "Erro ao editar quiz");
    }
  };

  const excluirQuiz = async (q: any) => {
    const ok = confirm("Excluir esta pergunta do quiz?");
    if (!ok) return;
    try {
      const r = await fetch(`/api/quizzes/${q.id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Falha ao excluir quiz");
      if (selectedConteudoId) await loadQuizzes(selectedConteudoId);
    } catch (err: any) {
      alert(err?.message || "Erro ao excluir quiz");
    }
  };

  return (
    <div className="container-page py-8">
      <div className="card p-6">
        <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Painel Admin
        </h1>
        {msg && (
          <div className="mb-3 text-sm text-blue-700 dark:text-blue-300">
            {msg}
          </div>
        )}
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <div>
            <label className="block text-sm mb-1">Categoria</label>
            <select
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100"
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
            >
              <option>Matemática</option>
              <option>Português</option>
              <option>Inglês</option>
              <option>Lógica</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Título</label>
            <input
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">URL do YouTube</label>
            <input
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Pergunta do Quiz</label>
            <input
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
            />
          </div>
          {["A", "B", "C", "D"].map((k, idx) => (
            <div key={k}>
              <label className="block text-sm mb-1">Opção {k}</label>
              <input
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100"
                value={[opA, opB, opC, opD][idx]}
                onChange={(e) => {
                  const v = e.target.value;
                  if (k === "A") setOpA(v);
                  if (k === "B") setOpB(v);
                  if (k === "C") setOpC(v);
                  if (k === "D") setOpD(v);
                }}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm mb-1">Correta</label>
            <select
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100"
              value={correta}
              onChange={(e) => setCorreta(e.target.value as any)}
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary md:col-span-2">
            Salvar
          </button>
        </form>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2">ID</th>
              <th className="py-2">Matéria</th>
              <th className="py-2">Título</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it: any) => (
              <tr key={it.id} className="border-t">
                <td className="py-2">{it.id}</td>
                <td className="py-2">{it.materia}</td>
                <td className="py-2">{it.titulo}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button
                      className="btn btn-outline"
                      onClick={() => loadQuizzes(it.id)}
                    >
                      Gerenciar Quiz
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => excluir(it.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedConteudoId && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">
              Quizzes do Conteúdo #{selectedConteudoId}
            </h2>
            {loadingQuizzes ? (
              <div className="text-sm text-gray-600">Carregando…</div>
            ) : quizzes.length === 0 ? (
              <div className="text-sm text-gray-600">
                Nenhuma pergunta cadastrada.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-3">ID</th>
                      <th className="py-2 pr-3">Pergunta</th>
                      <th className="py-2 pr-3">A</th>
                      <th className="py-2 pr-3">B</th>
                      <th className="py-2 pr-3">C</th>
                      <th className="py-2 pr-3">D</th>
                      <th className="py-2 pr-3">Correta</th>
                      <th className="py-2 pr-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map((q: any) => (
                      <tr key={q.id} className="border-b">
                        <td className="py-2 pr-3">{q.id}</td>
                        <td
                          className="py-2 pr-3 max-w-xl truncate"
                          title={q.pergunta}
                        >
                          {q.pergunta}
                        </td>
                        <td className="py-2 pr-3">{q.op_a}</td>
                        <td className="py-2 pr-3">{q.op_b}</td>
                        <td className="py-2 pr-3">{q.op_c}</td>
                        <td className="py-2 pr-3">{q.op_d}</td>
                        <td className="py-2 pr-3">{q.correta}</td>
                        <td className="py-2 pr-3">
                          <div className="flex gap-2">
                            <button
                              className="btn btn-outline"
                              onClick={() => editarQuiz(q)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-outline"
                              onClick={() => excluirQuiz(q)}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PainelAdminNovo;
