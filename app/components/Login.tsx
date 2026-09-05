'use client';

import React, { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLoginSuccess: (role: 'admin' | 'funcionario', email: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);
  const [lembrarUsuario, setLembrarUsuario] = useState<boolean>(false);

  const lidarComLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const emailLimpo = email.trim().toLowerCase();

      // 1. Autenticação real via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailLimpo,
        password: senha,
      });

      if (authError || !authData.user) {
        setErro('E-mail ou senha incorretos. Verifique suas credenciais.');
        setCarregando(false);
        return;
      }

      // 2. Busca o cargo (role) correspondente na tabela 'perfis'
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfis')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (perfilError || !perfilData) {
        setErro('Usuário autenticado, mas o perfil de acesso não foi encontrado.');
        setCarregando(false);
        return;
      }

      const cargo = perfilData.role as 'admin' | 'funcionario';

      if (lembrarUsuario) {
        localStorage.setItem('boxb1_user', emailLimpo);
      }

      onLoginSuccess(cargo, emailLimpo);
    } catch (err) {
      setErro('Ocorreu um erro inesperado ao conectar ao banco de dados.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-gray-900 border border-gray-800 p-8 shadow-2xl transition-all duration-300">
        
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-wider text-white">
            BOX<span className="text-yellow-500">B1</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-400">
            Sistema de Gestão Automotiva Profissional
          </p>
        </div>

        {erro && (
          <div 
            role="alert" 
            className="rounded-lg border border-red-800/60 bg-red-950/40 p-4 text-center text-sm font-medium text-red-300 shadow-inner animate-pulse"
          >
            {erro}
          </div>
        )}

        <form onSubmit={lidarComLogin} className="mt-8 space-y-6" noValidate>
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="email-address" 
                className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1"
              >
                E-mail de Acesso
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white placeholder-gray-500 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="exemplo@boxb1.com"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white placeholder-gray-500 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={lembrarUsuario}
                onChange={(e) => setLembrarUsuario(e.target.checked)}
                className="h-4 w-4 rounded border-gray-700 bg-gray-950 text-blue-600 focus:ring-blue-500/20"
              />
              <span className="ml-2 text-xs">Lembrar de mim</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full flex justify-center items-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {carregando ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Conectando ao Supabase...</span>
              </span>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>

      </div>
    </main>
  );
}