'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ServicoLancado {
  id: string;
  descricao: string;
  valor: number;
}

export default function PainelClientesCarros() {
  const [nomeCliente, setNomeCliente] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [modeloCarro, setModeloCarro] = useState<string>('');
  const [placa, setPlaca] = useState<string>('');
  const [ano, setAno] = useState<string>('');
  const [quilometragem, setQuilometragem] = useState<string>('');
  const [problema, setProblema] = useState<string>('');

  const [servicos, setServicos] = useState<ServicoLancado[]>([
    { id: '1', descricao: 'Diagnóstico Computadorizado', valor: 150.00 }
  ]);
  const [descServico, setDescServico] = useState<string>('');
  const [valorServico, setValorServico] = useState<string>('');
  
  const [salvando, setSalvando] = useState<boolean>(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [erro, setErro] = useState<string>('');

  const adicionarServico = () => {
    if (!descServico.trim() || !valorServico) return;
    setServicos([...servicos, {
      id: Date.now().toString(),
      descricao: descServico.trim(),
      valor: parseFloat(valorServico) || 0
    }]);
    setDescServico('');
    setValorServico('');
  };

  const removerServico = (id: string) => {
    setServicos(servicos.filter(s => s.id !== id));
  };

  const valorTotalDemanda = servicos.reduce((acc, s) => acc + s.valor, 0);

  /**
   * Função que persiste os dados efetivamente no Supabase usando as tabelas SQL criadas,
   * garantindo que não sumam ao atualizar a página.
   */
  const salvarClienteECarrosNoSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    setMensagemSucesso('');

    try {
      // 1. Insere o cliente na tabela 'clientes'
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .insert([
          { nome: nomeCliente.trim(), telefone: telefone.trim() }
        ])
        .select()
        .single();

      if (clienteError) throw clienteError;
      const clienteId = clienteData.id;

      // 2. Insere o veículo vinculado ao cliente na tabela 'veiculos'
      const { data: veiculoData, error: veiculoError } = await supabase
        .from('veiculos')
        .insert([
          {
            cliente_id: clienteId,
            modelo: modeloCarro.trim(),
            placa: placa.trim().toUpperCase(),
            ano: ano.trim(),
            quilometragem: quilometragem.trim()
          }
        ])
        .select()
        .single();

      if (veiculoError) throw veiculoError;
      const veiculoId = veiculoData.id;

      // 3. Cria a Ordem de Serviço na tabela 'ordens_servico'
      const osCodigoGerado = `OS-2026-${Math.floor(100 + Math.random() * 900)}`;
      const { data: osData, error: osError } = await supabase
        .from('ordens_servico')
        .insert([
          {
            os_codigo: osCodigoGerado,
            veiculo_id: veiculoId,
            problema_relatado: problema.trim(),
            valor_total: valorTotalDemanda,
            status_pagamento: 'pendente'
          }
        ])
        .select()
        .single();

      if (osError) throw osError;
      const osIdSupabase = osData.id;

      // 4. Insere cada item da comanda na tabela 'itens_os'
      if (servicos.length > 0) {
        const itensFormatados = servicos.map(item => ({
          ordem_servico_id: osIdSupabase,
          descricao: item.descricao,
          valor: item.valor
        }));

        const { error: itensError } = await supabase
          .from('itens_os')
          .insert(itensFormatados);

        if (itensError) throw itensError;
      }

      setMensagemSucesso(`Cliente, veículo e O.S. ${osCodigoGerado} salvos com sucesso no banco de dados do Supabase!`);
      
      // Limpa formulário após salvar com sucesso
      setNomeCliente('');
      setTelefone('');
      setModeloCarro('');
      setPlaca('');
      setAno('');
      setQuilometragem('');
      setProblema('');
      setServicos([]);

    } catch (err: any) {
      console.error('Erro ao salvar no Supabase:', err);
      setErro(err.message || 'Erro ao persistir dados no banco. Verifique os campos.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-8">
      <div>
        <h3 className="text-xl font-black text-white">Painel de Clientes, Veículos & Serviços (Persistência Real)</h3>
        <p className="text-xs text-gray-400 mt-1">Cadastre o dono, o carro e monte a comanda de serviços integrada diretamente ao PostgreSQL do Supabase.</p>
      </div>

      {mensagemSucesso && (
        <div className="rounded-lg bg-green-950/40 border border-green-800/60 p-4 text-xs font-semibold text-green-300">
          {mensagemSucesso}
        </div>
      )}

      {erro && (
        <div className="rounded-lg bg-red-950/40 border border-red-800/60 p-4 text-xs font-semibold text-red-300">
          {erro}
        </div>
      )}

      <form onSubmit={salvarClienteECarrosNoSupabase} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-950 p-6 rounded-xl border border-gray-800">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Nome do Cliente</label>
            <input 
              type="text" 
              value={nomeCliente} 
              onChange={(e) => setNomeCliente(e.target.value)} 
              placeholder="Ex: Roberto Carlos"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Telefone / WhatsApp</label>
            <input 
              type="text" 
              value={telefone} 
              onChange={(e) => setTelefone(e.target.value)} 
              placeholder="(11) 99999-9999"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Modelo do Carro</label>
            <input 
              type="text" 
              value={modeloCarro} 
              onChange={(e) => setModeloCarro(e.target.value)} 
              placeholder="Ex: Fiat Palio 1.4"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Placa do Veículo</label>
            <input 
              type="text" 
              value={placa} 
              onChange={(e) => setPlaca(e.target.value)} 
              placeholder="ABC-1234"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white uppercase" 
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Ano / KM</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={ano} onChange={(e) => setAno(e.target.value)} placeholder="2021" className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white" />
              <input type="text" value={quilometragem} onChange={(e) => setQuilometragem(e.target.value)} placeholder="45.000 km" className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Problema Relatado / Observações</label>
            <textarea 
              rows={2}
              value={problema}
              onChange={(e) => setProblema(e.target.value)}
              placeholder="Descreva o defeito apresentado..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white"
              required
            ></textarea>
          </div>
        </div>

        {/* Comanda de Serviços vinculada */}
        <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500">Comanda de Serviços e Peças Executadas</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input 
                type="text" 
                value={descServico}
                onChange={(e) => setDescServico(e.target.value)}
                placeholder="Serviço ou Peça (Ex: Troca de Óleo)"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="flex space-x-2">
              <input 
                type="number" 
                step="0.01"
                value={valorServico}
                onChange={(e) => setValorServico(e.target.value)}
                placeholder="R$ Valor"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              />
              <button 
                type="button"
                onClick={adicionarServico}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-xs font-bold text-white cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-800">
            {servicos.map((s) => (
              <div key={s.id} className="py-2 flex justify-between items-center text-xs">
                <span className="text-gray-300">{s.descricao}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-yellow-400 font-bold">R$ {s.valor.toFixed(2)}</span>
                  <button type="button" onClick={() => removerServico(s.id)} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-sm font-black text-white">
            <span>Total da Comanda:</span>
            <span className="text-green-400 text-lg">R$ {valorTotalDemanda.toFixed(2)}</span>
          </div>
        </div>

        <button 
          type="submit"
          disabled={salvando}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-lg transition-all cursor-pointer shadow-lg disabled:opacity-50"
        >
          {salvando ? 'Salvando no Banco de Dados...' : 'Salvar no Supabase (Permanente)'}
        </button>
      </form>
    </div>
  );
}