import React, { useEffect, useState } from "react";
// ProgressBar removida do topo; usando LevelBadge compacto
// Imports de componentes usados nesta página
import Quiz from "../components/Quiz";
import ApiHealth from "../components/ApiHealth";
import Hero from "../components/Hero";
import DailyGoals from "../components/DailyGoals";
import LevelBadge from "../components/LevelBadge";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string) || "http://localhost:3001";

const resolveStoredUrl = (url?: string | null) => {
  if (!url) return null;
  return url.startsWith("/uploads") ? `${API_BASE}${url}` : url;
};

const SHOW_API_HEALTH =
  String(import.meta.env.VITE_SHOW_API_HEALTH || "").toLowerCase() === "true";

type Conteudo = {
  id: number;
  titulo: string;
  tipo: string;
  url?: string | null;
  materia?: string | null;
  explicacao?: string | null;
  xp?: number | null;
};

const StudentDashboard: React.FC = () => {
  const [xp, setXp] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [xpToNextLevel] = useState(200);
  const [modules, setModules] = useState<Record<string, Conteudo[]>>({});
  const [selectedLesson, setSelectedLesson] = useState<Conteudo | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[] | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  // Estados relevantes ao dashboard
  const [userName, setUserName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  // Removido: busca/lista de módulos (layout novo)
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [lastLesson, setLastLesson] = useState<Conteudo | null>(null);
  const [lastProgress, setLastProgress] = useState<number>(0); // 0..100
  const [dailyCount, setDailyCount] = useState<number>(0);
  const [dailyTarget, setDailyTarget] = useState<number>(() => {
    try {
      const envVal = Number(
        (import.meta.env.VITE_DAILY_TARGET as string) || ""
      );
      const ls = localStorage.getItem("dailyTarget");
      const base = ls ? Number(ls) : isNaN(envVal) || envVal <= 0 ? 3 : envVal;
      return Math.max(1, Math.min(10, base));
    } catch {
      return 3;
    }
  });
  const [streakDays, setStreakDays] = useState<number>(0);

  // Demo fallback: módulos e quizzes locais para quando o backend estiver vazio
  const buildDefaultModules = (): Record<string, Conteudo[]> => {
    const base: Conteudo[] = [
      {
        id: 1001,
        materia: "Matemática",
        titulo: "Regra dos Sinais (Matemática)",
        tipo: "video",
        url: "https://www.youtube.com/watch?v=5s7G6dWJt7g",
        explicacao: "Entenda como multiplicar e dividir números com sinais.",
      },
      {
        id: 1002,
        materia: "Matemática",
        titulo: "Frações: Introdução",
        tipo: "video",
        url: "https://www.youtube.com/watch?v=h6qC5p5xJ8A",
        explicacao: "Noções básicas de frações e equivalência.",
      },
      {
        id: 1003,
        materia: "Matemática",
        titulo: "Adição e Subtração de Números Decimais",
        tipo: "video",
        url: "https://www.youtube.com/watch?v=dT2R9B3Fjmc",
        explicacao: "Como somar e subtrair decimais com segurança.",
      },
      {
        id: 1004,
        materia: "Matemática",
        titulo: "Multiplicação e Divisão com Números Decimais",
        tipo: "video",
        url: "https://www.youtube.com/watch?v=6xj7vCz4o1o",
        explicacao: "Operações com decimais passo a passo.",
      },
      {
        id: 1005,
        materia: "Matemática",
        titulo: "Fatoração: Introdução",
        tipo: "video",
        url: "https://www.youtube.com/watch?v=OonL7Pst86A",
        explicacao: "Fatoração e produtos notáveis.",
      },
    ];
    const grouped: Record<string, Conteudo[]> = {};
    for (const it of base) {
      const key = it.materia || "Geral";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(it);
    }
    return grouped;
  };

  const fallbackQuizFor = (c: Conteudo) => {
    const t = (c.titulo || "").toLowerCase();
    if (t.includes("regra dos sinais")) {
      return [
        {
          question: "Qual é o resultado do produto (+) x (-)?",
          options: ["+", "-", "0", "Depende"],
          answer: 1,
        },
        {
          question: "(-) ÷ (-) resulta em?",
          options: ["+", "-", "0", "Impossível"],
          answer: 0,
        },
        {
          question: "Qual é o sinal de (+) x (+)?",
          options: ["+", "-", "0", "Depende"],
          answer: 0,
        },
      ];
    }
    if (t.includes("fraç")) {
      return [
        {
          question: "1/2 é equivalente a:",
          options: ["2/4", "3/6", "4/10", "5/12"],
          answer: 0,
        },
        {
          question: "Para somar frações com denominadores iguais, você deve:",
          options: [
            "Somar numeradores",
            "Somar denominadores",
            "Multiplicar tudo",
            "Subtrair denominadores",
          ],
          answer: 0,
        },
      ];
    }
    if (t.includes("decimais") && t.includes("adição")) {
      return [
        {
          question: "2,3 + 1,7 = ?",
          options: ["3,0", "4,0", "3,9", "4,9"],
          answer: 1,
        },
      ];
    }
    if (t.includes("decimais") && t.includes("multiplic")) {
      return [
        {
          question: "0,2 × 0,3 = ?",
          options: ["0,5", "0,06", "0,12", "0,8"],
          answer: 1,
        },
      ];
    }
    if (t.includes("fatora")) {
      return [
        {
          question: "x² - 9 fatorado é:",
          options: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "x(x-9)"],
          answer: 0,
        },
      ];
    }
    return null;
  };

  useEffect(() => {
    (async () => {
      try {
        // Pré-carrega nome do storage para evitar flicker
        try {
          const storedName = localStorage.getItem("userName");
          if (storedName) setUserName(storedName);
        } catch {}

        let token = localStorage.getItem("token") || "";
        // Remove prefixo 'Bearer ' se já estiver presente para não duplicar
        token = String(token)
          .replace(/^Bearer\s+/i, "")
          .trim();
        // fetch user info
        try {
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (res.ok) {
            const j = await res.json();
            const nome = j.nome || j.name || null;
            setUserName(nome);
            try {
              if (nome) localStorage.setItem("userName", nome);
            } catch {}
            const apiUrl = resolveStoredUrl(j.foto_perfil || j.avatar || null);
            let finalPhoto = apiUrl;
            try {
              const stored = localStorage.getItem("profilePicture");
              if (stored) finalPhoto = stored || finalPhoto;
            } catch {}
            setAvatarUrl(finalPhoto || null);
            setXp(typeof j.xp === "number" ? j.xp : null);
            setLevel(typeof j.nivel === "number" ? j.nivel : null);
          }
        } catch (e) {
          /* ignore */
        }

        // fetch contents
        try {
          const r = await fetch(`${API_BASE}/api/conteudos`);
          let grouped: Record<string, Conteudo[]> | null = null;
          if (r.ok) {
            const arr = await r.json();
            if (Array.isArray(arr) && arr.length > 0) {
              grouped = {};
              for (const it of arr) {
                const key = it.materia || it.categoria || "Geral";
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push({
                  id: it.id,
                  titulo: it.titulo || it.title || it.nome || "",
                  tipo: it.tipo || it.type || "",
                  url: it.url || it.link || null,
                  materia: key,
                  explicacao: it.explicacao || it.descricao || null,
                  xp: typeof it.xp === "number" ? it.xp : null,
                });
              }
            }
          }
          if (!grouped) {
            grouped = buildDefaultModules();
          }
          setModules(grouped);
          // Inicializar "última aula" do storage ou primeiro item do módulo
          try {
            const fromStorage = localStorage.getItem("lastLesson");
            const progStr = localStorage.getItem("lastLessonProgress");
            const prog = progStr ? Number(progStr) : 0;
            if (fromStorage) {
              const obj = JSON.parse(fromStorage);
              setLastLesson(obj || null);
              setLastProgress(
                isNaN(prog) ? 0 : Math.min(100, Math.max(0, prog))
              );
            } else {
              const firstModule = Object.keys(grouped)[0];
              const firstLesson = firstModule ? grouped[firstModule][0] : null;
              if (firstLesson) {
                setLastLesson(firstLesson);
                setLastProgress(0);
                localStorage.setItem("lastLesson", JSON.stringify(firstLesson));
                localStorage.setItem("lastLessonProgress", "0");
              }
            }
          } catch {}
          // Removido: atividades recentes (não exibidas no layout atual)
          // Inicializar Metas Diárias e Ofensiva
          try {
            const toKey = (d: Date) => d.toLocaleDateString("en-CA");
            const todayKey = toKey(new Date());
            const dg = JSON.parse(localStorage.getItem("dailyGoals") || "{}");
            setDailyCount(dg?.date === todayKey ? Number(dg.count) || 0 : 0);
            const st = JSON.parse(localStorage.getItem("studyStreak") || "{}");
            setStreakDays(Number(st?.days) || 0);
          } catch {}
        } catch (e) {
          console.error("conteudos", e);
          const grouped = buildDefaultModules();
          setModules(grouped);
        }

        // leaderboard
        try {
          const r2 = await fetch(`${API_BASE}/api/ranking`);
          if (r2.ok) {
            const top = await r2.json();
            setLeaderboard(Array.isArray(top) ? top.slice(0, 5) : []);
          }
        } catch (e) {
          /* ignore */
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Removido: memo de módulos filtrados (não usado no novo layout)

  // Função para iniciar/retomar aula e registrar "última aula"
  const startLesson = async (lesson: Conteudo) => {
    setSelectedLesson(lesson);
    setVideoEnded(false);
    setQuizCompleted(false);
    setQuizQuestions(null);
    setLastLesson(lesson);
    setLastProgress((p) => (p > 0 ? p : 30)); // marca como iniciado
    try {
      localStorage.setItem("lastLesson", JSON.stringify(lesson));
      localStorage.setItem(
        "lastLessonProgress",
        String(Number(localStorage.getItem("lastLessonProgress")) || 0 || 30)
      );
    } catch {}

    // Carregar quiz se existir (ou fallback)
    try {
      const res = await fetch(`${API_BASE}/api/quizzes/${lesson.id}`);
      if (res.ok) {
        const arr = await res.json();
        if (Array.isArray(arr) && arr.length > 0) {
          const questions = arr.map((q: any) => ({
            question: q.pergunta,
            options: [q.op_a, q.op_b, q.op_c, q.op_d],
            answer: ["A", "B", "C", "D"].indexOf(q.correta),
          }));
          setQuizQuestions(questions);
        } else {
          const fb = fallbackQuizFor(lesson);
          if (fb) setQuizQuestions(fb as any);
        }
      } else {
        const fb = fallbackQuizFor(lesson);
        if (fb) setQuizQuestions(fb as any);
      }
    } catch (_) {
      const fb = fallbackQuizFor(lesson);
      if (fb) setQuizQuestions(fb as any);
    }
    setTimeout(
      () =>
        document
          .getElementById("video")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50
    );
  };

  // Atualiza metas diárias e ofensiva ao concluir aula
  const markDailyProgress = () => {
    try {
      const toKey = (d: Date) => d.toLocaleDateString("en-CA");
      const today = new Date();
      const todayKey = toKey(today);
      const yesterdayKey = toKey(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
      );

      // Daily goals progress
      const dg = JSON.parse(localStorage.getItem("dailyGoals") || "{}");
      const newCount = dg?.date === todayKey ? (Number(dg.count) || 0) + 1 : 1;
      localStorage.setItem(
        "dailyGoals",
        JSON.stringify({ date: todayKey, count: newCount })
      );
      setDailyCount(newCount);

      // Streak/offensiva
      const st = JSON.parse(localStorage.getItem("studyStreak") || "{}");
      let days = Number(st?.days) || 0;
      const last = st?.lastDate || null;
      if (last === todayKey) {
        // já registrado hoje
      } else if (last === yesterdayKey) {
        days = days + 1;
      } else {
        days = 1;
      }
      localStorage.setItem(
        "studyStreak",
        JSON.stringify({ lastDate: todayKey, days })
      );
      setStreakDays(days);
    } catch {}
  };

  return (
    <div className="container-page py-8">
      <Hero />
      <nav className="text-sm text-gray-600 mb-3" aria-label="breadcrumb">
        <ol className="inline-flex items-center gap-1">
          <li>
            <span className="hover:underline">Início</span>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span className="text-gray-900">Aluno</span>
          </li>
        </ol>
      </nav>
      {SHOW_API_HEALTH && <ApiHealth />}
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Painel do Aluno</h1>
      {/* Removido: barra de XP em largura total. O progresso agora é compacto no cabeçalho do aluno. */}

      {/* Dashboard principal: esquerda (Continuar + Metas), centro (Boas-vindas + Próxima atividade), direita (Ranking + Conquistas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 items-start">
        {/* Coluna esquerda */}
        <div className="space-y-4 md:col-span-1">
          {/* Novo container: foto de perfil + nome */}
          <div className="card p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    PS
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg">
                  {userName || "Aluno"}
                </div>
                <div className="text-xs text-gray-600">Perfil do usuário</div>
              </div>
            </div>
          </div>

          {/* Container atual: círculo azul com texto de nível e XP (animado) */}
          <div className="card p-4">
            <LevelBadge
              level={level ?? 1}
              xp={xp ?? 0}
              xpToNextLevel={xpToNextLevel}
              avatarUrl={avatarUrl}
              size={72}
              showAvatar={false}
              variant="full"
            />
          </div>

          <div className="card p-4">
            <div className="space-y-4">
              {/* Card Continuar de onde parei */}
              <div className="p-4 rounded-xl shadow-sm border border-gray-200 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Continuar de onde parei
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {lastLesson ? lastLesson.materia || "Módulo" : "Módulo"} ·{" "}
                      {lastLesson
                        ? lastLesson.titulo || "Aula"
                        : "Nenhuma aula iniciada"}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-bridgeBlue-700 rounded-full transition-all"
                      style={{
                        width: `${Math.max(0, Math.min(100, lastProgress))}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Progresso: {Math.max(0, Math.min(100, lastProgress))}%
                  </div>
                </div>
                <button
                  className="mt-4 w-full py-2 rounded-lg bg-bridgeBlue-700 text-white font-semibold hover:bg-bridgeBlue-800"
                  onClick={() => {
                    if (!lastLesson) return alert("Nenhuma aula para retomar.");
                    startLesson(lastLesson);
                  }}
                >
                  Retomar Aula
                </button>
              </div>

              <DailyGoals
                count={dailyCount}
                target={dailyTarget}
                streak={streakDays}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-600">Meta diária</span>
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 rounded border text-sm"
                    onClick={() => {
                      setDailyTarget((t) => {
                        const v = Math.max(1, t - 1);
                        try {
                          localStorage.setItem("dailyTarget", String(v));
                        } catch {}
                        return v;
                      });
                    }}
                    aria-label="Diminuir meta diária"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold">{dailyTarget}</span>
                  <button
                    className="px-2 py-1 rounded border text-sm"
                    onClick={() => {
                      setDailyTarget((t) => {
                        const v = Math.min(10, t + 1);
                        try {
                          localStorage.setItem("dailyTarget", String(v));
                        } catch {}
                        return v;
                      });
                    }}
                    aria-label="Aumentar meta diária"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                className="btn w-full border py-2 rounded"
                onClick={() => (window.location.href = "/ranking")}
              >
                Ver classificação
              </button>
            </div>
          </div>
        </div>

        {/* Coluna central */}
        <div className="space-y-4 md:col-span-1">
          {/* Banner de boas-vindas */}
          <div
            className="rounded-xl p-6 text-white shadow"
            style={{
              backgroundImage: "linear-gradient(to right, #2563eb, #14b8a6)",
            }}
          >
            <h3 className="text-xl font-semibold">
              Bem-vindo{userName ? `, ${userName}` : ""}!
            </h3>
            <p className="text-sm mt-1 opacity-90">
              Pronto para estudar? Continue sua trilha e conquiste novas metas
              hoje.
            </p>
          </div>
          {/* Próxima atividade recomendada */}
          {(() => {
            const moduleKeys = Object.keys(modules);
            let recommended: Conteudo | null = null;
            if (
              lastLesson &&
              lastLesson.materia &&
              modules[lastLesson.materia]
            ) {
              const arr = modules[lastLesson.materia];
              const idx = arr.findIndex((a) => a.id === lastLesson.id);
              recommended = arr[idx + 1] || null;
            }
            if (!recommended && moduleKeys.length) {
              recommended = modules[moduleKeys[0]]?.[0] || null;
            }
            return (
              <div className="card p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Próxima Atividade Recomendada
                </h3>
                {recommended ? (
                  <div className="mt-2">
                    <div className="text-sm text-gray-700">
                      {recommended.materia}
                    </div>
                    <div className="font-medium text-gray-900">
                      {recommended.titulo}
                    </div>
                    <button
                      className="mt-3 btn bg-bridgeBlue-700 text-white"
                      onClick={() => startLesson(recommended!)}
                    >
                      Iniciar
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Nenhuma atividade encontrada.
                  </p>
                )}
              </div>
            );
          })()}
        </div>

        {/* Coluna direita */}
        <aside className="space-y-4 md:col-span-1">
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              Ranking
            </h3>
            {leaderboard && leaderboard.length > 0 ? (
              <ul className="space-y-2">
                {leaderboard.slice(0, 5).map((u, idx) => (
                  <li key={u.id || idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                      {u.foto_perfil ? (
                        <img
                          src={
                            (u.foto_perfil || "").startsWith("/uploads")
                              ? `${API_BASE}${u.foto_perfil}`
                              : u.foto_perfil
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs">{(u.nome || "")[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 text-sm truncate">
                      {u.nome || u.username}
                    </div>
                    <div className="text-xs text-gray-600">{u.xp} XP</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">Sem dados de ranking.</p>
            )}
          </div>

          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              Conquistas
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div
                className="px-3 py-2 rounded-lg border border-blue-200 text-sm"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #eff6ff, #f0fdff)",
                }}
              >
                Iniciante
              </div>
              <div
                className="px-3 py-2 rounded-lg border border-blue-200 text-sm"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #eff6ff, #f0fdff)",
                }}
              >
                Explorador
              </div>
              <div
                className="px-3 py-2 rounded-lg border border-blue-200 text-sm"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #eff6ff, #f0fdff)",
                }}
              >
                Veterano
              </div>
              <div
                className="px-3 py-2 rounded-lg border border-blue-200 text-sm"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #eff6ff, #f0fdff)",
                }}
              >
                Maratonista
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Conteúdo principal (somente player e quiz; lista lateral removida) */}
      <div className="grid grid-cols-1 gap-6 mt-4">
        <main className="card p-4">
          {selectedLesson ? (
            <div className="space-y-4">
              <div className="card p-4" id="video">
                <h2 className="text-xl font-semibold mb-2 text-gray-900">
                  {selectedLesson.titulo}
                </h2>
                {(() => {
                  const url = selectedLesson.url || "";
                  const isYouTube =
                    url.includes("youtube") || url.includes("youtu.be");
                  if (isYouTube) {
                    const embedUrl = url.includes("watch?v=")
                      ? `https://www.youtube.com/embed/${
                          url.split("watch?v=")[1]
                        }`
                      : url.replace("youtu.be/", "www.youtube.com/embed/");
                    return (
                      <div className="aspect-video w-full">
                        <iframe
                          className="w-full h-full rounded"
                          src={embedUrl}
                          title="YouTube video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    );
                  }
                  return (
                    <video
                      className="w-full rounded"
                      src={url}
                      controls
                      onEnded={() => setVideoEnded(true)}
                    />
                  );
                })()}
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="btn bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={async () => {
                    if (!selectedLesson) return;
                    try {
                      const token = localStorage.getItem("token") || "";
                      const res = await fetch(
                        `${API_BASE}/api/progresso/${selectedLesson.id}`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            ...(token
                              ? { Authorization: `Bearer ${token}` }
                              : {}),
                          },
                        }
                      );
                      if (res.ok) {
                        const j = await res.json().catch(() => ({}));
                        setXp(typeof j.xp === "number" ? j.xp : xp);
                        setLevel(typeof j.nivel === "number" ? j.nivel : level);
                        setModules((prev) => {
                          const copy = { ...prev };
                          for (const key of Object.keys(copy)) {
                            copy[key] = copy[key].map((it) =>
                              it.id === selectedLesson.id
                                ? { ...it, completed: true }
                                : it
                            );
                          }
                          return copy;
                        });
                        setLastProgress(100);
                        try {
                          localStorage.setItem("lastLessonProgress", "100");
                        } catch {}
                        markDailyProgress();
                        alert("Aula marcada como concluída.");
                      } else {
                        alert("Falha ao marcar progresso. Faça login.");
                      }
                    } catch (e) {
                      console.error(e);
                      alert("Erro ao marcar progresso");
                    }
                  }}
                >
                  Concluir Aula
                </button>

                <button
                  className="btn border px-3 py-1 rounded"
                  onClick={async () => {
                    if (!selectedLesson) return;
                    try {
                      const res = await fetch(
                        `${API_BASE}/api/quizzes/${selectedLesson.id}`
                      );
                      if (!res.ok)
                        return alert("Nenhum quiz disponível para esta aula.");
                      const arr = await res.json();
                      if (!Array.isArray(arr) || arr.length === 0)
                        return alert("Nenhum quiz disponível para esta aula.");
                      const questions = arr.map((q: any) => ({
                        question: q.pergunta,
                        options: [q.op_a, q.op_b, q.op_c, q.op_d],
                        answer: ["A", "B", "C", "D"].indexOf(q.correta),
                      }));
                      setQuizQuestions(questions);
                    } catch (e) {
                      console.error(e);
                      alert("Erro ao carregar quiz");
                    }
                  }}
                >
                  Recarregar Quiz
                </button>
              </div>

              {quizQuestions &&
                !quizCompleted &&
                (videoEnded ||
                  (selectedLesson.url || "").includes("youtube") ||
                  (selectedLesson.url || "").includes("youtu.be")) && (
                  <div className="card p-4">
                    <Quiz
                      questions={quizQuestions}
                      onComplete={() => setQuizCompleted(true)}
                    />
                  </div>
                )}
              {quizCompleted && (
                <div className="card p-4 bg-blue-50 border-blue-200">
                  Parabéns! Você concluiu o quiz.
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-600">
              Use o card "Continuar de onde parei" para retomar sua última aula.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
