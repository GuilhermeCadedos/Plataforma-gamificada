import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const [dark, setDark] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("theme-dark") === "true";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
    const updateFromToken = () => {
      try {
        const tok = localStorage.getItem("token");
        if (tok) {
          const parts = tok.split(".");
          if (parts.length === 3) {
            // base64url -> base64
            let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            const pad = b64.length % 4;
            if (pad) b64 += "=".repeat(4 - pad);
            const payload = JSON.parse(atob(b64));
            setUserName(
              typeof payload?.nome === "string" ? payload.nome : null
            );
            setUserRole(
              typeof payload?.cargo === "string" ? payload.cargo : null
            );
            return;
          }
        }
        setUserName(null);
        setUserRole(null);
      } catch {
        setUserName(null);
        setUserRole(null);
      }
    };
    updateFromToken();
    const handler = () => updateFromToken();
    window.addEventListener("token-changed", handler as EventListener);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("token-changed", handler as EventListener);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme-dark", String(next));
    document.documentElement.classList.toggle("dark", next);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUserName(null);
    setUserRole(null);
    window.dispatchEvent(new Event("token-changed"));
    nav("/entrar");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="container-page py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Logo Ponte do Saber" className="h-9 w-9" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Ponte do Saber
          </span>
          {userName && (
            <span className="ml-2 px-3 py-1 rounded bg-white text-gray-900 border border-gray-200 shadow-sm">
              {userName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <NavLink
            to="/aluno"
            className={({ isActive }) =>
              `btn px-3 py-2 ${
                isActive ? "bg-bridgeBlue-700 text-white" : "btn-outline"
              }`
            }
          >
            Aluno
          </NavLink>
          <NavLink
            to="/trilhas"
            className={({ isActive }) =>
              `btn px-3 py-2 ${
                isActive ? "bg-bridgeBlue-700 text-white" : "btn-outline"
              }`
            }
          >
            Trilhas
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `btn px-3 py-2 ${
                isActive ? "bg-bridgeBlue-700 text-white" : "btn-outline"
              }`
            }
          >
            Perfil
          </NavLink>
          <NavLink
            to="/quiz-demo"
            className={({ isActive }) =>
              `btn px-3 py-2 ${
                isActive ? "bg-bridgeBlue-700 text-white" : "btn-outline"
              }`
            }
          >
            Quiz
          </NavLink>
          <NavLink
            to="/ranking"
            className={({ isActive }) =>
              `btn px-3 py-2 ${
                isActive ? "bg-bridgeBlue-700 text-white" : "btn-outline"
              }`
            }
          >
            Ranking
          </NavLink>
          {userRole === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `btn px-3 py-2 ${
                  isActive ? "bg-bridgeBlue-700 text-white" : "btn-outline"
                }`
              }
            >
              Administrador
            </NavLink>
          )}
          {!userName && (
            <>
              <NavLink
                to="/entrar"
                className={({ isActive }) =>
                  `btn px-3 py-2 ${
                    isActive ? "bg-bridgeBlue-700 text-white" : "btn-outline"
                  }`
                }
              >
                Entrar
              </NavLink>
              <NavLink
                to="/registrar"
                className={({ isActive }) =>
                  `btn px-3 py-2 ${
                    isActive ? "bg-bridgeBlue-700 text-white" : "btn-outline"
                  }`
                }
              >
                Registrar
              </NavLink>
            </>
          )}
          {userName && (
            <>
              <button
                onClick={logout}
                className="btn px-3 py-2 btn-outline"
                aria-label="Sair"
              >
                Sair
              </button>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="btn px-3 py-2 bg-bridgeTeal-600 text-white hover:bg-bridgeTeal-500"
            aria-label="Alternar tema"
          >
            {dark ? "Claro" : "Escuro"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
