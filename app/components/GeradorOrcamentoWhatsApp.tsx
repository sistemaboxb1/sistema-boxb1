'use client';

import React, { useState } from 'react';

interface ItemOrcamento {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export default function GeradorOrcamentoWhatsApp() {
  const [nomeCliente, setNomeCliente] = useState<string>('');
  const [telefoneCliente, setTelefoneCliente] = useState<string>('');
  const [veiculo, setVeiculo] = useState<string>('');
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  
  const [descItem, setDescItem] = useState<string>('');
  const [qtdItem, setQtdItem] = useState<string>('1');
  const [valorItem, setValorItem] = useState<string>('');

  const adicionarItem = () => {
    if (!descItem.trim() || !valorItem) return;
    setItens([
      ...itens,
      {
        descricao: descItem.trim(),
        quantidade: parseInt(qtdItem) || 1,
        valorUnitario: parseFloat(valorItem) || 0
      }
    ]);
    setDescItem('');
    setQtdItem('1');
    setValorItem('');
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const valorTotal = itens.reduce((acc, curr) => acc + (curr.quantidade * curr.valorUnitario), 0);

  const enviarWhatsApp = () => {
    if (!telefoneCliente || itens.length === 0) {
      alert('Preencha o telefone do cliente e adicione pelo menos um item ao orçamento.');
      return;
    }

    // Formata o número de telefone (remove caracteres não numéricos)
    const telLimpo = telefoneCliente.replace(/\D/g, '');

    let mensagem = `🔧 *BOXB1 - ORÇAMENTO DE OFICINA* 🔧\n\n`;
    mensagem += `👤 *Cliente:* ${nomeCliente}\n`;
    mensagem += `🚗 *Veículo:* ${veiculo}\n\n`;
    mensagem += `📋 *Serviços e Peças Propostos:*\n`;

    itens.forEach((item, index) => {
      mensagem += `${index + 1}. ${item.quantidade}x ${item.descricao} - R$ ${(item.quantidade * item.valorUnitario).toFixed(2)}\n`;
    });

    mensagem += `\n💰 *VALOR TOTAL:* *R$ ${valorTotal.toFixed(2)}*\n\n`;
    mensagem += `Responda esta mensagem com *APROVADO* para autorizarmos o início do serviço em seu veículo!`;

    const url = `https://api.whatsapp.com/send?phone=55${telLimpo}&text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
      <div>
        <h3 className="text-xl font-black text-white">Gerador de Orçamento Rápido (WhatsApp)</h3>
        <p className="text-xs text-gray-400 mt-1">Monte o orçamento de peças e serviços e envie instantaneamente para o cliente aprovar no WhatsApp.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-950 p-6 rounded-xl border border-gray-800">
        <div>
          <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Nome do Cliente</label>
          <input 
            type="text" 
            value={nomeCliente} 
            onChange={(e) => setNomeCliente(e.target.value)} 
            placeholder="Ex: Carlos Silva" 
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">WhatsApp (com DDD)</label>
          <input 
            type="text" 
            value={telefoneCliente} 
            onChange={(e) => setTelefoneCliente(e.target.value)} 
            placeholder="Ex: 11999999999" 
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Veículo (Modelo / Placa)</label>
          <input 
            type="text" 
            value={veiculo} 
            onChange={(e) => setVeiculo(e.target.value)} 
            placeholder="Ex: Fiat Palio - ABC-1234" 
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
          />
        </div>
      </div>

      <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500">Adicionar Itens ao Orçamento</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input 
            type="text" 
            value={descItem} 
            onChange={(e) => setDescItem(e.target.value)} 
            placeholder="Peça ou Serviço..." 
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white md:col-span-2" 
          />
          <input 
            type="number" 
            value={qtdItem} 
            onChange={(e) => setQtdItem(e.target.value)} 
            placeholder="Qtd" 
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
          />
          <div className="flex space-x-2">
            <input 
              type="number" 
              step="0.01" 
              value={valorItem} 
              onChange={(e) => setValorItem(e.target.value)} 
              placeholder="R$ Unitário" 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
            />
            <button type="button" onClick={adicionarItem} className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold text-white cursor-pointer">+</button>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          {itens.map((item, idx) => (
            <div key={idx} className="bg-gray-900 p-3 rounded-lg flex justify-between items-center text-xs">
              <span>{item.quantidade}x {item.descricao} — R$ {item.valorUnitario.toFixed(2)} un. (Total: R$ {(item.quantidade * item.valorUnitario).toFixed(2)})</span>
              <button type="button" onClick={() => removerItem(idx)} className="text-red-400 font-bold cursor-pointer">✕</button>
            </div>
          ))}
          {itens.length === 0 && <p className="text-xs text-gray-500 text-center py-2">Nenhum item adicionado ao orçamento ainda.</p>}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-800">
          <div>
            <span className="text-xs text-gray-400 block">Valor Total do Orçamento:</span>
            <strong className="text-green-400 text-lg">R$ {valorTotal.toFixed(2)}</strong>
          </div>
          <button 
            type="button" 
            onClick={enviarWhatsApp} 
            className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs py-3 px-6 rounded-lg cursor-pointer flex items-center space-x-2"
          >
            <span>📱 Enviar Orçamento via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}