import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login: React.FC = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !senha) {
      setError("Preencha email e senha");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || `Falha no login (HTTP ${res.status})`);
      } else {
        const data = await res.json();
        if (data?.token) {
          localStorage.setItem("token", data.token);
          // Notificar Navbar e outros ouvintes
          window.dispatchEvent(new Event("token-changed"));
          nav("/aluno");
        } else {
          setError("Resposta inesperada da API");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Falha de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-8">
      <div className="card max-w-md mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Entrar
        </h1>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Senha
            </label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-3 text-sm">
          Não tem conta?{" "}
          <Link to="/registrar" className="text-bridgeBlue-700">
            Registrar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
