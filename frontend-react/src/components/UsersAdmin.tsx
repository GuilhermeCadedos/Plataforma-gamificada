import React, { useEffect, useState } from 'react';

type User = { id: number; nome: string; email: string; xp: number; nivel: number; cargo: 'admin'|'aluno' };

const UsersAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token') || '';

  const fetchUsers = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/usuarios', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Falha ao listar usuários (HTTP ${res.status})`);
      setUsers(data);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const promote = async (u: User) => {
    const ok = confirm(`Promover ${u.nome} (${u.email}) para admin?`);
    if (!ok) return;
    try {
      const res = await fetch(`/api/usuarios/${u.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cargo: 'admin' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Falha ao promover (HTTP ${res.status})`);
      await fetchUsers();
      alert('Usuário promovido a admin.');
    } catch (e: any) {
      alert(e.message || String(e));
    }
  };

  const removeUser = async (u: User) => {
    const ok = confirm(`Excluir usuário ${u.nome} (${u.email})? Esta ação não pode ser desfeita.`);
    if (!ok) return;
    try {
      const res = await fetch(`/api/usuarios/${u.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Falha ao excluir (HTTP ${res.status})`);
      await fetchUsers();
      alert('Usuário excluído.');
    } catch (e: any) {
      alert(e.message || String(e));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Usuários</h2>
        <button className="btn btn-outline" onClick={fetchUsers}>Atualizar</button>
      </div>
      {loading && <div className="text-sm text-gray-600">Carregando…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Nome</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Cargo</th>
              <th className="py-2 pr-4">XP</th>
              <th className="py-2 pr-4">Nível</th>
              <th className="py-2 pr-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="py-2 pr-4">{u.nome}</td>
                <td className="py-2 pr-4">{u.email}</td>
                <td className="py-2 pr-4">{u.cargo}</td>
                <td className="py-2 pr-4">{u.xp}</td>
                <td className="py-2 pr-4">{u.nivel}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2 items-center">
                    {u.cargo !== 'admin' ? (
                      <button className="btn btn-primary px-3 py-1" onClick={() => promote(u)}>Tornar Admin</button>
                    ) : (
                      <span className="text-gray-600">Admin</span>
                    )}
                    <button className="btn btn-outline px-3 py-1" onClick={() => removeUser(u)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersAdmin;
