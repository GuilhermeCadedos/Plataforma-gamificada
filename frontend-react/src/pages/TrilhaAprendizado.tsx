import React, { useEffect, useMemo, useState } from "react";

type Conteudo = {
  id: number;
  materia: string | null;
  titulo: string;
  tipo: "video" | "texto";
  url?: string | null;
  explicacao?: string | null;
  ordem?: number | null;
  xp?: number | null;
};

function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  try {
    const regex = /(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const m = url.match(regex);
    if (m && m[1]) return m[1];
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v) return v;
  } catch {}
  return null;
}

const TrilhaAprendizado: React.FC = () => {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState<Record<number, number>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/conteudos");
        if (!r.ok) throw new Error(`Erro: ${r.status}`);
        const j = await r.json();
        if (mounted) setConteudos(Array.isArray(j) ? j : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Erro ao carregar conteúdos");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const agrupados = useMemo(() => {
    const byMateria: Record<string, Conteudo[]> = {};
    for (const c of conteudos) {
      const key = (c.materia || "Geral").trim();
      if (!byMateria[key]) byMateria[key] = [];
      byMateria[key].push(c);
    }
    return byMateria;
  }, [conteudos]);

  const concluir = async (id: number) => {
    try {
      const token = localStorage.getItem("token") || "";
      const r = await fetch(`/api/progresso/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (r.ok) {
        const j = await r.json();
        setXpAwarded((prev) => ({ ...prev, [id]: j?.awarded ?? 0 }));
      } else {
        alert("Não foi possível marcar como concluído.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container-page py-8">
        <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Trilha de Aprendizado
        </h1>

        {loading && <div className="card p-4">Carregando...</div>}
        {error && <div className="card p-4 text-red-700">{error}</div>}

        {!loading && !error && (
          <div className="space-y-6">
            {Object.entries(agrupados).map(([materia, items]) => (
              <section key={materia}>
                <h2 className="text-lg font-medium mb-3">{materia}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((c) => {
                    const vid =
                      c.tipo === "video" ? extractYouTubeId(c.url) : null;
                    const embed = vid
                      ? `https://www.youtube.com/embed/${vid}`
                      : null;
                    return (
                      <article key={c.id} className="card p-4">
                        <h3 className="font-semibold mb-2">{c.titulo}</h3>
                        {c.tipo === "video" ? (
                          embed ? (
                            <div className="aspect-video mb-3">
                              <iframe
                                src={embed}
                                title={c.titulo}
                                className="w-full h-full"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 mb-3">
                              Vídeo inválido
                            </p>
                          )
                        ) : (
                          <p className="text-sm text-gray-700 mb-3">
                            {c.explicacao}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <button
                            className="btn bg-blue-600 text-white px-3 py-1 rounded"
                            onClick={() => concluir(c.id)}
                          >
                            Concluir
                          </button>
                          {typeof c.xp === "number" && (
                            <span className="text-sm">XP: {c.xp}</span>
                          )}
                        </div>

                        {xpAwarded[c.id] !== undefined && (
                          <div className="mt-2 text-green-700">
                            +{xpAwarded[c.id]} XP
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrilhaAprendizado;
