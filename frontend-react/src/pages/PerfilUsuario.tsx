import React, { useEffect, useState } from 'react';
import { getAuth } from '../auth';
import './PerfilUsuario.css';
import LevelBadge from '../components/LevelBadge';

const badges = [
  { name: 'Iniciante', icon: '🥉' },
  { name: 'Explorador', icon: '🥈' },
  { name: 'Veterano', icon: '🥇' },
];

const PerfilUsuario: React.FC = () => {
  const { user } = getAuth();
  const nome = user?.nome || 'Aluno';
  const nivelLabel = user?.cargo === 'admin' ? 'Mentor' : 'Explorador';
  const aulasPorMateria = [
    { materia: 'Matemática', qtd: 6 },
    { materia: 'Português', qtd: 4 },
    { materia: 'Inglês', qtd: 3 },
  ];
  const xpAtual = 120; // mock; integrar com API usuarios
  const faltante = 100 - (xpAtual % 100);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [xp, setXp] = useState<number | null>(null);
  const [nivelNum, setNivelNum] = useState<number | null>(null);
  const xpToNextLevel = 200;

  // Helper para resolver URL salva (pode vir como /uploads/...)
  const resolveStoredUrl = (maybePath: string | null) => {
    if (!maybePath) return null;
    if (/^https?:\/\//i.test(maybePath)) return maybePath;
    // Preferir endpoint proxyado pelo Vite para evitar CORS
    if (maybePath.startsWith('/uploads')) {
      // Construir URL absoluta para o backend local
      const host = window.location.hostname || 'localhost';
      const proto = window.location.protocol || 'http:';
      return `${proto}//${host}:3001${maybePath}`;
    }
    return maybePath;
  };

  // Ao montar, tentar recuperar a foto persistida do backend/localStorage
  useEffect(() => {
    try {
      const fromStorage = localStorage.getItem('profilePicture');
      if (fromStorage) setProfilePicture(fromStorage);
    } catch {}

    (async () => {
      try {
        let token = localStorage.getItem('token') || '';
        token = String(token).replace(/^Bearer\s+/i, '').trim();
        if (!token) return;
        const r = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) return;
        const j = await r.json();
        if (j?.foto_perfil) {
          const resolved = resolveStoredUrl(j.foto_perfil);
          setProfilePicture(resolved);
          try { localStorage.setItem('profilePicture', resolved || ''); } catch {}
        } else if (j?.avatar) {
          setAvatar(j.avatar);
        }
      } catch (e) {
        console.error('Erro ao carregar perfil:', e);
      }
    })();
  }, []);

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const formData = new FormData();
      formData.append('profilePicture', event.target.files[0]);

      try {
        const response = await fetch('/api/profile/upload-picture', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          const stored = resolveStoredUrl(data.fileUrl || data.filePath);
          setProfilePicture(stored);
          try { localStorage.setItem('profilePicture', stored || ''); } catch {}
          alert('Foto de perfil atualizada com sucesso!');
        } else {
          alert(data.error || 'Erro ao fazer upload da foto de perfil');
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao fazer upload da foto de perfil');
      }
    }
  };

  // Carregar XP/Nível e foto persistida
  useEffect(() => {
    (async () => {
      try {
        const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001';
        const token = localStorage.getItem('token') || '';
        if (!token) return;
        const r = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) return;
        const j = await r.json();
        if (typeof j?.xp === 'number') setXp(j.xp);
        if (typeof j?.nivel === 'number') setNivelNum(j.nivel);
        if (j?.foto_perfil) setProfilePicture(j.foto_perfil);
        else if (j?.avatar) setAvatar(j.avatar);
      } catch {}
    })();
  }, []);

  const handleAvatarSelection = async (avatarUrl: string) => {
    try {
      const response = await fetch('/api/profile/update-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ avatar: avatarUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        setAvatar(data.avatar);
        alert('Avatar atualizado com sucesso!');
      } else {
        alert(data.error || 'Erro ao atualizar o avatar');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar o avatar');
    }
  };

  return (
    <div className="container-page py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1) Card: Foto + nome + upload estilizado */}
        <div className="card p-6">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
              {profilePicture ? (
                <img src={profilePicture} alt="Foto de Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">PS</div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{nome}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Função: {nivelLabel}</div>
              <div className="mt-3">
                <label htmlFor="perfilUpload" className="btn-upload">Carregar foto</label>
                <input id="perfilUpload" type="file" accept="image/*" onChange={handleProfilePictureUpload} style={{ display: 'none' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 2) Card: Anel animado com nível/XP restante */}
        <div className="card p-6 overflow-visible flex items-center justify-center">
          <LevelBadge level={nivelNum ?? 1} xp={xp ?? 0} xpToNextLevel={xpToNextLevel} avatarUrl={profilePicture || avatar} size={110} showAvatar={false} variant="full" />
        </div>
      </div>

      {/* Demais seções abaixo */}
      <div className="card p-6 mt-6">
        <div className="avatar-section">
          <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Selecione um Avatar</h2>
          <div className="avatars">
            {['/assets/avatars/avatar1.svg', '/assets/avatars/avatar2.svg', '/assets/avatars/avatar3.svg'].map((avatarUrl) => (
              <img
                key={avatarUrl}
                src={avatarUrl}
                alt="Avatar"
                onClick={() => handleAvatarSelection(avatarUrl)}
                className={`avatar ${avatar === avatarUrl ? 'selected' : ''}`}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Conquistas</h2>
            <div className="flex gap-3">
              {badges.map(b => (
                <div key={b.name} className="px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                  <span className="mr-2">{b.icon}</span>{b.name}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Estatísticas</h2>
            <div className="space-y-2">
              {aulasPorMateria.map(a => (
                <div key={a.materia} className="flex justify-between text-sm">
                  <span>{a.materia}</span>
                  <span>{a.qtd} aulas concluídas</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">XP e Próximo Nível</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${(xpAtual % 100)}%` }}></div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Faltam {faltante} XP para o próximo nível.</div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;
