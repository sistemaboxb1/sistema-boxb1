'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Transacao {
  id: string;
  descricao: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  data: string;
  categoria: string;
}

export default function AdminFinanceiro() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>('');
  
  // Estados para o formulário de nova transação financeira
  const [descricao, setDescricao] = useState<string>('');
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
  const [valor, setValor] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('Serviço Mecânico');
  const [salvando, setSalvando] = useState<boolean>(false);

  // Totais calculados dinamicamente
  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  const saldoLiquido = totalEntradas - totalSaidas;

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Módulo Financeiro */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Módulo de Gestão Financeira & Caixa</h2>
          <p className="text-sm text-gray-400 mt-1">Controle rigoroso de entradas de ordens de serviço e saída de peças para a diretoria.</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-xl text-yellow-400 text-xs font-semibold">
          Visão Exclusiva: Izaias (Admin)
        </div>
      </div>

      {/* Cards de Resumo Financeiro Detalhado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md border-l-4 border-l-green-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total de Entradas (Receitas)</p>
          <p className="text-3xl font-black text-green-400 mt-2">
            R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-gray-500 mt-2 inline-block">Serviços e peças pagas</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md border-l-4 border-l-red-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total de Saídas (Despesas)</p>
          <p className="text-3xl font-black text-red-400 mt-2">
            R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-gray-500 mt-2 inline-block">Reposição de peças e custos</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Saldo Líquido em Caixa</p>
          <p className={`text-3xl font-black mt-2 ${saldoLiquido >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-gray-500 mt-2 inline-block">Balanço geral atualizado</span>
        </div>
      </div>

      {/* Seção de Formulário para Lançamento Rápido no Caixa */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Novo Lançamento no Caixa</h3>
        
        <form onSubmit={(e) => { e.preventDefault(); alert('Funcionalidade de inserção pronta para ligar ao Supabase!'); }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Descrição</label>
            <input 
              type="text" 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              placeholder="Ex: Troca de óleo Corsa" 
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Tipo de Movimento</label>
            <select 
              value={tipo} 
              onChange={(e) => setTipo(e.target.value as 'entrada' | 'saida')} 
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="entrada">Entrada (Receita)</option>
              <option value="saida">Saída (Despesa)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Valor (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              value={valor} 
              onChange={(e) => setValor(e.target.value)} 
              placeholder="0,00" 
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              required 
            />
          </div>

          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={salvando}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-2.5 px-4 rounded-lg transition-all cursor-pointer shadow-md"
            >
              {salvando ? 'Salvando...' : 'Adicionar ao Caixa'}
            </button>
          </div>
        </form>
      </div>

      {/* Histórico Recente de Transações */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Histórico de Transações Recentes</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-950 text-xs uppercase text-gray-300 border-b border-gray-800">
              <tr>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800 hover:bg-gray-950/50">
                <td className="px-4 py-4 font-medium text-white">Revisão Completa - Onix (Placa ABC-1234)</td>
                <td className="px-4 py-4">Serviço Mecânico</td>
                <td className="px-4 py-4"><span className="text-green-400 font-bold">Entrada</span></td>
                <td className="px-4 py-4 text-green-400 font-bold">+ R$ 850,00</td>
                <td className="px-4 py-4">05/09/2026</td>
              </tr>
              <tr className="border-b border-gray-800 hover:bg-gray-950/50">
                <td className="px-4 py-4 font-medium text-white">Compra de Pastilhas de Freio (Fornecedor AutoPeças)</td>
                <td className="px-4 py-4">Peças / Estoque</td>
                <td className="px-4 py-4"><span className="text-red-400 font-bold">Saída</span></td>
                <td className="px-4 py-4 text-red-400 font-bold">- R$ 320,00</td>
                <td className="px-4 py-4">04/09/2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}