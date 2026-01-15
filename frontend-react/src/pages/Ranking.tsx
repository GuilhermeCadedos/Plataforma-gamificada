import React, { useEffect, useState } from "react";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string) || "http://localhost:3001";

type User = {
  id: number;
  nome: string;
  xp: number;
  nivel: number;
  foto_perfil?: string | null;
};

const Ranking: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/ranking`);
        if (!r.ok) return setUsers([]);
        const j = await r.json();
        setUsers(Array.isArray(j) ? j : []);
      } catch (e) {
        console.error("Erro ao carregar ranking", e);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container-page py-8">
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">
          Ranking — Top usuários por XP
        </h2>
        {loading ? (
          <div>Carregando...</div>
        ) : users.length === 0 ? (
          <div>Nenhum usuário encontrado.</div>
        ) : (
          <ol className="space-y-3">
            {users.map((u, idx) => (
              <li
                key={u.id}
                className="flex items-center gap-4 p-3 border rounded"
              >
                <div className="w-10 text-center font-semibold text-gray-700">
                  #{idx + 1}
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  {u.foto_perfil ? (
                    <img
                      src={`${API_BASE}${u.foto_perfil}`}
                      alt={u.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-sm text-gray-500">
                      {u.nome?.slice(0, 1) || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{u.nome}</div>
                  <div className="text-sm text-gray-600">
                    Nível {u.nivel} — {u.xp} XP
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default Ranking;
