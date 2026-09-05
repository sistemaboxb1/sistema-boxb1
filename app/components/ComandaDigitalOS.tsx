'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ItemComanda {
  id: string;
  descricao: string;
  valor: number;
}

interface ClienteOpcao {
  id: string;
  nome: string;
  telefone: string;
}

interface OrdemServicoHistorico {
  id: string;
  os_codigo: string;
  problema_relatado: string;
  valor_total: number;
  status_pagamento: string;
  forma_pagamento: string;
  criado_em: string;
  cliente_id?: string;
}

export default function ComandaDigitalOS() {
  const [modoVisualizacao, setModoVisualizacao] = useState<'interno' | 'cliente'>('interno');

  // Identificador interno se estamos editando uma O.S. existente
  const [osEditandoId, setOsEditandoId] = useState<string | null>(null);
  const [osCodigo, setOsCodigo] = useState<string>('OS-2026-' + Math.floor(100 + Math.random() * 900));
  
  const [listaClientes, setListaClientes] = useState<ClienteOpcao[]>([]);
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string>('novo');
  
  const [clienteNome, setClienteNome] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [modeloCarro, setModeloCarro] = useState<string>('');
  const [placa, setPlaca] = useState<string>('');
  const [problemaRelatado, setProblemaRelatado] = useState<string>('');

  const [statusPagamento, setStatusPagamento] = useState<string>('pendente');
  const [formaPagamento, setFormaPagamento] = useState<string>('pix');
  const [parcelas, setParcelas] = useState<number>(1);
  const [taxaJurosMensal, setTaxaJurosMensal] = useState<number>(1.99);

  const [historicoCliente, setHistoricoCliente] = useState<OrdemServicoHistorico[]>([]);
  const [itensComanda, setItensComanda] = useState<ItemComanda[]>([
    { id: '1', descricao: 'Diagnóstico Avançado / Scanner', valor: 150.00 }
  ]);

  const [descricaoInput, setDescricaoInput] = useState<string>('');
  const [valorInput, setValorInput] = useState<string>('');
  const [salvando, setSalvando] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<string>('');

  const valorSubtotal = itensComanda.reduce((acc, item) => acc + item.valor, 0);
  const valorTotalComJuros = formaPagamento === 'cartao_parcelado' && parcelas > 1
    ? valorSubtotal * Math.pow(1 + (taxaJurosMensal / 100), parcelas)
    : valorSubtotal;
  const valorParcela = parcelas > 0 ? valorTotalComJuros / parcelas : valorTotalComJuros;

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    try {
      const { data: clientesData } = await supabase.from('clientes').select('id, nome, telefone');
      if (clientesData) setListaClientes(clientesData);

      const { data: osData } = await supabase.from('ordens_servico').select('*').order('criado_em', { ascending: false });
      if (osData) setHistoricoCliente(osData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  const selecionarClienteExistente = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setClienteSelecionadoId(id);
    if (id !== 'novo') {
      const cli = listaClientes.find(c => c.id === id);
      if (cli) {
        setClienteNome(cli.nome);
        setTelefone(cli.telefone);
      }
    } else {
      setClienteNome('');
      setTelefone('');
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

  // Carregar O.S. existente para edição
  const carregarOsParaEdicao = (os: OrdemServicoHistorico) => {
    setOsEditandoId(os.id);
    setOsCodigo(os.os_codigo);
    setProblemaRelatado(os.problema_relatado || '');
    setStatusPagamento(os.status_pagamento || 'pendente');
    setMensagem(`Modo de edição ativo para a O.S. ${os.os_codigo}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const salvarOuAtualizarOrdemServico = async () => {
    setSalvando(true);
    setMensagem('');

    try {
      let clienteIdFinal = clienteSelecionadoId !== 'novo' ? clienteSelecionadoId : null;

      if (clienteSelecionadoId === 'novo') {
        if (!clienteNome.trim() || !telefone.trim()) {
          alert('Preencha o nome e o telefone do cliente.');
          setSalvando(false);
          return;
        }

        const { data: novoCliente, error: errCliente } = await supabase
          .from('clientes')
          .insert([{ nome: clienteNome.trim(), telefone: telefone.trim() }])
          .select()
          .single();

        if (errCliente) throw errCliente;
        clienteIdFinal = novoCliente.id;

        if (modeloCarro.trim() && placa.trim()) {
          await supabase.from('veiculos').insert([{
            cliente_id: clienteIdFinal,
            modelo: modeloCarro.trim(),
            placa: placa.trim().toUpperCase()
          }]);
        }
      }

      if (osEditandoId) {
        // Atualiza O.S. existente
        const { error: errUpdate } = await supabase
          .from('ordens_servico')
          .update({
            problema_relatado: problemaRelatado,
            status_pagamento: statusPagamento,
            forma_pagamento: `${formaPagamento}${parcelas > 1 ? ` (${parcelas}x)` : ''}`,
            valor_total: valorTotalComJuros
          })
          .eq('id', osEditandoId);

        if (errUpdate) throw errUpdate;
        setMensagem('Ordem de serviço atualizada com sucesso!');
      } else {
        // Insere nova O.S.
        const { error: errInsert } = await supabase.from('ordens_servico').insert([{
          os_codigo: osCodigo,
          cliente_id: clienteIdFinal,
          problema_relatado: problemaRelatado,
          status_pagamento: statusPagamento,
          forma_pagamento: `${formaPagamento}${parcelas > 1 ? ` (${parcelas}x)` : ''}`,
          valor_total: valorTotalComJuros
        }]);

        if (errInsert) throw errInsert;
        setMensagem('Nova ordem de serviço salva com sucesso!');
      }

      setOsEditandoId(null);
      carregarDadosIniciais();
    } catch (err: any) {
      setMensagem('Erro ao salvar O.S.: ' + err.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center shadow-lg print:hidden">
        <div>
          <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Gerenciamento de O.S. & Recibo</span>
          <h3 className="text-lg font-black text-white">{osCodigo} {osEditandoId ? '(Editando)' : ''}</h3>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setModoVisualizacao('interno')} className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${modoVisualizacao === 'interno' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            🔧 Visão Oficina
          </button>
          <button onClick={() => setModoVisualizacao('cliente')} className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${modoVisualizacao === 'cliente' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            ✨ Layout Exclusivo Cliente
          </button>
        </div>
      </div>

      {mensagem && (
        <div className="bg-gray-950 border border-gray-800 p-3 rounded-lg text-xs text-yellow-400 font-semibold print:hidden">
          {mensagem}
        </div>
      )}

      {modoVisualizacao === 'interno' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-950 p-6 rounded-xl border border-gray-800">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Código O.S.</label>
              <input type="text" value={osCodigo} onChange={(e) => setOsCodigo(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-yellow-400 font-bold mb-3" />
              
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Cliente</label>
              <select 
                value={clienteSelecionadoId} 
                onChange={selecionarClienteExistente} 
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white mb-3"
              >
                <option value="novo">+ Cadastrar Novo Cliente na Hora</option>
                {listaClientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} ({c.telefone})</option>
                ))}
              </select>

              {clienteSelecionadoId === 'novo' && (
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <input type="text" placeholder="Nome do Cliente" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" />
                  <input type="text" placeholder="Telefone / WhatsApp" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Veículo (Modelo / Placa)</label>
              <input type="text" placeholder="Ex: Volkswagen Golf GTI" value={modeloCarro} onChange={(e) => setModeloCarro(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white mb-2" />
              <input type="text" placeholder="Placa (XYZ-9876)" value={placa} onChange={(e) => setPlaca(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white uppercase" />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Problema Relatado</label>
              <textarea rows={5} value={problemaRelatado} onChange={(e) => setProblemaRelatado(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white"></textarea>
            </div>
          </div>

          <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500">Condições de Pagamento</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Status</label>
                <select value={statusPagamento} onChange={(e) => setStatusPagamento(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
                  <option value="pendente">Pendente / Em Aberto</option>
                  <option value="pago">Pago / Quitado</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Método</label>
                <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
                  <option value="pix">PIX</option>
                  <option value="cartao_avista">Cartão à Vista</option>
                  <option value="cartao_parcelado">Cartão Parcelado (com Juros)</option>
                  <option value="dinheiro">Dinheiro</option>
                </select>
              </div>

              {formaPagamento === 'cartao_parcelado' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Parcelas</label>
                    <input type="number" min="1" max="12" value={parcelas} onChange={(e) => setParcelas(parseInt(e.target.value) || 1)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Juros (% a.m.)</label>
                    <input type="number" step="0.01" value={taxaJurosMensal} onChange={(e) => setTaxaJurosMensal(parseFloat(e.target.value) || 0)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500">Serviços e Peças</h4>
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
              <span>Total Calculado:</span>
              <span className="text-green-400 text-lg">R$ {valorTotalComJuros.toFixed(2)} {parcelas > 1 && `(${parcelas}x de R$ ${valorParcela.toFixed(2)})`}</span>
            </div>
          </div>

          <button onClick={salvarOuAtualizarOrdemServico} disabled={salvando} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-lg cursor-pointer shadow-lg">
            {salvando ? 'Salvando...' : osEditandoId ? 'Atualizar Ordem de Serviço' : 'Salvar Nova Ordem de Serviço'}
          </button>

          {/* Histórico para seleção e alteração posterior */}
          <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Histórico de O.S. (Clique em Editar para alterar)</h4>
            <div className="space-y-2">
              {historicoCliente.map((os) => (
                <div key={os.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center text-xs border border-gray-800">
                  <div>
                    <span className="font-bold text-yellow-500">{os.os_codigo}</span>
                    <p className="text-gray-400 mt-0.5">{os.problema_relatado}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="font-black text-white block">R$ {Number(os.valor_total).toFixed(2)}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${os.status_pagamento === 'pago' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {os.status_pagamento.toUpperCase()}
                      </span>
                    </div>
                    <button onClick={() => carregarOsParaEdicao(os)} className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-gray-200 font-bold">
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= LAYOUT EXCLUSIVO PRO CLIENTE (COM NOME E CARRO) ================= */}
      {modoVisualizacao === 'cliente' && (
        <div className="bg-white text-gray-900 border border-gray-300 rounded-2xl p-8 shadow-2xl space-y-8 max-w-2xl mx-auto">
          <div className="text-center border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-black tracking-wider text-gray-900">
              BOX<span className="text-yellow-600">B1</span>
            </h1>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">
              Centro Automotivo Especializado • Recibo Oficial & O.S.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
            <div>
              <span className="block text-gray-400 uppercase font-semibold text-[10px]">Cliente:</span>
              <strong className="text-gray-800 text-sm">{clienteomeFinalText(clienteNome)}</strong>
            </div>
            <div>
              <span className="block text-gray-400 uppercase font-semibold text-[10px]">Veículo:</span>
              <strong className="text-gray-800 text-sm">{modeloCarro ? `${modeloCarro} (${placa || 'Sem placa'})` : 'Veículo não informado'}</strong>
            </div>
            <div>
              <span className="block text-gray-400 uppercase font-semibold text-[10px]">Ordem de Serviço:</span>
              <strong className="text-gray-800 text-sm">{osCodigo}</strong>
            </div>
            <div>
              <span className="block text-gray-400 uppercase font-semibold text-[10px]">Status do Pagamento:</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${statusPagamento === 'pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {statusPagamento === 'pago' ? `QUITADO (${formaPagamento.toUpperCase()})` : 'PENDENTE'}
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
            <span className="text-sm uppercase font-bold text-gray-600">Total Investido:</span>
            <span className="text-2xl font-black text-green-600">R$ {valorTotalComJuros.toFixed(2)}</span>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-[11px] text-gray-600 leading-relaxed text-center font-medium">
            ⚠️ <strong>Aviso Legal:</strong> Este demonstrativo serve como recibo oficial e consubstancia obrigação líquida, certa e exigível, podendo ser levada a protesto e executada judicialmente em caso de inadimplemento.
          </div>

          <div className="text-center pt-4 print:hidden">
            <button onClick={() => window.print()} className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs py-3 px-8 rounded-xl shadow-md cursor-pointer">
              🖨️ Imprimir / Salvar PDF para o Cliente
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Função auxiliar interna para garantir exibição do nome do cliente
function clienteomeFinalText(nome: string) {
  return nome.trim() !== '' ? nome : 'Cliente Balcão';
}