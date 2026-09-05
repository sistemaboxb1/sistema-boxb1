'use client';

import React, { useState } from 'react';

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
  const [problema, setProblema] = useState<string>('');

  const [servicos, setServicos] = useState<ServicoLancado[]>([
    { id: '1', descricao: 'Diagnóstico Computadorizado', valor: 150.00 }
  ]);
  const [descServico, setDescServico] = useState<string>('');
  const [valorServico, setValorServico] = useState<string>('');

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

  const valorTotalDemanda = servicos.reduce((acc, s) => acc + s.valor, 0);

  const salvarClienteECarros = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Cliente ${nomeCliente} e veículo ${modeloCarro} (${placa}) cadastrados com sucesso! Dados integrados à comanda digital e ao financeiro.`);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-8">
      <div>
        <h3 className="text-xl font-black text-white">Painel de Clientes, Veículos & Serviços</h3>
        <p className="text-xs text-gray-400 mt-1">Cadastre o dono, o carro e monte a comanda de serviços integrada ao caixa e financeiro.</p>
      </div>

      <form onSubmit={salvarClienteECarros} className="space-y-6">
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
                <span className="text-yellow-400 font-bold">R$ {s.valor.toFixed(2)}</span>
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
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-lg transition-all cursor-pointer shadow-lg"
        >
          Salvar Cadastro de Cliente, Carro e Integrar ao Financeiro
        </button>
      </form>
    </div>
  );
}