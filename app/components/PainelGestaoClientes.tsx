'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface OrdemServicoItem {
  id: string;
  os_codigo: string;
  problema_relatado: string;
  valor_total: number;
  status_pagamento: string;
  forma_pagamento: string;
  criado_em: string;
}

interface ClienteCompleto {
  id: string;
  nome: string;
  telefone: string;
  ordens_servico: OrdemServicoItem[];
}

export default function PainelGestaoClientes() {
  const [clientes, setClientes] = useState<ClienteCompleto[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteCompleto | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [mensagem, setMensagem] = useState<string>('');

  const [editandoClienteId, setEditandoClienteId] = useState<string | null>(null);
  const [novoNomeCliente, setNovoNomeCliente] = useState<string>('');
  const [novoTelefoneCliente, setNovoTelefoneCliente] = useState<string>('');

  const [editandoOsId, setEditandoOsId] = useState<string | null>(null);
  const [novoProblemaOs, setNovoProblemaOs] = useState<string>('');
  const [novoValorOs, setNovoValorOs] = useState<string>('');
  const [novoStatusOs, setNovoStatusOs] = useState<string>('pendente');
  const [novaFormaPagamentoOs, setNovaFormaPagamentoOs] = useState<string>('pix');

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setCarregando(true);
    try {
      const { data: cliData, error: errCli } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true });

      if (errCli) throw errCli;

      const listaMapeada = await Promise.all(
        (cliData || []).map(async (cli) => {
          const { data: osDireta } = await supabase
            .from('ordens_servico')
            .select('*')
            .eq('cliente_id', cli.id);

          const { data: veiculosData } = await supabase
            .from('veiculos')
            .select('id')
            .eq('cliente_id', cli.id);

          let osPorVeiculo: any[] = [];
          if (veiculosData && veiculosData.length > 0) {
            const veiculoIds = veiculosData.map(v => v.id);
            const { data: osVeiculoData } = await supabase
              .from('ordens_servico')
              .select('*')
              .in('veiculo_id', veiculoIds);
            if (osVeiculoData) osPorVeiculo = osVeiculoData;
          }

          const todasOsMap = new Map();
          [...(osDireta || []), ...osPorVeiculo].forEach(os => todasOsMap.set(os.id, os));
          const ordensUnicas = Array.from(todasOsMap.values()).sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());

          return {
            ...cli,
            ordens_servico: ordensUnicas
          };
        })
      );

      setClientes(listaMapeada);
      if (clienteSelecionado) {
        const atualizado = listaMapeada.find(c => c.id === clienteSelecionado.id);
        if (atualizado) setClienteSelecionado(atualizado);
      }
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setCarregando(false);
    }
  };

  const salvarEdicaoCliente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ nome: novoNomeCliente, telefone: novoTelefoneCliente })
        .eq('id', id);

      if (error) throw error;
      setMensagem('Dados do cliente atualizados com sucesso!');
      setEditandoClienteId(null);
      carregarClientes();
    } catch (err: any) {
      setMensagem('Erro ao atualizar cliente: ' + err.message);
    }
  };

  const salvarEdicaoOs = async (osId: string) => {
    try {
      const { error } = await supabase
        .from('ordens_servico')
        .update({ 
          problema_relatado: novoProblemaOs, 
          valor_total: parseFloat(novoValorOs) || 0,
          status_pagamento: novoStatusOs,
          forma_pagamento: novaFormaPagamentoOs
        })
        .eq('id', osId);

      if (error) throw error;
      setMensagem('Ordem de serviço e status de pagamento atualizados com sucesso!');
      setEditandoOsId(null);
      carregarClientes();
    } catch (err: any) {
      setMensagem('Erro ao atualizar O.S.: ' + err.message);
    }
  };

  const excluirCliente = async (clienteId: string) => {
    if (!confirm('Deseja realmente excluir este cliente e todo o seu histórico vinculado?')) return;
    try {
      const { error } = await supabase.from('clientes').delete().eq('id', clienteId);
      if (error) throw error;
      setMensagem('Cliente excluído com sucesso.');
      setClienteSelecionado(null);
      carregarClientes();
    } catch (err: any) {
      alert('Erro ao excluir cliente: ' + err.message);
    }
  };

  const excluirOs = async (osId: string) => {
    if (!confirm('Deseja realmente excluir esta Ordem de Serviço permanentemente?')) return;
    try {
      const { error } = await supabase.from('ordens_servico').delete().eq('id', osId);
      if (error) throw error;
      setMensagem('Ordem de serviço excluída com sucesso.');
      carregarClientes();
    } catch (err: any) {
      alert('Erro ao excluir O.S.: ' + err.message);
    }
  };

  if (carregando) {
    return <div className="text-white text-xs p-6">Carregando lista de clientes...</div>;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white">Lista de Clientes & Histórico de O.S.</h3>
          <p className="text-xs text-gray-400 mt-1">Gerencie dados cadastrais, altere status de pagamento ou exclua Ordens de Serviço.</p>
        </div>
        <button onClick={carregarClientes} className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs py-2 px-4 rounded-lg cursor-pointer">
          🔄 Atualizar
        </button>
      </div>

      {mensagem && (
        <div className="bg-gray-950 p-3 rounded border border-gray-800 text-xs text-yellow-400 font-semibold">
          {mensagem}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2 max-h-[600px] overflow-y-auto">
          <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500 mb-3">Todos os Clientes ({clientes.length})</h4>
          {clientes.map((cli) => (
            <div 
              key={cli.id}
              onClick={() => setClienteSelecionado(cli)}
              className={`p-3 rounded-xl cursor-pointer transition-all border ${
                clienteSelecionado?.id === cli.id ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <h5 className="font-bold text-xs">{cli.nome}</h5>
              <span className="text-[11px] text-gray-400 block">{cli.telefone}</span>
              <span className="text-[10px] text-yellow-400 font-semibold mt-1 block">{cli.ordens_servico.length} O.S. vinculada(s)</span>
            </div>
          ))}
          {clientes.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Nenhum cliente cadastrado.</p>}
        </div>

        <div className="md:col-span-2 bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-6">
          {clienteSelecionado ? (
            <div className="space-y-6">
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                {editandoClienteId === clienteSelecionado.id ? (
                  <div className="space-y-2 w-full">
                    <input type="text" value={novoNomeCliente} onChange={(e) => setNovoNomeCliente(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded p-1 text-xs text-white" />
                    <input type="text" value={novoTelefoneCliente} onChange={(e) => setNovoTelefoneCliente(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded p-1 text-xs text-white" />
                    <button onClick={() => salvarEdicaoCliente(clienteSelecionado.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Salvar Cliente</button>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Cliente Selecionado</span>
                    <h3 className="text-lg font-black text-white">{clienteSelecionado.nome}</h3>
                    <p className="text-xs text-gray-400">Telefone: {clienteSelecionado.telefone}</p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  {editandoClienteId !== clienteSelecionado.id && (
                    <button onClick={() => { setEditandoClienteId(clienteSelecionado.id); setNovoNomeCliente(clienteSelecionado.nome); setNovoTelefoneCliente(clienteSelecionado.telefone); }} className="bg-gray-800 hover:bg-gray-700 text-xs px-3 py-1.5 rounded font-bold text-gray-200">
                      Editar
                    </button>
                  )}
                  <button onClick={() => excluirCliente(clienteSelecionado.id)} className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-700/50 px-3 py-1.5 rounded text-xs font-bold cursor-pointer">
                    🗑️ Excluir Cliente
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500">Ordens de Serviço de {clienteSelecionado.nome}</h4>
                
                {clienteSelecionado.ordens_servico.length > 0 ? (
                  clienteSelecionado.ordens_servico.map((os) => (
                    <div key={os.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-yellow-400">{os.os_codigo}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${os.status_pagamento === 'pago' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                          {os.status_pagamento?.toUpperCase()} ({os.forma_pagamento})
                        </span>
                      </div>

                      {editandoOsId === os.id ? (
                        <div className="space-y-3 pt-2 border-t border-gray-800">
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Descrição / Problema</label>
                            <textarea value={novoProblemaOs} onChange={(e) => setNovoProblemaOs(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-xs text-white" rows={2} />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">Valor (R$)</label>
                              <input type="number" step="0.01" value={novoValorOs} onChange={(e) => setNovoValorOs(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded p-1.5 text-xs text-white" />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">Status Pagamento</label>
                              <select value={novoStatusOs} onChange={(e) => setNovoStatusOs(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded p-1.5 text-xs text-white">
                                <option value="pendente">Pendente</option>
                                <option value="pago">Pago</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">Forma Pagto</label>
                              <select value={novaFormaPagamentoOs} onChange={(e) => setNovaFormaPagamentoOs(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded p-1.5 text-xs text-white">
                                <option value="pix">PIX</option>
                                <option value="cartao_avista">Cartão à Vista</option>
                                <option value="cartao_parcelado">Cartão Parcelado</option>
                                <option value="dinheiro">Dinheiro</option>
                                <option value="boleto">Boleto</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex space-x-2 pt-1">
                            <button onClick={() => salvarEdicaoOs(os.id)} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-xs font-bold cursor-pointer">Salvar Alterações</button>
                            <button onClick={() => setEditandoOsId(null)} className="bg-gray-800 text-gray-300 px-3 py-1.5 rounded text-xs font-bold cursor-pointer">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-end pt-2 border-t border-gray-800">
                          <div>
                            <p className="text-gray-300">{os.problema_relatado}</p>
                            <span className="text-[10px] text-gray-500 mt-1 block">Criado em: {new Date(os.criado_em).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right flex items-center space-x-3">
                            <div>
                              <span className="font-black text-white text-sm block">R$ {Number(os.valor_total).toFixed(2)}</span>
                            </div>
                            <button onClick={() => { setEditandoOsId(os.id); setNovoProblemaOs(os.problema_relatado); setNovoValorOs(os.valor_total.toString()); setNovoStatusOs(os.status_pagamento || 'pendente'); setNovaFormaPagamentoOs(os.forma_pagamento || 'pix'); }} className="text-blue-400 hover:text-blue-300 font-bold cursor-pointer">
                              Editar
                            </button>
                            <button onClick={() => excluirOs(os.id)} className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-700/50 px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer">
                              Excluir
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic py-4 text-center">Este cliente ainda não possui ordens de serviço cadastradas.</p>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 text-xs">
              Selecione um cliente na lista ao lado para gerenciar suas Ordens de Serviço.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}