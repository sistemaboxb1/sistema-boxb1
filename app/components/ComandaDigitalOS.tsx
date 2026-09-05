'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ItemComanda {
  id: string;
  descricao: string;
  valor: number;
}

interface OrdemServicoHistorico {
  id: string;
  os_codigo: string;
  problema_relatado: string;
  valor_total: number;
  status_pagamento: string;
  forma_pagamento: string;
  criado_em: string;
}

export default function ComandaDigitalOS() {
  // Estados de controle de visualização (Interno da Oficina vs Layout do Cliente)
  const [modoVisualizacao, setModoVisualizacao] = useState<'interno' | 'cliente'>('interno');

  // Dados do Cliente e Veículo Ativo
  const [osCodigo, setOsCodigo] = useState<string>('OS-2026-' + Math.floor(100 + Math.random() * 900));
  const [clienteNome, setClienteNome] = useState<string>('Carlos Eduardo');
  const [telefone, setTelefone] = useState<string>('(11) 98765-4321');
  const [modeloCarro, setModeloCarro] = useState<string>('Volkswagen Golf GTI 2.0');
  const [placa, setPlaca] = useState<string>('XYZ-9876');
  const [problemaRelatado, setProblemaRelatado] = useState<string>('Veículo falhando ao acelerar e ruído na suspensão.');

  // Pagamento e Status
  const [statusPagamento, setStatusPagamento] = useState<string>('pendente');
  const [formaPagamento, setFormaPagamento] = useState<string>('pix');

  // Histórico de O.S. anteriores do mesmo cliente
  const [historicoCliente, setHistoricoCliente] = useState<OrdemServicoHistorico[]>([]);

  // Itens da Comanda
  const [itensComanda, setItensComanda] = useState<ItemComanda[]>([
    { id: '1', descricao: 'Diagnóstico Avançado / Scanner', valor: 150.00 },
    { id: '2', descricao: 'Troca de Disco e Pastilhas de Freio', valor: 420.00 }
  ]);

  const [descricaoInput, setDescricaoInput] = useState<string>('');
  const [valorInput, setValorInput] = useState<string>('');
  const [salvando, setSalvando] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<string>('');

  const valorTotalComanda = itensComanda.reduce((acc, item) => acc + item.valor, 0);

  useEffect(() => {
    carregarHistoricoCliente();
  }, []);

  const carregarHistoricoCliente = async () => {
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      if (data) setHistoricoCliente(data);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  const adicionarItem = () => {
    if (!descricaoInput.trim() || !valorInput) return;
    setItensComanda([
      ...itensComanda,
      { id: Date.now().toString(), descricao: descricaoInput.trim(), valor: parseFloat(valorInput) || 0 }
    ]);
    setDescricaoInput('');
    setValorInput('');
  };

  const removerItem = (id: string) => {
    setItensComanda(itensComanda.filter(i => i.id !== id));
  };

  const salvarOrdemServicoSupabase = async () => {
    setSalvando(true);
    setMensagem('');

    try {
      const { error } = await supabase.from('ordens_servico').insert([{
        os_codigo: osCodigo,
        problema_relatado: problemaRelatado,
        status_pagamento: statusPagamento,
        forma_pagamento: formaPagamento,
        valor_total: valorTotalComanda
      }]);

      if (error) throw error;
      setMensagem('Ordem de serviço e status de pagamento salvos com sucesso no banco!');
      carregarHistoricoCliente();
    } catch (err: any) {
      setMensagem('Erro ao salvar O.S.: ' + err.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Botão de Alternância de Layout (Interno vs Cliente) */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center shadow-lg">
        <div>
          <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Gerenciamento de O.S. & Recibo</span>
          <h3 className="text-lg font-black text-white">{osCodigo} - {clienteNome}</h3>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setModoVisualizacao('interno')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              modoVisualizacao === 'interno' ? 'bg-blue-600 text-white shadow' : 'bg-gray-800 text-gray-400'
            }`}
          >
            🔧 Visão Interna (Oficina)
          </button>
          <button 
            onClick={() => setModoVisualizacao('cliente')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              modoVisualizacao === 'cliente' ? 'bg-green-600 text-white shadow' : 'bg-gray-800 text-gray-400'
            }`}
          >
            ✨ Layout Exclusivo para o Cliente
          </button>
        </div>
      </div>

      {mensagem && (
        <div className="bg-gray-950 border border-gray-800 p-3 rounded-lg text-xs text-yellow-400 font-semibold">
          {mensagem}
        </div>
      )}

      {/* ================= VISÃO INTERNA DA OFICINA ================= */}
      {modoVisualizacao === 'interno' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-950 p-6 rounded-xl border border-gray-800">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Cliente & Contato</label>
              <input type="text" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white mb-2" />
              <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Veículo (Modelo / Placa)</label>
              <input type="text" value={modeloCarro} onChange={(e) => setModeloCarro(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white mb-2" />
              <input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white uppercase" />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Problema Relatado</label>
              <textarea rows={3} value={problemaRelatado} onChange={(e) => setProblemaRelatado(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white"></textarea>
            </div>
          </div>

          {/* Controle de Pagamento na O.S. */}
          <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Status de Pagamento</label>
              <select value={statusPagamento} onChange={(e) => setStatusPagamento(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
                <option value="pendente">Pendente / Em Aberto</option>
                <option value="pago">Pago / Quitado</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Método de Pagamento</label>
              <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
                <option value="pix">PIX</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>
          </div>

          {/* Adicionar Serviços */}
          <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500">Serviços e Peças da O.S.</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <input type="text" placeholder="Nome do serviço ou peça..." value={descricaoInput} onChange={(e) => setDescricaoInput(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" />
              </div>
              <div className="flex space-x-2">
                <input type="number" step="0.01" placeholder="Valor R$" value={valorInput} onChange={(e) => setValorInput(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" />
                <button type="button" onClick={adicionarItem} className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold text-white cursor-pointer">+</button>
              </div>
            </div>

            <div className="divide-y divide-gray-800">
              {itensComanda.map((item) => (
                <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                  <span className="text-gray-300">{item.descricao}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-yellow-400 font-bold">R$ {item.valor.toFixed(2)}</span>
                    <button type="button" onClick={() => removerItem(item.id)} className="text-red-400">✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-sm font-black text-white">
              <span>Total da O.S.:</span>
              <span className="text-green-400 text-lg">R$ {valorTotalComanda.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={salvarOrdemServicoSupabase} disabled={salvando} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-lg cursor-pointer shadow-lg">
            {salvando ? 'Salvando O.S. no Banco...' : 'Salvar Ordem de Serviço & Vincular ao Cliente'}
          </button>

          {/* Histórico de Passagens Anteriores do Cliente */}
          <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Histórico de Ordens de Serviço Anteriores</h4>
            <div className="space-y-2">
              {historicoCliente.map((os) => (
                <div key={os.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center text-xs border border-gray-800">
                  <div>
                    <span className="font-bold text-yellow-500">{os.os_codigo}</span>
                    <p className="text-gray-400 mt-0.5">{os.problema_relatado}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-white block">R$ {Number(os.valor_total).toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${os.status_pagamento === 'pago' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {os.status_pagamento.toUpperCase()} ({os.forma_pagamento})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= LAYOUT EXCLUSIVO E BONITO PARA O CLIENTE ================= */}
      {modoVisualizacao === 'cliente' && (
        <div className="bg-white text-gray-900 border border-gray-300 rounded-2xl p-8 shadow-2xl space-y-8 max-w-2xl mx-auto">
          
          <div className="text-center border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-black tracking-wider text-gray-900">
              BOX<span className="text-yellow-600">B1</span>
            </h1>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">
              Centro Automotivo Especializado • Recibo Oficial
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
            <div>
              <span className="block text-gray-400 uppercase font-semibold text-[10px]">Cliente:</span>
              <strong className="text-gray-800 text-sm">{clienteNome}</strong>
            </div>
            <div>
              <span className="block text-gray-400 uppercase font-semibold text-[10px]">Veículo:</span>
              <strong className="text-gray-800 text-sm">{modeloCarro} ({placa})</strong>
            </div>
            <div>
              <span className="block text-gray-400 uppercase font-semibold text-[10px]">Ordem de Serviço:</span>
              <strong className="text-gray-800 text-sm">{osCodigo}</strong>
            </div>
            <div>
              <span className="block text-gray-400 uppercase font-semibold text-[10px]">Status do Pagamento:</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${statusPagamento === 'pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {statusPagamento === 'pago' ? `QUITADO VIA ${formaPagamento.toUpperCase()}` : 'PENDENTE'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Serviços e Peças Realizadas</h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 uppercase text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {itensComanda.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.descricao}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">R$ {item.valor.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm uppercase font-bold text-gray-600">Total Investido no Veículo:</span>
            <span className="text-2xl font-black text-green-600">R$ {valorTotalComanda.toFixed(2)}</span>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-[11px] text-gray-600 leading-relaxed text-center font-medium">
            ⚠️ <strong>Aviso Legal:</strong> Este demonstrativo serve como recibo oficial e consubstancia obrigação líquida, certa e exigível, podendo ser levada a protesto e executada judicialmente em caso de inadimplemento.
          </div>

          <div className="text-center pt-4">
            <button onClick={() => window.print()} className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs py-3 px-8 rounded-xl shadow-md cursor-pointer">
              🖨️ Imprimir / Salvar PDF para o Cliente
            </button>
          </div>

        </div>
      )}

    </div>
  );
}