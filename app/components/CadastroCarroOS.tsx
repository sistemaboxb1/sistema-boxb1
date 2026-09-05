'use client';

import React, { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';

interface CadastroCarroOSProps {
  onOsCadastrada?: (osId: string) => void;
}

interface ServicoItem {
  id: string;
  descricao: string;
  valor: number;
}

export default function CadastroCarroOS({ onOsCadastrada }: CadastroCarroOSProps) {
  // Estados para dados do cliente e do veículo
  const [nomeCliente, setNomeCliente] = useState<string>('');
  const [telefoneCliente, setTelefoneCliente] = useState<string>('');
  const [modeloCarro, setModeloCarro] = useState<string>('');
  const [placaCarro, setPlacaCarro] = useState<string>('');
  const [anoCarro, setAnoCarro] = useState<string>('');
  
  // Estados para o problema relatado e diagnóstico da oficina
  const [problemaRelatado, setProblemaRelatado] = useState<string>('');
  const [quilometragem, setQuilometragem] = useState<string>('');
  
  // Lista detalhada de serviços e peças da O.S.
  const [listaServicos, setListaServicos] = useState<ServicoItem[]>([
    { id: '1', descricao: 'Diagnóstico computadorizado / Scanner', valor: 150.00 }
  ]);
  const [novaDescricaoServico, setNovaDescricaoServico] = useState<string>('');
  const [novoValorServico, setNovoValorServico] = useState<string>('');

  const [salvando, setSalvando] = useState<boolean>(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [erro, setErro] = useState<string>('');

  // Cálculo automático do valor total da O.S.
  const valorTotalOS = listaServicos.reduce((acc, item) => acc + item.valor, 0);

  const adicionarItemServico = () => {
    if (!novaDescricaoServico.trim() || !novoValorServico) return;
    const novoItem: ServicoItem = {
      id: Date.now().toString(),
      descricao: novaDescricaoServico.trim(),
      valor: parseFloat(novoValorServico) || 0
    };
    setListaServicos([...listaServicos, novoItem]);
    setNovaDescricaoServico('');
    setNovoValorServico('');
  };

  const removerItemServico = (id: string) => {
    setListaServicos(listaServicos.filter(item => item.id !== id));
  };

  const lidarComSalvarOS = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    setMensagemSucesso('');

    try {
      const dadosOS = {
        cliente: nomeCliente.trim(),
        telefone: telefoneCliente.trim(),
        veiculo: modeloCarro.trim(),
        placa: placaCarro.trim().toUpperCase(),
        ano: anoCarro.trim(),
        quilometragem: quilometragem.trim(),
        problema: problemaRelatado.trim(),
        servicos: listaServicos,
        valor_total: valorTotalOS,
        status: 'em_andamento',
        data_chegada: new Date().toISOString()
      };

      // Simulação estruturada de salvamento (pronto para inserir na tabela 'ordens_servico' do Supabase)
      console.log('Dados da O.S. preparados para inserção no Supabase:', dadosOS);

      await new Promise((resolve) => setTimeout(resolve, 800));

      const osGeradaId = `OS-2026-${Math.floor(100 + Math.random() * 900)}`;
      setMensagemSucesso(`Ordem de Serviço ${osGeradaId} aberta com sucesso na pista da oficina!`);
      
      if (onOsCadastrada) {
        onOsCadastrada(osGeradaId);
      }
    } catch (err) {
      setErro('Ocorreu um erro ao registrar a O.S. Verifique os dados e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-8">
      
      {/* Cabeçalho do Módulo */}
      <div>
        <h3 className="text-xl font-black text-white">Abertura de Ordem de Serviço (O.S.)</h3>
        <p className="text-xs text-gray-400 mt-1">
          Cadastre os dados do cliente, veículo, problema relatado e a lista detalhada de peças e serviços executados na pista.
        </p>
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

      <form onSubmit={lidarComSalvarOS} className="space-y-6">
        
        {/* Seção 1: Dados do Cliente e Veículo */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-gray-800 pb-2">
            1. Identificação do Cliente e Veículo
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Nome do Cliente</label>
              <input 
                type="text" 
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                placeholder="Ex: Carlos Alberto"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Telefone / WhatsApp</label>
              <input 
                type="text" 
                value={telefoneCliente}
                onChange={(e) => setTelefoneCliente(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Modelo do Veículo</label>
              <input 
                type="text" 
                value={modeloCarro}
                onChange={(e) => setModeloCarro(e.target.value)}
                placeholder="Ex: Chevrolet Onix 1.4"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Placa</label>
              <input 
                type="text" 
                value={placaCarro}
                onChange={(e) => setPlacaCarro(e.target.value)}
                placeholder="ABC-1234"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white uppercase focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Ano / KM</label>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={anoCarro}
                  onChange={(e) => setAnoCarro(e.target.value)}
                  placeholder="2021"
                  className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <input 
                  type="text" 
                  value={quilometragem}
                  onChange={(e) => setQuilometragem(e.target.value)}
                  placeholder="45.000 km"
                  className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2: Diagnóstico e Defeito */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-gray-800 pb-2">
            2. Defeito Relatado e Diagnóstico Inicial
          </h4>
          <div>
            <textarea 
              rows={3}
              value={problemaRelatado}
              onChange={(e) => setProblemaRelatado(e.target.value)}
              placeholder="Descreva o problema relatado pelo cliente e observações preliminares do mecânico..."
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            ></textarea>
          </div>
        </div>

        {/* Seção 3: Peças e Serviços Executados */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-gray-800 pb-2">
            3. Serviços e Peças Aplicadas
          </h4>

          <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input 
                  type="text" 
                  value={novaDescricaoServico}
                  onChange={(e) => setNovaDescricaoServico(e.target.value)}
                  placeholder="Nome do serviço ou peça (Ex: Troca de óleo / Filtro)"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex space-x-2">
                <input 
                  type="number" 
                  step="0.01"
                  value={novoValorServico}
                  onChange={(e) => setNovoValorServico(e.target.value)}
                  placeholder="Valor R$"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                />
                <button 
                  type="button" 
                  onClick={adicionarItemServico}
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-xs font-bold text-white cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Listagem dos itens adicionados */}
            <div className="divide-y divide-gray-800">
              {listaServicos.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                  <span className="text-gray-300 font-medium">{item.descricao}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-yellow-500 font-bold">R$ {item.valor.toFixed(2)}</span>
                    <button 
                      type="button" 
                      onClick={() => removerItemServico(item.id)}
                      className="text-red-400 hover:text-red-300 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-sm font-black text-white">
              <span>Valor Total da O.S.:</span>
              <span className="text-green-400 text-lg">R$ {valorTotalOS.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Botão Final */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={salvando}
            className="w-full flex justify-center items-center rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-500 cursor-pointer disabled:opacity-50"
          >
            {salvando ? 'Cadastrando Ordem de Serviço...' : 'Registrar O.S. na Pista da Oficina'}
          </button>
        </div>

      </form>
    </div>
  );
}