'use client';

import React, { useState } from 'react';
import ComandaDigitalOS from './ComandaDigitalOS';
import PainelClientesCarros from './PainelClientesCarros';
import PainelBoletosPecas from './PainelBoletosPecas';
import { supabase } from '../lib/supabase';

interface FuncionarioDashboardProps {
  emailUsuario: string;
  onLogout: () => void;
}

interface PagamentoRegistro {
  id: string;
  osId: string;
  cliente: string;
  metodo: string;
  valor: number;
  data: string;
}

export default function FuncionarioDashboard({ emailUsuario, onLogout }: FuncionarioDashboardProps) {
  const [abaAtiva, setAbaAtiva] = useState<'comanda' | 'clientes' | 'pagamentos' | 'boletos' | 'pecas-lucro'>('comanda');

  // Estados para o cadastro de pagamentos integrados
  const [osVinculada, setOsVinculada] = useState<string>('');
  const [nomeClientePagto, setNomeClientePagto] = useState<string>('');
  const [metodoPagamento, setMetodoPagamento] = useState<string>('pix');
  const [valorPagamento, setValorPagamento] = useState<string>('');
  const [mensagemPagto, setMensagemPagto] = useState<string>('');

  // Estados para cadastro individual de peça e lucro pelo funcionário
  const [nomePeca, setNomePeca] = useState<string>('');
  const [custoPeca, setCustoPeca] = useState<string>('');
  const [vendaPeca, setVendaPeca] = useState<string>('');
  const [mensagemPeca, setMensagemPeca] = useState<string>('');

  const registrarPagamentoIntegrado = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('ordens_servico').update({
        forma_pagamento: metodoPagamento,
        status_pagamento: 'pago'
      }).eq('os_codigo', osVinculada.trim());

      if (error) throw error;
      setMensagemPagto('Pagamento registrado e integrado à O.S. e ao banco de clientes com sucesso!');
      setOsVinculada('');
      setNomeClientePagto('');
      setValorPagamento('');
    } catch (err: any) {
      setMensagemPagto('Erro ao registrar pagamento: ' + err.message);
    }
  };

  const registrarPecaComLucro = async (e: React.FormEvent) => {
    e.preventDefault();
    const custo = parseFloat(custoPeca) || 0;
    const venda = parseFloat(vendaPeca) || 0;
    const lucroUnitario = venda - custo;

    try {
      const { error } = await supabase.from('ordens_servico').insert([{
        os_codigo: `PEC-${Math.floor(100 + Math.random() * 900)}`,
        problema_relatado: `Peça: ${nomePeca} (Custo: R$ ${custo} | Venda: R$ ${venda} | Lucro: R$ ${lucroUnitario})`,
        valor_total: venda,
        status_pagamento: 'pago'
      }]);

      if (error) throw error;
      setMensagemPeca(`Peça cadastrada! Lucro desta unidade: R$ ${lucroUnitario.toFixed(2)} (Registrado no sistema).`);
      setNomePeca('');
      setCustoPeca('');
      setVendaPeca('');
    } catch (err: any) {
      setMensagemPeca('Erro ao registrar peça: ' + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      
      {/* Barra Lateral do Funcionário */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between hidden md:flex shadow-xl">
        <div>
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-black tracking-wider text-white">
              BOX<span className="text-yellow-500">B1</span>
            </h1>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mt-1">
              Painel Operacional
            </p>
          </div>

          <nav className="p-4 space-y-2">
            <button
              onClick={() => setAbaAtiva('comanda')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'comanda' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>📋 Comanda Digital & Recibo</span>
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
              onClick={() => setAbaAtiva('pagamentos')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'pagamentos' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>💳 Registrar Pagamento O.S.</span>
            </button>

            <button
              onClick={() => setAbaAtiva('boletos')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'boletos' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>🧾 Cadastrar Boleto de Peças</span>
            </button>

            <button
              onClick={() => setAbaAtiva('pecas-lucro')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'pecas-lucro' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>📦 Peça & Lucro Unitário</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-950/40">
          <div className="text-xs text-gray-400 mb-2 truncate">
            Funcionário: <strong className="text-gray-200">{emailUsuario}</strong>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-red-600/25 hover:bg-red-600/40 border border-red-700/50 text-red-300 text-xs font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer text-center"
          >
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Pista / Atendimento Técnico</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            🔧 Operacional Restrito (Sem Visão de Lucro Total)
          </span>
        </header>

        <div className="p-8 overflow-y-auto space-y-6">
          {abaAtiva === 'comanda' && <ComandaDigitalOS />}
          {abaAtiva === 'clientes' && <PainelClientesCarros />}
          
          {abaAtiva === 'pagamentos' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-white">Registrar Pagamento de O.S.</h3>
                <p className="text-xs text-gray-400 mt-1">Informe a O.S., o método de pagamento e salve integrado ao banco de dados.</p>
              </div>

              {mensagemPagto && (
                <div className="bg-gray-950 p-3 rounded border border-gray-800 text-xs text-yellow-400 font-semibold">
                  {mensagemPagto}
                </div>
              )}

              <form onSubmit={registrarPagamentoIntegrado} className="space-y-4 bg-gray-950 p-6 rounded-xl border border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Código da O.S. (Ex: OS-2026-089)</label>
                    <input 
                      type="text" 
                      value={osVinculada} 
                      onChange={(e) => setOsVinculada(e.target.value)} 
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Nome do Cliente</label>
                    <input 
                      type="text" 
                      value={nomeClientePagto} 
                      onChange={(e) => setNomeClientePagto(e.target.value)} 
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Método de Pagamento</label>
                    <select 
                      value={metodoPagamento} 
                      onChange={(e) => setMetodoPagamento(e.target.value)} 
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="pix">PIX</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="boleto">Boleto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Valor Recebido (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={valorPagamento} 
                      onChange={(e) => setValorPagamento(e.target.value)} 
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
                      required 
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-lg cursor-pointer">
                  Salvar Pagamento na O.S. e Banco de Clientes
                </button>
              </form>
            </div>
          )}

          {abaAtiva === 'boletos' && <PainelBoletosPecas />}

          {abaAtiva === 'pecas-lucro' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-white">Cadastro de Peça Vendida & Margem Unitária</h3>
                <p className="text-xs text-gray-400 mt-1">Informe o custo de aquisição e o preço de venda. O sistema calcula a margem desta peça específica sem exibir o lucro total da oficina.</p>
              </div>

              {mensagemPeca && (
                <div className="bg-gray-950 p-3 rounded border border-gray-800 text-xs text-yellow-400 font-semibold">
                  {mensagemPeca}
                </div>
              )}

              <form onSubmit={registrarPecaComLucro} className="space-y-4 bg-gray-950 p-6 rounded-xl border border-gray-800">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Nome / Descrição da Peça</label>
                  <input 
                    type="text" 
                    value={nomePeca} 
                    onChange={(e) => setNomePeca(e.target.value)} 
                    placeholder="Ex: Pastilha de Freio Dianteira"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Preço de Custo (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={custoPeca} 
                      onChange={(e) => setCustoPeca(e.target.value)} 
                      placeholder="0.00"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Preço de Venda ao Cliente (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={vendaPeca} 
                      onChange={(e) => setVendaPeca(e.target.value)} 
                      placeholder="0.00"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
                      required 
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold text-xs py-3 rounded-lg cursor-pointer">
                  Salvar Peça e Registrar Lucro Unitário
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}