'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './app/components/Login';
import AdminDashboard from './app/components/AdminDashboard';
import FuncionarioDashboard from './app/components/FuncionarioDashboard';

export default function Home() {
  const [sessaoAtiva, setSessaoAtiva] = useState<boolean>(false);
  const [cargoUsuario, setCargoUsuario] = useState<'admin' | 'funcionario' | null>(null);
  const [emailUsuario, setEmailUsuario] = useState<string>('');
  const [carregandoSessao, setCarregandoSessao] = useState<boolean>(true);

  useEffect(() => {
    // Verifica se já existe uma sessão ativa no Supabase ao carregar a página
    const verificarSessaoExistente = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          const email = session.user.email || '';
          setEmailUsuario(email);

          // Busca o perfil/cargo real na tabela 'perfis'
          const { data: perfilData } = await supabase
            .from('perfis')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (perfilData) {
            setCargoUsuario(perfilData.role as 'admin' | 'funcionario');
          } else {
            // Fallback de segurança caso o perfil não venha preenchido
            setCargoUsuario(email.includes('izaias') ? 'admin' : 'funcionario');
          }
          
          setSessaoAtiva(true);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
      } finally {
        setCarregandoSessao(false);
      }
    };

    verificarSessaoExistente();
  }, []);

  const lidarComLoginSucesso = (role: 'admin' | 'funcionario', email: string) => {
    setCargoUsuario(role);
    setEmailUsuario(email);
    setSessaoAtiva(true);
  };

  const lidarComLogout = async () => {
    await supabase.auth.signOut();
    setSessaoAtiva(false);
    setCargoUsuario(null);
    setEmailUsuario('');
    localStorage.removeItem('boxb1_user');
  };

  if (carregandoSessao) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-semibold tracking-wider">Carregando Sistema BOXB1...</span>
        </div>
      </div>
    );
  }

  // Se não estiver logado, exibe a tela de Login
  if (!sessaoAtiva) {
    return <Login onLoginSuccess={lidarComLoginSucesso} />;
  }

  // Se o usuário logado for 'admin' (Izaias), renderiza exclusivamente o painel de diretoria completo
  if (cargoUsuario === 'admin') {
    return <AdminDashboard emailUsuario={emailUsuario} onLogout={lidarComLogout} />;
  }

  // Se for 'funcionario', renderiza apenas o painel operacional restrito (sem financeiro ou contador)
  return <FuncionarioDashboard emailUsuario={emailUsuario} onLogout={lidarComLogout} />;
}