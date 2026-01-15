import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register: React.FC = () => {
  const nav = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!nome || !email || !senha) {
      setError("Preencha nome, email e senha");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || `Falha no cadastro (HTTP ${res.status})`);
      } else {
        // Auto-login imediato após cadastro
        try {
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha }),
          });
          const loginData = await loginRes.json().catch(() => ({}));
          if (loginRes.ok && loginData?.token) {
            localStorage.setItem("token", loginData.token);
            window.dispatchEvent(new Event("token-changed"));
            setSuccess("Cadastro realizado! Você está logado.");
            nav("/aluno");
          } else {
            setSuccess("Cadastro realizado! Já pode entrar.");
            setTimeout(() => nav("/entrar"), 800);
          }
        } catch {
          setSuccess("Cadastro realizado! Já pode entrar.");
          setTimeout(() => nav("/entrar"), 800);
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
          Registrar
        </h1>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        {success && (
          <div className="mb-3 text-sm text-green-600">{success}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Nome
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
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
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        <div className="mt-3 text-sm">
          Já tem conta?{" "}
          <Link to="/entrar" className="text-bridgeBlue-700">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
