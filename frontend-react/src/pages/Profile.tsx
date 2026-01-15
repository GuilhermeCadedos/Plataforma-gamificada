import React, { useEffect, useState } from "react";
import LevelBadge from "../components/LevelBadge";
// no useNavigate to avoid Router-context errors; use window.location for redirects

const Profile: React.FC = () => {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [xp, setXp] = useState<number | null>(null);
  const [nivel, setNivel] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("Aluno");
  const xpToNextLevel = 200;

  const handleProfilePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const formData = new FormData();
      formData.append("profilePicture", event.target.files[0]);

      try {
        let token = localStorage.getItem("token") || "";
        // Defensive: remove accidental "Bearer " prefix if it was stored
        token = String(token)
          .replace(/^Bearer\s+/i, "")
          .trim();
        console.debug(
          "Uploading profile picture — token length:",
          token.length,
          "startsWithBearer?:",
          /^Bearer\s+/i.test(localStorage.getItem("token") || "")
        );
        if (!token) {
          alert("Você não está autenticado. Faça login antes de subir a foto.");
          return;
        }

        const response = await fetch(`${API_BASE}/api/profile/upload-picture`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          const stored = resolveStoredUrl(data.fileUrl || data.filePath);
          setProfilePicture(stored);
          try {
            localStorage.setItem("profilePicture", stored || "");
          } catch (_) {}
          alert("Foto de perfil atualizada com sucesso!");
        } else {
          console.warn("Upload failed", response.status, data);
          if (
            response.status === 401 ||
            (data && data.error && data.error.toLowerCase().includes("token"))
          ) {
            alert(
              "Token inválido ou expirado. Você será redirecionado para a página de login."
            );
            localStorage.removeItem("token");
            window.location.href = "/entrar";
            return;
          } else {
            alert(data.error || "Erro ao fazer upload da foto de perfil");
          }
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao fazer upload da foto de perfil");
      }
    }
  };

  const resolveStoredUrl = (maybePath: string) => {
    if (!maybePath) return null;
    if (/^https?:\/\//i.test(maybePath)) return maybePath;
    // If path starts with /uploads, prefix backend origin (dev default port 3001)
    if (maybePath.startsWith("/uploads")) {
      const host = window.location.hostname || "localhost";
      const proto = window.location.protocol || "http:";
      return `${proto}//${host}:3001${maybePath}`;
    }
    return maybePath;
  };

  // Use Vite env var (import.meta.env) instead of process.env to avoid runtime errors
  const API_BASE =
    (import.meta.env.VITE_API_BASE as string) || "http://localhost:3001";

  useEffect(() => {
    (async () => {
      try {
        // First, load any previously stored profile picture so it displays even when
        // user is not authenticated or token expired.
        const fromStorage = localStorage.getItem("profilePicture");
        if (fromStorage) setProfilePicture(fromStorage);

        // Then, if there's a token, try to refresh from the API and overwrite stored value.
        let token = localStorage.getItem("token") || "";
        token = String(token)
          .replace(/^Bearer\s+/i, "")
          .trim();
        if (!token) return;
        console.debug("/api/auth/me fetch — token length", token.length);
        const r = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) {
          // nothing more to do; keep the local value
          return;
        }
        const j = await r.json();
        if (j?.nome || j?.name) {
          setUserName(j.nome || j.name);
          try {
            localStorage.setItem("userName", j.nome || j.name);
          } catch {}
        }
        if (j?.foto_perfil) {
          const resolved = resolveStoredUrl(j.foto_perfil);
          setProfilePicture(resolved);
          try {
            localStorage.setItem("profilePicture", resolved || "");
          } catch (_) {}
        } else if (j?.avatar) setAvatar(j.avatar);
        if (typeof j?.xp === "number") setXp(j.xp);
        if (typeof j?.nivel === "number") setNivel(j.nivel);
      } catch (err) {
        console.error("Erro ao buscar usuário autenticado:", err);
      }
    })();
  }, []);

  // Mantido para uso futuro (seleção de avatar pré-definido)
  // const handleAvatarSelection = async (avatarUrl: string) => { /* ... */ };

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Perfil do Usuário
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1) Container: Foto + nome + upload */}
        <div className="card p-6">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Foto de Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  PS
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-xl font-semibold text-gray-900">
                {userName}
              </div>
              <div className="text-sm text-gray-600">Perfil do usuário</div>
              <div className="mt-3">
                <label htmlFor="profileUpload" className="btn-upload">
                  Carregar foto
                </label>
                <input
                  id="profileUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2) Container: Círculo animado + nível e XP restante */}
        <div className="card p-6 overflow-visible flex items-center justify-center">
          <LevelBadge
            level={nivel ?? 1}
            xp={xp ?? 0}
            xpToNextLevel={xpToNextLevel}
            avatarUrl={profilePicture || avatar}
            size={110}
            showAvatar={false}
            variant="full"
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
