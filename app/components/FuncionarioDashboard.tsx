'use client';

import React, { useState } from 'react';
import ComandaDigitalOS from './ComandaDigitalOS';
import PainelClientesCarros from './PainelClientesCarros';

interface FuncionarioDashboardProps {
  emailUsuario: string;
  onLogout: () => void;
}

export default function FuncionarioDashboard({ emailUsuario, onLogout }: FuncionarioDashboardProps) {
  // Estados para gerenciar as abas especializadas do painel operacional do funcionário
  const [abaAtiva, setAbaAtiva] = useState<'comanda' | 'clientes' | 'historico' | 'suporte'>('comanda');

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      
      {/* Barra Lateral de Navegação (Sidebar do Funcionário) */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between hidden md:flex shadow-xl">
        <div>
          {/* Logo do Sistema BOXB1 na Lateral */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-black tracking-wider text-white">
              BOX<span className="text-yellow-500">B1</span>
            </h1>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mt-1">
              Painel Operacional (Funcionário)
            </p>
          </div>

          {/* Menu de Opções Modulares Detalhado */}
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setAbaAtiva('comanda')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'comanda' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>📋 Comanda Digital & O.S.</span>
            </button>

            <button
              onClick={() => setAbaAtiva('clientes')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'clientes' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>🚗 Cadastrar Cliente & Carro</span>
            </button>

            <button
              onClick={() => setAbaAtiva('historico')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'historico' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>🔍 Histórico da Pista</span>
            </button>

            <button
              onClick={() => setAbaAtiva('suporte')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'suporte' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>🛠️ Manuais & Suporte</span>
            </button>
          </nav>
        </div>

        {/* Rodapé da Sidebar com Identificação do Operador */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/40">
          <div className="text-xs text-gray-400 mb-2 truncate">
            Funcionário: <strong className="text-gray-200">{emailUsuario}</strong>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-red-600/25 hover:bg-red-600/40 border border-red-700/50 text-red-300 text-xs font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer text-center shadow-inner"
          >
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal da Página Operacional */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Barra Superior */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Pista / Atendimento Técnico Automotivo</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
              🔧 Operacional Ativo
            </span>
          </div>
        </header>

        {/* Área Dinâmica baseada na Aba Selecionada com Extensividade */}
        <div className="p-8 overflow-y-auto space-y-6">
          
          {abaAtiva === 'comanda' && <ComandaDigitalOS />}

          {abaAtiva === 'clientes' && <PainelClientesCarros />}

          {abaAtiva === 'historico' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-900 to-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-black text-white">Histórico de Ordens da Pista</h2>
                <p className="text-sm text-gray-400 mt-1">Acompanhe o andamento dos veículos que passaram pela oficina mecânica do BOXB1.</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Veículos Concluídos e em Andamento na Semana</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-400">
                    <thead className="bg-gray-950 uppercase text-gray-300 border-b border-gray-800">
                      <tr>
                        <th className="px-4 py-3">O.S. Ref</th>
                        <th className="px-4 py-3">Cliente / Veículo</th>
                        <th className="px-4 py-3">Placa</th>
                        <th className="px-4 py-3">Status Atual</th>
                        <th className="px-4 py-3">Data Chegada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      <tr className="hover:bg-gray-950/50">
                        <td className="px-4 py-4 font-bold text-white">OS-2026-089</td>
                        <td className="px-4 py-4 text-white">Carlos Eduardo (Golf GTI)</td>
                        <td className="px-4 py-4 font-mono text-yellow-500">XYZ-9876</td>
                        <td className="px-4 py-4"><span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-bold">Em Manutenção</span></td>
                        <td className="px-4 py-4">05/09/2026</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {abaAtiva === 'suporte' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl space-y-4">
              <h3 className="text-xl font-black text-white">Manuais Técnicos e Orientações Operacionais</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Bem-vindo ao canal de suporte interno do BOXB1. Utilize as ferramentas de comanda digital para registrar todas as peças aplicadas e serviços executados na pista. Lembre-se de preencher corretamente o odômetro, o ano e a placa do veículo para manter o histórico do cliente sincronizado com o painel administrativo da diretoria.
              </p>
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs text-gray-400 space-y-2">
                <p><strong>• Regra 1:</strong> Sempre atualize a comanda digital caso haja inclusão de novas peças de revendedores.</p>
                <p><strong>• Regra 2:</strong> Emita o PDF para o cliente acompanhar os valores detalhados de cada serviço.</p>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}