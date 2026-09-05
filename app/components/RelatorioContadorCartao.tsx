'use client';

import React, { useState } from 'react';

interface TransacaoCartao {
  id: string;
  osId: string;
  cliente: string;
  data: string;
  valorBruto: number;
  tipoCartao: 'credito_avista' | 'credito_parcelado';
  parcelas: number;
  teveJuros: boolean;
  valorJuros: number;
  valorLiquidoRecebido: number;
  status: 'liquidado' | 'pendente_repasse';
}

export default function RelatorioContadorCartao() {
  // Estado para período e filtros do relatório fiscal
  const [mesReferencia, setMesReferencia] = useState<string>('2026-09');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');

  // Dados mockados robustos para demonstração ao contador
  const transacoesCartaoMock: TransacaoCartao[] = [
    {
      id: 'TR-101',
      osId: 'OS-2026-001',
      cliente: 'Carlos Alberto',
      data: '2026-09-04',
      valorBruto: 1200.00,
      tipoCartao: 'credito_parcelado',
      parcelas: 3,
      teveJuros: true,
      valorJuros: 45.00,
      valorLiquidoRecebido: 1155.00,
      status: 'liquidado'
    },
    {
      id: 'TR-102',
      osId: 'OS-2026-003',
      cliente: 'Mariana Souza',
      data: '2026-09-05',
      valorBruto: 450.00,
      tipoCartao: 'credito_avista',
      parcelas: 1,
      teveJuros: false,
      valorJuros: 0,
      valorLiquidoRecebido: 438.75, // Considerando taxa de operadora maquininha ex: 2.5%
      status: 'pendente_repasse'
    }
  ];

  // Cálculos consolidados para apuração fiscal
  const totalBrutoCartao = transacoesCartaoMock.reduce((acc, t) => acc + t.valorBruto, 0);
  const totalJurosConsolidado = transacoesCartaoMock.reduce((acc, t) => acc + t.valorJuros, 0);
  const totalLiquidoCartao = transacoesCartaoMock.reduce((acc, t) => acc + t.valorLiquidoRecebido, 0);

  const exportarRelatorioContador = () => {
    alert('Relatório fiscal de cartão de crédito formatado e pronto para envio ao contador!');
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-8">
      
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-white">Relatório Fiscal para Contador (Cartão de Crédito)</h3>
          <p className="text-xs text-gray-400 mt-1">
            Apuração detalhada de faturamento em cartão, parcelamentos e incidência de juros para cálculo de impostos.
          </p>
        </div>
        <div>
          <button 
            onClick={exportarRelatorioContador}
            className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md cursor-pointer flex items-center space-x-2"
          >
            <span>📥 Exportar Dados para Contador</span>
          </button>
        </div>
      </div>

      {/* Filtros de Apuração */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-950/60 p-4 rounded-xl border border-gray-800">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Mês de Referência (Fiscal)</label>
          <input 
            type="month" 
            value={mesReferencia}
            onChange={(e) => setMesReferencia(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Filtrar por Status</label>
          <select 
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
          >
            <option value="todos">Todas as Transações</option>
            <option value="liquidado">Liquidadas</option>
            <option value="pendente_repasse">Pendentes de Repasse</option>
          </select>
        </div>
      </div>

      {/* Cards de Totais Fiscais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Faturamento Bruto em Cartão</p>
          <p className="text-2xl font-black text-white mt-2">
            R$ {totalBrutoCartao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">Base total de vendas no crédito</span>
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total de Juros Cobrados</p>
          <p className="text-2xl font-black text-yellow-500 mt-2">
            R$ {totalJurosConsolidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">Repassados ao cliente no parcelamento</span>
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Valor Líquido Operadora</p>
          <p className="text-2xl font-black text-blue-400 mt-2">
            R$ {totalLiquidoCartao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">Líquido após taxas da maquininha</span>
        </div>
      </div>

      {/* Tabela Detalhada de Transações para Auditoria */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-xl">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Detalhamento Individual das Vendas</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-400">
            <thead className="bg-gray-900 uppercase text-gray-300 border-b border-gray-800">
              <tr>
                <th className="px-4 py-3">O.S. / Cliente</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Modalidade</th>
                <th className="px-4 py-3">Valor Bruto</th>
                <th className="px-4 py-3">Juros</th>
                <th className="px-4 py-3">Valor Líquido</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {transacoesCartaoMock.map((t) => (
                <tr key={t.id} className="hover:bg-gray-900/50">
                  <td className="px-4 py-4">
                    <span className="font-bold text-white block">{t.osId}</span>
                    <span className="text-[11px] text-gray-500">{t.cliente}</span>
                  </td>
                  <td className="px-4 py-4">{t.data}</td>
                  <td className="px-4 py-4">
                    {t.tipoCartao === 'credito_parcelado' ? `Crédito (${t.parcelas}x)` : 'Crédito à Vista'}
                  </td>
                  <td className="px-4 py-4 font-bold text-white">R$ {t.valorBruto.toFixed(2)}</td>
                  <td className="px-4 py-4 text-yellow-500">+ R$ {t.valorJuros.toFixed(2)}</td>
                  <td className="px-4 py-4 font-bold text-blue-400">R$ {t.valorLiquidoRecebido.toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      t.status === 'liquidado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {t.status === 'liquidado' ? 'Liquidado' : 'Pendente'}
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