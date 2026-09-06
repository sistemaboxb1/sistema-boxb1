// app/components/AdminDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminFinanceiroMaster from './AdminFinanceiroMaster';

interface AdminDashboardProps {
  emailUsuario: string;
  onLogout: () => void;
}

export default function AdminDashboard({ emailUsuario, onLogout }: AdminDashboardProps) {
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'master' | 'pecas' | 'clientes'>('geral');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [estatisticas, setEstatisticas] = useState({
    totalOrdens: 0,
    faturamentoTotal: 0,
    clientesCount: 0,
    pecasCount: 0
  });

  useEffect(() => {
    carregarResumoAdmin();
  }, []);

  const carregarResumoAdmin = async () => {
    setCarregando(true);
    try {
      const { data: osData } = await supabase.from('ordens_servico').select('*');
      const { data: cliData } = await supabase.from('clientes').select('id');
      const { data: pecData } = await supabase.from('pecas_cadastradas').select('id');

      const totalOrdens = osData?.length || 0;
      const faturamentoTotal = (osData || []).reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);

      setEstatisticas({
        totalOrdens,
        faturamentoTotal,
        clientesCount: cliData?.length || 0,
        pecasCount: pecData?.length || 0
      });
    } catch (err) {
      console.error('Erro ao carregar dados do admin:', err);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between hidden md:flex shadow-xl">
        <div>
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-black tracking-wider text-white">
              BOX<span className="text-yellow-500">B1</span>
            </h1>
            <p className="text-xs font-semibold text-yellow-500 uppercase tracking-widest mt-1">
              Painel Diretoria
            </p>
          </div>

          <nav className="p-4 space-y-2">
            <button
              onClick={() => setAbaAtiva('geral')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'geral' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>📊 Visão Geral da Oficina</span>
            </button>

            <button
              onClick={() => setAbaAtiva('master')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'master' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>👑 Painel Financeiro Master</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-950/40">
          <div className="text-xs text-gray-400 mb-2 truncate">
            Admin: <strong className="text-gray-200">{emailUsuario}</strong>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-red-600/25 hover:bg-red-600/40 border border-red-700/50 text-red-300 text-xs font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer text-center"
          >
            Encerrar Sessão
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Diretoria / Painel Executivo</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            🛡️ Acesso Administrativo Autorizado
          </span>
        </header>

        <div className="p-8 overflow-y-auto space-y-6">
          {abaAtiva === 'geral' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-white">Resumo Consolidado do Negócio</h3>
                <p className="text-xs text-gray-400 mt-1">Acompanhe os principais indicadores lançados pela equipe na oficina.</p>
              </div>

              {carregando ? (
                <div className="text-xs text-gray-400">Carregando métricas...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
                    <span className="text-xs uppercase font-bold text-gray-400">Faturamento Consolidado</span>
                    <h2 className="text-2xl font-black text-green-400 mt-2">R$ {estatisticas.faturamentoTotal.toFixed(2)}</h2>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
                    <span className="text-xs uppercase font-bold text-gray-400">Total de O.S.</span>
                    <h2 className="text-2xl font-black text-yellow-500 mt-2">{estatisticas.totalOrdens}</h2>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
                    <span className="text-xs uppercase font-bold text-gray-400">Clientes Cadastrados</span>
                    <h2 className="text-2xl font-black text-blue-400 mt-2">{estatisticas.clientesCount}</h2>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
                    <span className="text-xs uppercase font-bold text-gray-400">Peças Lançadas</span>
                    <h2 className="text-2xl font-black text-purple-400 mt-2">{estatisticas.pecasCount}</h2>
                  </div>
                </div>
              )}
            </div>
          )}

          {abaAtiva === 'master' && (
            <AdminFinanceiroMaster emailUsuario={emailUsuario} onLogout={onLogout} />
          )}
        </div>
      </main>

    </div>
  );
}