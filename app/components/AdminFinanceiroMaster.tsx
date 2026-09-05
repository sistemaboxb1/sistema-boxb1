'use client';

import React, { useState } from 'react';

interface TransacaoFinanceira {
  id: string;
  origem: 'servico_os' | 'revenda_peca' | 'boleto_pagar';
  descricao: string;
  categoria: string;
  valorEntrada: number;
  valorSaida: number;
  lucroPeca?: number;
  data: string;
  status: 'quitado' | 'pendente';
}

export default function AdminFinanceiroMaster() {
  // Estados do Lucro de Peças (Preço de Custo x Preço de Venda)
  const [pecaNome, setPecaNome] = useState<string>('');
  const [precoCusto, setPrecoCusto] = useState<string>('');
  const [precoVenda, setPrecoVenda] = useState<string>('');
  
  // Lista unificada de transações financeiras integradas
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([
    {
      id: 'TR-01',
      origem: 'servico_os',
      descricao: 'Mão de Obra - Troca de Embreagem (Golf GTI)',
      categoria: 'Serviço Mecânico',
      valorEntrada: 450.00,
      valorSaida: 0,
      data: '2026-09-05',
      status: 'quitado'
    },
    {
      id: 'TR-02',
      origem: 'revenda_peca',
      descricao: 'Kit Embreagem Corsa (Custo: R$ 300 / Venda: R$ 550)',
      categoria: 'Revenda de Peças',
      valorEntrada: 550.00,
      valorSaida: 300.00,
      lucroPeca: 250.00,
      data: '2026-09-05',
      status: 'quitado'
    },
    {
      id: 'TR-03',
      origem: 'boleto_pagar',
      descricao: 'Boleto Fornecedor AutoPeças Master (Vencimento próximo)',
      categoria: 'Contas a Pagar / Boletos',
      valorEntrada: 0,
      valorSaida: 830.00,
      data: '2026-09-20',
      status: 'pendente'
    }
  ]);

  const registrarLucroPeca = (e: React.FormEvent) => {
    e.preventDefault();
    const custo = parseFloat(precoCusto) || 0;
    const venda = parseFloat(precoVenda) || 0;
    const lucro = venda - custo;

    if (!pecaNome.trim()) return;

    const novaTransacao: TransacaoFinanceira = {
      id: `TR-${Math.floor(100 + Math.random() * 900)}`,
      origem: 'revenda_peca',
      descricao: `Peça: ${pecaNome.trim()} (Custo: R$ ${custo.toFixed(2)} | Venda: R$ ${venda.toFixed(2)})`,
      categoria: 'Revenda de Peças',
      valorEntrada: venda,
      valorSaida: custo,
      lucroPeca: lucro,
      data: new Date().toISOString().split('T')[0],
      status: 'quitado'
    };

    setTransacoes([novaTransacao, ...transacoes]);
    setPecaNome('');
    setPrecoCusto('');
    setPrecoVenda('');
  };

  // Cálculos consolidados para a diretoria saber o lucro real
  const totalEntradas = transacoes.filter(t => t.status === 'quitado').reduce((acc, t) => acc + t.valorEntrada, 0);
  const totalSaidasPecas = transacoes.filter(t => t.status === 'quitado').reduce((acc, t) => acc + t.valorSaida, 0);
  const totalLucroPecas = transacoes.reduce((acc, t) => acc + (t.lucroPeca || 0), 0);
  const saldoLiquidoCaixa = totalEntradas - totalSaidasPecas;

  return (
    <div className="space-y-8">
      
      {/* Cabeçalho */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Módulo Financeiro Master & Lucratividade</h2>
          <p className="text-sm text-gray-400 mt-1">Visão integrada de ordens de serviço, boletos pagos e margem de lucro de revenda de peças.</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl text-green-400 text-xs font-semibold">
          Integração Ativa: Clientes + Comanda + Boletos
        </div>
      </div>

      {/* Cards de Indicadores de Lucro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md border-l-4 border-l-green-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Entradas Totais (Bruto)</p>
          <p className="text-2xl font-black text-green-400 mt-2">R$ {totalEntradas.toFixed(2)}</p>
          <span className="text-[11px] text-gray-500 mt-1 block">Serviços e vendas de balcão/pista</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md border-l-4 border-l-yellow-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Lucro Real em Peças</p>
          <p className="text-2xl font-black text-yellow-400 mt-2">R$ {totalLucroPecas.toFixed(2)}</p>
          <span className="text-[11px] text-gray-500 mt-1 block">Margem (Venda menos Custo)</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md border-l-4 border-l-red-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Saídas / Custos de Peças</p>
          <p className="text-2xl font-black text-red-400 mt-2">R$ {totalSaidasPecas.toFixed(2)}</p>
          <span className="text-[11px] text-gray-500 mt-1 block">Pago aos fornecedores</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Saldo Líquido em Caixa</p>
          <p className="text-2xl font-black text-blue-400 mt-2">R$ {saldoLiquidoCaixa.toFixed(2)}</p>
          <span className="text-[11px] text-gray-500 mt-1 block">Balanço geral deduzido</span>
        </div>
      </div>

      {/* Painel Dedicado: Calculadora de Lucro de Peças */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white">Cadastrar Margem de Lucro de Peça Vendida</h3>
        <p className="text-xs text-gray-400">Informe quanto você pagou no fornecedor e quanto cobrou do cliente para calcular automaticamente o lucro da peça.</p>

        <form onSubmit={registrarLucroPeca} className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Nome / Descrição da Peça</label>
            <input 
              type="text" 
              value={pecaNome}
              onChange={(e) => setPecaNome(e.target.value)}
              placeholder="Ex: Amortecedor Dianteiro"
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Preço de Custo (Pago p/ Fornecedor)</label>
            <input 
              type="number" 
              step="0.01"
              value={precoCusto}
              onChange={(e) => setPrecoCusto(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Preço de Venda (Cobrado c/ Cliente)</label>
            <input 
              type="number" 
              step="0.01"
              value={precoVenda}
              onChange={(e) => setPrecoVenda(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              required
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-all cursor-pointer shadow-md"
            >
              Registrar Peça e Calcular Lucro
            </button>
          </div>
        </form>
      </div>

      {/* Histórico Integrado de Transações */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white">Extrato Consolidado do Caixa e Despesas</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-400">
            <thead className="bg-gray-950 uppercase text-gray-300 border-b border-gray-800">
              <tr>
                <th className="px-4 py-3">Origem / Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Entrada (Receita)</th>
                <th className="px-4 py-3">Saída (Custo/Boleto)</th>
                <th className="px-4 py-3">Lucro da Peça</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {transacoes.map((t) => (
                <tr key={t.id} className="hover:bg-gray-950/50">
                  <td className="px-4 py-4 font-medium text-white">{t.descricao}</td>
                  <td className="px-4 py-4">{t.categoria}</td>
                  <td className="px-4 py-4 text-green-400 font-bold">{t.valorEntrada > 0 ? `+ R$ ${t.valorEntrada.toFixed(2)}` : '-'}</td>
                  <td className="px-4 py-4 text-red-400 font-bold">{t.valorSaida > 0 ? `- R$ ${t.valorSaida.toFixed(2)}` : '-'}</td>
                  <td className="px-4 py-4 text-yellow-400 font-bold">{t.lucroPeca !== undefined ? `R$ ${t.lucroPeca.toFixed(2)}` : 'N/A'}</td>
                  <td className="px-4 py-4">{t.data}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'quitado' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}