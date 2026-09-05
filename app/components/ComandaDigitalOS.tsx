'use client';

import React, { useState } from 'react';

interface ItemComanda {
  id: string;
  descricao: string;
  valor: number;
}

interface ComandaProps {
  osId?: string;
}

export default function ComandaDigitalOS({ osId = 'OS-2026-089' }: ComandaProps) {
  // Informações do Veículo e Cliente
  const [cliente, setCliente] = useState<string>('Carlos Eduardo');
  const [telefone, setTelefone] = useState<string>('(11) 98765-4321');
  const [modeloCarro, setModeloCarro] = useState<string>('Volkswagen Golf GTI 2.0');
  const [placa, setPlaca] = useState<string>('XYZ-9876');
  const [ano, setAno] = useState<string>('2019');
  const [km, setKm] = useState<string>('68.000 km');
  const [problemaRelatado, setProblemaRelatado] = useState<string>('Veículo falhando ao acelerar e ruído na suspensão dianteira.');

  // Catálogo de serviços salvos (reutilizáveis para outras demandas)
  const [catalogoServicos, setCatalogoServicos] = useState<string[]>([
    'Diagnóstico Avançado / Scanner',
    'Troca de Disco e Pastilhas de Freio',
    'Troca de Óleo do Motor e Filtro',
    'Alinhamento e Balanceamento',
    'Revisão de Suspensão Dianteira'
  ]);

  // Itens ativos da comanda atual
  const [itensComanda, setItensComanda] = useState<ItemComanda[]>([
    { id: '1', descricao: 'Diagnóstico Avançado / Scanner', valor: 150.00 },
    { id: '2', descricao: 'Troca de Disco e Pastilhas de Freio', valor: 420.00 }
  ]);

  // Inputs para novo item digitável
  const [descricaoInput, setDescricaoInput] = useState<string>('');
  const [valorInput, setValorInput] = useState<string>('');
  const [salvarNoCatalogo, setSalvarNoCatalogo] = useState<boolean>(true);

  const valorTotalComanda = itensComanda.reduce((acc, item) => acc + item.valor, 0);

  const adicionarItemComanda = () => {
    if (!descricaoInput.trim() || !valorInput) return;

    const novoItem: ItemComanda = {
      id: Date.now().toString(),
      descricao: descricaoInput.trim(),
      valor: parseFloat(valorInput) || 0
    };

    setItensComanda([...itensComanda, novoItem]);

    // Se o usuário quiser salvar no catálogo reutilizável
    if (salvarNoCatalogo && !catalogoServicos.includes(descricaoInput.trim())) {
      setCatalogoServicos([...catalogoServicos, descricaoInput.trim()]);
    }

    setDescricaoInput('');
    setValorInput('');
  };

  const selecionarDoCatalogo = (servicoCatalogo: string) => {
    setDescricaoInput(servicoCatalogo);
  };

  const removerItem = (id: string) => {
    setItensComanda(itensComanda.filter(item => item.id !== id));
  };

  const emitirPdfComanda = () => {
    window.print(); // Dispara a função nativa de impressão/geração de PDF do navegador formatada para a comanda
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Comanda Digital Atualizável</span>
          <h2 className="text-2xl font-black text-white mt-1">Ordem de Serviço #{osId}</h2>
        </div>
        <div>
          <button 
            onClick={emitirPdfComanda}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-lg cursor-pointer flex items-center space-x-2"
          >
            <span>📄 Emitir PDF / Enviar ao Cliente</span>
          </button>
        </div>
      </div>

      {/* Detalhes do Carro e Dono */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-950 p-6 rounded-xl border border-gray-800">
        <div>
          <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Cliente & Contato</label>
          <input 
            type="text" 
            value={cliente} 
            onChange={(e) => setCliente(e.target.value)} 
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white mb-2"
          />
          <input 
            type="text" 
            value={telefone} 
            onChange={(e) => setTelefone(e.target.value)} 
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Veículo (Modelo / Placa)</label>
          <input 
            type="text" 
            value={modeloCarro} 
            onChange={(e) => setModeloCarro(e.target.value)} 
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white mb-2"
          />
          <div className="grid grid-cols-3 gap-2">
            <input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white uppercase" />
            <input type="text" value={ano} onChange={(e) => setAno(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white" />
            <input type="text" value={km} onChange={(e) => setKm(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Problema Relatado</label>
          <textarea 
            rows={3} 
            value={problemaRelatado} 
            onChange={(e) => setProblemaRelatado(e.target.value)} 
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none"
          ></textarea>
        </div>
      </div>

      {/* Adicionar Serviços / Itens à Comanda (Com Catálogo Reutilizável) */}
      <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Adicionar Serviço ou Peça na Comanda</h3>
        
        {/* Atalhos do Catálogo Reutilizável */}
        <div>
          <span className="block text-[11px] text-gray-400 mb-2">Serviços salvos anteriormente (clique para preencher rápido):</span>
          <div className="flex flex-wrap gap-2">
            {catalogoServicos.map((serv, index) => (
              <button 
                key={index}
                type="button"
                onClick={() => selecionarDoCatalogo(serv)}
                className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                + {serv}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs de Inclusão */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="md:col-span-2">
            <input 
              type="text" 
              placeholder="Digite o serviço ou peça (Ex: Retifica de cabeçote)..."
              value={descricaoInput}
              onChange={(e) => setDescricaoInput(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-xs text-white"
            />
          </div>
          <div>
            <input 
              type="number" 
              step="0.01"
              placeholder="Valor (R$)"
              value={valorInput}
              onChange={(e) => setValorInput(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <label className="flex items-center text-xs text-gray-400 cursor-pointer">
            <input 
              type="checkbox" 
              checked={salvarNoCatalogo}
              onChange={(e) => setSalvarNoCatalogo(e.target.checked)}
              className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-blue-600 mr-2"
            />
            Salvar este serviço no catálogo para usar em futuros clientes
          </label>

          <button 
            type="button"
            onClick={adicionarItemComanda}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-6 rounded-lg transition-all cursor-pointer"
          >
            Adicionar à Comanda Digital
          </button>
        </div>
      </div>

      {/* Listagem Atualizável da Comanda */}
      <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Itens Registrados na Comanda Atual</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-400">
            <thead className="bg-gray-900 uppercase text-gray-300 border-b border-gray-800">
              <tr>
                <th className="px-4 py-3">Descrição do Serviço / Peça</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {itensComanda.map((item) => (
                <tr key={item.id} className="hover:bg-gray-900/40">
                  <td className="px-4 py-4 font-medium text-white">{item.descricao}</td>
                  <td className="px-4 py-4 text-yellow-500 font-bold">R$ {item.valor.toFixed(2)}</td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => removerItem(item.id)}
                      className="text-red-400 hover:text-red-300 font-bold px-2 py-1 bg-red-950/40 rounded border border-red-900/50 cursor-pointer"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
          <span className="text-xs uppercase font-bold text-gray-400">Total Atualizado da Comanda:</span>
          <span className="text-2xl font-black text-green-400">R$ {valorTotalComanda.toFixed(2)}</span>
        </div>
      </div>

    </div>
  );
}