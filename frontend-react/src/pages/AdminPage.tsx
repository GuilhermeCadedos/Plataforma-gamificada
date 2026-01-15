import React from 'react';
import PainelAdminNovo from './PainelAdminNovo';
import UsersAdmin from '../components/UsersAdmin';

const AdminPage: React.FC = () => {
  const userRole = 'admin';
  const [token, setToken] = React.useState<string>(() => localStorage.getItem('token') || '');

  const saveToken = () => {
    localStorage.setItem('token', token);
    alert('Token salvo.');
  };

  return (
    <div className="container-page py-8">
      <nav className="text-sm text-gray-600 mb-3" aria-label="breadcrumb">
        <ol className="inline-flex items-center gap-1">
          <li><span className="hover:underline">Início</span></li>
          <li aria-hidden="true">/</li>
          <li><span className="text-gray-900">Admin</span></li>
        </ol>
      </nav>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Painel do Administrador</h1>
      <div className="card p-4 mb-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" htmlFor="admin-token">JWT Token</label>
            <input id="admin-token" value={token} onChange={(e) => setToken(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Cole aqui o token JWT"/>
          </div>
          <button className="btn btn-primary px-4 py-2" onClick={saveToken}>Salvar Token</button>
        </div>
        <p className="text-xs text-gray-600 mt-1">Use um token de usuário admin para cadastrar conteúdos.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <UsersAdmin />
        </div>
      </div>
      <div className="mt-6">
        <PainelAdminNovo />
      </div>
    </div>
  );
};

export default AdminPage;
