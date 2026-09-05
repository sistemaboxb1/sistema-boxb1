'use client';

import React, { useState } from 'react';

/**
 * Interface de propriedades do painel de funcionários.
 * Controla o fluxo de trabalho diário na oficina e o encerramento da sessão.
 */
interface FuncionarioDashboardProps {
  emailUsuario: string;
  onLogout: () => void;
}

export default function FuncionarioDashboard({ emailUsuario, onLogout }: FuncionarioDashboardProps) {
  // Variáveis de estado para gerenciar as ordens de serviço e status da aba operacional
  const [abaAtiva, setAbaAtiva] = useState<'minhas-ordens' | 'nova-os' | 'clientes'>('minhas-ordens');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      
      {/* Barra Lateral do Funcionário */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo do Sistema BOXB1 na Lateral */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-black tracking-wider text-white">
              BOX<span className="text-yellow-500">B1</span>
            </h1>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mt-1">
              Painel Operacional
            </p>
          </div>

          {/* Menu de Navegação do Funcionário */}
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setAbaAtiva('minhas-ordens')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'minhas-ordens' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>📋 Ordens de Serviço</span>
            </button>

            <button
              onClick={() => setAbaAtiva('nova-os')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'nova-os' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>➕ Abrir Nova O.S.</span>
            </button>

            <button
              onClick={() => setAbaAtiva('clientes')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'clientes' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>🚗 Consulta de Clientes</span>
            </button>
          </nav>
        </div>

        {/* Rodapé da Sidebar do Funcionário */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/40">
          <div className="text-xs text-gray-400 mb-2 truncate">
            Funcionário: <strong className="text-gray-200">{emailUsuario}</strong>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-700/50 text-red-300 text-xs font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer text-center"
          >
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal do Painel Operacional */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Barra Superior */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Pista / Atendimento Oficina</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              🔧 Operacional Ativo
            </span>
          </div>
        </header>

        {/* Área Dinâmica do Funcionário */}
        <div className="p-8 overflow-y-auto space-y-6">
          
          {/* Banner de Boas-Vindas */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">Controle de Ordens de Serviço</h2>
              <p className="text-sm text-gray-400 mt-1">Acompanhe os veículos na oficina, atualize o status dos reparos e registre peças utilizadas.</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-xl text-yellow-400 text-xs font-semibold">
              BOXB1 - Oficina Mecânica
            </div>
          </div>

          {/* Filtros e Ações Rápidas */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900 border border-gray-800 p-4 rounded-xl">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-gray-400 uppercase">Filtrar:</span>
              <select 
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="bg-gray-950 border border-gray-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="todos">Todos os Status</option>
                <option value="em-andamento">Em Andamento</option>
                <option value="aguardando-pecas">Aguardando Peças</option>
                <option value="concluido">Concluídos</option>
              </select>
            </div>
            <div className="text-xs text-gray-400">
              Exibindo ordens ativas para o turno de hoje.
            </div>
          </div>

          {/* Bloco de Listagem Dinâmica */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">
              {abaAtiva === 'minhas-ordens' && 'Ordens de Serviço em Aberto'}
              {abaAtiva === 'nova-os' && 'Cadastrar Nova Ordem de Serviço'}
              {abaAtiva === 'clientes' && 'Base de Dados de Veículos e Clientes'}
            </h3>

            <div className="border border-dashed border-gray-800 rounded-xl p-12 text-center text-gray-500 text-sm">
              {abaAtiva === 'minhas-ordens' && 'Tabela interativa com placas, modelos de carros, defeitos relatados e botões de atualização de status.'}
              {abaAtiva === 'nova-os' && 'Formulário completo para abertura de O.S. com dados do cliente, veículo e serviços solicitados.'}
              {abaAtiva === 'clientes' && 'Histórico de manutenções anteriores por cliente e placa do veículo.'}
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}