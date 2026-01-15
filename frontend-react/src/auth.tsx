import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export type AuthPayload = {
  id: number;
  cargo: string;
  nome: string;
  email: string;
  exp?: number;
};

export function getAuth() {
  const token = localStorage.getItem("token") || null;
  let user: AuthPayload | null = null;
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        user = JSON.parse(atob(parts[1]));
      }
    } catch {}
  }
  return { token, user };
}

export const RequireAuth: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const { token } = getAuth();
  const loc = useLocation();
  if (!token) return <Navigate to="/entrar" replace state={{ from: loc }} />;
  return children;
};

export const RequireAdmin: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const { token, user } = getAuth();
  const loc = useLocation();
  if (!token) return <Navigate to="/entrar" replace state={{ from: loc }} />;
  if (!user || user.cargo !== "admin") return <Navigate to="/aluno" replace />;
  return children;
};
