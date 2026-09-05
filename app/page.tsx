'use client';

import { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import FuncionarioDashboard from './components/FuncionarioDashboard';

export default function Home() {
  const [usuarioLogado, setUsuarioLogado] = useState<{ role: 'admin' | 'funcionario'; email: string } | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState<boolean>(true);

  // Efeito para verificar se já existe uma sessão salva no navegador
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('boxb1_user_session');
    if (usuarioSalvo) {
      try {
        const dados = JSON.parse(usuarioSalvo);
        setUsuarioLogado(dados);
      } catch (e) {
        localStorage.removeItem('boxb1_user_session');
      }
    }
    setCarregandoSessao(false);
  }, []);

  const lidarComSucessoLogin = (role: 'admin' | 'funcionario', email: string) => {
    const dadosSessao = { role, email };
    setUsuarioLogado(dadosSessao);
    localStorage.setItem('boxb1_user_session', JSON.stringify(dadosSessao));
  };

  const lidarComLogout = () => {
    setUsuarioLogado(null);
    localStorage.removeItem('boxb1_user_session');
  };

  if (carregandoSessao) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <p className="text-sm font-medium animate-pulse text-gray-400">Carregando Sistema BOXB1...</p>
      </div>
    );
  }

  // Roteamento condicional baseado no perfil autenticado
  if (!usuarioLogado) {
    return <Login onLoginSuccess={lidarComSucessoLogin} />;
  }

  if (usuarioLogado.role === 'admin') {
    return <AdminDashboard emailUsuario={usuarioLogado.email} onLogout={lidarComLogout} />;
  }

  return <FuncionarioDashboard emailUsuario={usuarioLogado.email} onLogout={lidarComLogout} />;
}