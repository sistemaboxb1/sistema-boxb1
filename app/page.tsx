// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import FuncionarioDashboard from './components/FuncionarioDashboard';

export default function Home() {
  const [sessao, setSessao] = useState<any>(null);
  const [emailInput, setEmailInput] = useState<string>('');
  const [senhaInput, setSenhaInput] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erroLogin, setErroLogin] = useState<string>('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessao(session);
      setCarregando(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessao(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLogin('');
    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.trim(),
        password: senhaInput,
      });

      if (error) throw error;
      setSessao(data.session);
    } catch (err: any) {
      setErroLogin(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSessao(null);
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white text-xs">
        Carregando sistema BOXB1...
      </div>
    );
  }

  if (!sessao) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-white">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
          <div>
            <h1 className="text-3xl font-black tracking-wider text-white">
              BOX<span className="text-yellow-500">B1</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">Sistema de Gestão para Oficina Mecânica</p>
          </div>

          {erroLogin && (
            <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-lg text-xs text-red-300 font-semibold">
              {erroLogin}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">E-mail de Acesso</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="seu-email@boxb1.com"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Senha</label>
              <input
                type="password"
                value={senhaInput}
                onChange={(e) => setSenhaInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-lg transition-all cursor-pointer shadow-lg"
            >
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  const emailUsuario = sessao.user?.email || '';

  return (
    <FuncionarioDashboard emailUsuario={emailUsuario} onLogout={handleLogout} />
  );
}