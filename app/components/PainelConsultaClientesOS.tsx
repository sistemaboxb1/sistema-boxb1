'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PecaItem {
  id: string;
  nome_peca: string;
  preco_custo: number;
  preco_venda: number;
  lucro_unitario: number;
  criado_em: string;
}

export default function PainelPecasFuncionario() {
  const [nomePeca, setNomePeca] = useState<string>('');
  const [custoPeca, setCustoPeca] = useState<string>('');
  const [vendaPeca, setVendaPeca] = useState<string>('');
  const [mensagem, setMensagem] = useState<string>('');
  const [listaPecas, setListaPecas] = useState<PecaItem[]>([]);

  useEffect(() => {
    carregarPecas();
  }, []);

  const carregarPecas = async () => {
    const { data } = await supabase
      .from('pecas_cadastradas')
      .select('*')
      .order('criado_em', { ascending: false });
    if (data) setListaPecas(data);
  };

  const salvarPeca = async (e: React.FormEvent) => {
    e.preventDefault();
    const custo = parseFloat(custoPeca) || 0;
    const venda = parseFloat(vendaPeca) || 0;
    const lucro = venda - custo;

    try {
      const { error } = await supabase.from('pecas_cadastradas').insert([{
        nome_peca: nomePeca.trim(),
        preco_custo: custo,
        preco_venda: venda,
        lucro_unitario: lucro
      }]);

      if (error) throw error;
      setMensagem('Peça cadastrada com sucesso e integrada ao painel do Admin!');
      setNomePeca('');
      setCustoPeca('');
      setVendaPeca('');
      carregarPecas();
    } catch (err: any) {
      setMensagem('Erro ao cadastrar peça: ' + err.message);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
      <div>
        <h3 className="text-xl font-black text-white">Cadastro de Peças & Margens</h3>
        <p className="text-xs text-gray-400 mt-1">Cadastre as peças comercializadas. O registro fica isolado aqui e sincronizado com a diretoria, sem poluir as Ordens de Serviço.</p>
      </div>

      {mensagem && (
        <div className="bg-gray-950 p-3 rounded border border-gray-800 text-xs text-yellow-400 font-semibold">
          {mensagem}
        </div>
      )}

      <form onSubmit={salvarPeca} className="space-y-4 bg-gray-950 p-6 rounded-xl border border-gray-800">
        <div>
          <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Nome da Peça</label>
          <input 
            type="text" 
            value={nomePeca} 
            onChange={(e) => setNomePeca(e.target.value)} 
            placeholder="Ex: Pastilha de Freio Dianteira"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
            required 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Preço de Custo (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              value={custoPeca} 
              onChange={(e) => setCustoPeca(e.target.value)} 
              placeholder="0.00"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
              required 
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Preço de Venda (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              value={vendaPeca} 
              onChange={(e) => setVendaPeca(e.target.value)} 
              placeholder="0.00"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
              required 
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-lg cursor-pointer">
          Cadastrar Peça no Sistema
        </button>
      </form>

      {/* Histórico Restrito apenas a Peças */}
      <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">Histórico de Peças Cadastradas</h4>
        <div className="space-y-2">
          {listaPecas.map((p) => (
            <div key={p.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center text-xs border border-gray-800">
              <div>
                <span className="font-bold text-yellow-500">{p.nome_peca}</span>
                <p className="text-gray-400 mt-0.5">Custo: R$ {Number(p.preco_custo).toFixed(2)} | Venda: R$ {Number(p.preco_venda).toFixed(2)}</p>
              </div>
              <div className="text-right">
                <span className="font-black text-green-400 block">Lucro Unit: R$ {Number(p.lucro_unitario).toFixed(2)}</span>
              </div>
            </div>
          ))}
          {listaPecas.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">Nenhuma peça cadastrada isoladamente ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}