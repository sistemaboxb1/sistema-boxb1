'use client';

import React, { useState } from 'react';
import AdminFinanceiro from './AdminFinanceiro';
import RelatorioContadorCartao from './RelatorioContadorCartao';

interface AdminDashboardProps {
  emailUsuario: string;
  onLogout: () => void;
}

export default function AdminDashboard({ emailUsuario, onLogout }: AdminDashboardProps) {
  // Estados para gerenciar as abas especializadas da diretoria
  const [abaAtiva, setAbaAtiva] = useState<'visao-geral' | 'financeiro' | 'contador' | 'equipe' | 'configuracoes'>('visao-geral');

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      
      {/* Barra Lateral de Navegação (Sidebar) */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo do Sistema BOXB1 na Lateral */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-black tracking-wider text-white">
              BOX<span className="text-yellow-500">B1</span>
            </h1>
            <p className="text-xs font-semibold text-yellow-500/80 uppercase tracking-widest mt-1">
              Painel Diretoria (Admin)
            </p>
          </div>

          {/* Menu de Opções Modulares */}
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setAbaAtiva('visao-geral')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'visao-geral' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>📊 Visão Geral</span>
            </button>

            <button
              onClick={() => setAbaAtiva('financeiro')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'financeiro' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>💰 Caixa & Lançamentos</span>
            </button>

            <button
              onClick={() => setAbaAtiva('contador')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'contador' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>📑 Relatório Fiscal (Contador)</span>
            </button>

            <button
              onClick={() => setAbaAtiva('equipe')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'equipe' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>👥 Gestão de Equipe</span>
            </button>

            <button
              onClick={() => setAbaAtiva('configuracoes')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'configuracoes' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>⚙️ Configurações</span>
            </button>
          </nav>
        </div>

        {/* Rodapé da Sidebar com Identificação do Gestor */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/40">
          <div className="text-xs text-gray-400 mb-2 truncate">
            Logado como: <strong className="text-gray-200">{emailUsuario}</strong>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-700/50 text-red-300 text-xs font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer text-center"
          >
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal da Página */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Barra Superior */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Módulo Administrativo Master</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              ⚡ Modo Gerencial Ativo
            </span>
          </div>
        </header>

        {/* Área Dinâmica baseada na Aba Selecionada */}
        <div className="p-8 overflow-y-auto space-y-6">
          
          {abaAtiva === 'visao-geral' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-900 to-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">Olá, Izaias. Bem-vindo ao BOXB1!</h2>
                  <p className="text-sm text-gray-400 mt-1">O sistema está operando perfeitamente e integrado ao Supabase.</p>
                </div>
                <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-xl text-blue-400 text-xs font-semibold">
                  Oficina Automotiva Autorizada
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ordens em Andamento</p>
                  <p className="text-3xl font-black text-white mt-2">12</p>
                  <span className="text-xs text-blue-400 mt-2 inline-block">↗ 4 finalizadas hoje</span>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Faturamento do Dia</p>
                  <p className="text-3xl font-black text-yellow-500 mt-2">R$ 3.450</p>
                  <span className="text-xs text-gray-500 mt-2 inline-block">Meta diária: R$ 3.000</span>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Peças em Estoque Baixo</p>
                  <p className="text-3xl font-black text-red-400 mt-2">3</p>
                  <span className="text-xs text-red-500 mt-2 inline-block">⚠️ Requer reposição</span>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Funcionários Ativos</p>
                  <p className="text-3xl font-black text-white mt-2">5</p>
                  <span className="text-xs text-green-400 mt-2 inline-block">🟢 Todos presentes</span>
                </div>
              </div>
            </div>
          )}

          {abaAtiva === 'financeiro' && <AdminFinanceiro />}
          {abaAtiva === 'contador' && <RelatorioContadorCartao />}

          {abaAtiva === 'equipe' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Gestão de Equipe e Permissões</h3>
              <p className="text-sm text-gray-400">Módulo de controle de acessos dos mecânicos em desenvolvimento.</p>
            </div>
          )}

          {abaAtiva === 'configuracoes' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Configurações Avançadas</h3>
              <p className="text-sm text-gray-400">Parâmetros do sistema e backups em nuvem.</p>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}