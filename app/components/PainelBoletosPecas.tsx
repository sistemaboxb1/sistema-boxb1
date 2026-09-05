'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ItemBoleto {
  id?: string;
  nome_peca: string;
  quantidade: number;
  valor_unitario: number;
}

interface BoletoRegistro {
  id: string;
  fornecedor: string;
  numero_boleto: string;
  valor_total: number;
  data_vencimento: string;
  foto_url?: string;
  status: string;
  itens?: ItemBoleto[];
}

export default function PainelBoletosPecas() {
  const [fornecedor, setFornecedor] = useState<string>('');
  const [numeroBoleto, setNumeroBoleto] = useState<string>('');
  const [valorTotal, setValorTotal] = useState<string>('');
  const [dataVencimento, setDataVencimento] = useState<string>('');
  const [fotoUrl, setFotoUrl] = useState<string>('');
  
  const [itens, setItens] = useState<ItemBoleto[]>([]);
  const [pecaNome, setPecaNome] = useState<string>('');
  const [pecaQtd, setPecaQtd] = useState<string>('1');
  const [pecaValor, setPecaValor] = useState<string>('');

  const [listaBoletos, setListaBoletos] = useState<BoletoRegistro[]>([]);
  const [mensagem, setMensagem] = useState<string>('');

  useEffect(() => {
    carregarBoletos();
  }, []);

  const carregarBoletos = async () => {
    try {
      const { data, error } = await supabase
        .from('boletos_pecas')
        .select('*')
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      if (data) setListaBoletos(data);
    } catch (err) {
      console.error('Erro ao carregar boletos:', err);
    }
  };

  const adicionarItemLista = () => {
    if (!pecaNome.trim() || !pecaValor) return;
    setItens([
      ...itens,
      {
        nome_peca: pecaNome.trim(),
        quantidade: parseInt(pecaQtd) || 1,
        valor_unitario: parseFloat(pecaValor) || 0
      }
    ]);
    setPecaNome('');
    setPecaQtd('1');
    setPecaValor('');
  };

  const removerItemLista = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const salvarBoletoSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');

    try {
      const { data: boletoCriado, error: errBoleto } = await supabase
        .from('boletos_pecas')
        .insert([{
          fornecedor: fornecedor.trim(),
          numero_boleto: numeroBoleto.trim(),
          valor_total: parseFloat(valorTotal) || 0,
          data_vencimento: dataVencimento,
          foto_url: fotoUrl.trim() || null,
          status: 'pendente'
        }])
        .select()
        .single();

      if (errBoleto) throw errBoleto;

      if (itens.length > 0 && boletoCriado) {
        const itensParaSalvar = itens.map(i => ({
          boleto_id: boletoCriado.id,
          nome_peca: i.nome_peca,
          quantidade: i.quantidade,
          valor_unitario: i.valor_unitario
        }));

        const { error: errItens } = await supabase.from('itens_boletos').insert(itensParaSalvar);
        if (errItens) throw errItens;
      }

      setMensagem('Boleto e peças detalhadas salvos com sucesso!');
      setFornecedor('');
      setNumeroBoleto('');
      setValorTotal('');
      setDataVencimento('');
      setFotoUrl('');
      setItens([]);
      carregarBoletos();
    } catch (err: any) {
      setMensagem('Erro ao salvar boleto: ' + err.message);
    }
  };

  const excluirBoleto = async (id: string) => {
    if (!confirm('Deseja realmente excluir este boleto?')) return;
    try {
      const { error } = await supabase.from('boletos_pecas').delete().eq('id', id);
      if (error) throw error;
      setMensagem('Boleto excluído com sucesso.');
      carregarBoletos();
    } catch (err: any) {
      alert('Erro ao excluir boleto: ' + err.message);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-8">
      <div>
        <h3 className="text-xl font-black text-white">Painel de Boletos de Revendedores de Peças</h3>
        <p className="text-xs text-gray-400 mt-1">Registre contas a pagar, anexe comprovantes e gerencie o estoque detalhado por peça.</p>
      </div>

      {mensagem && (
        <div className="bg-gray-950 p-3 rounded border border-gray-800 text-xs text-yellow-400 font-semibold">
          {mensagem}
        </div>
      )}

      <form onSubmit={salvarBoletoSupabase} className="space-y-6 bg-gray-950 p-6 rounded-xl border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Fornecedor / Loja de Peças</label>
            <input 
              type="text" 
              value={fornecedor} 
              onChange={(e) => setFornecedor(e.target.value)} 
              placeholder="Ex: Distribuidora AutoPeças X"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
              required 
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Número do Boleto / Linha Digitável</label>
            <input 
              type="text" 
              value={numeroBoleto} 
              onChange={(e) => setNumeroBoleto(e.target.value)} 
              placeholder="Ex: 34191.79001 01043..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
              required 
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Valor Total (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              value={valorTotal} 
              onChange={(e) => setValorTotal(e.target.value)} 
              placeholder="0.00"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
              required 
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Data de Vencimento</label>
            <input 
              type="date" 
              value={dataVencimento} 
              onChange={(e) => setDataVencimento(e.target.value)} 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Link da Foto ou Comprovante do Boleto (Opcional)</label>
          <input 
            type="text" 
            value={fotoUrl} 
            onChange={(e) => setFotoUrl(e.target.value)} 
            placeholder="https://exemplo.com/foto-boleto.jpg"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
          />
        </div>

        {/* Detalhamento de Peça por Peça */}
        <div className="border-t border-gray-800 pt-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500">Detalhar Peças deste Boleto</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input 
              type="text" 
              placeholder="Nome da peça..." 
              value={pecaNome} 
              onChange={(e) => setPecaNome(e.target.value)} 
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white md:col-span-1" 
            />
            <input 
              type="number" 
              placeholder="Qtd" 
              value={pecaQtd} 
              onChange={(e) => setPecaQtd(e.target.value)} 
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
            />
            <div className="flex space-x-2">
              <input 
                type="number" 
                step="0.01" 
                placeholder="Valor Unitário R$" 
                value={pecaValor} 
                onChange={(e) => setPecaValor(e.target.value)} 
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" 
              />
              <button type="button" onClick={adicionarItemLista} className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold text-white cursor-pointer">+</button>
            </div>
          </div>

          <div className="space-y-1">
            {itens.map((item, idx) => (
              <div key={idx} className="bg-gray-900 p-2 rounded flex justify-between items-center text-xs">
                <span>{item.quantidade}x {item.nome_peca} - R$ {item.valor_unitario.toFixed(2)} un.</span>
                <button type="button" onClick={() => removerItemLista(idx)} className="text-red-400 font-bold">✕</button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-lg cursor-pointer">
          Salvar Boleto e Itens no Sistema
        </button>
      </form>

      {/* Lista de Boletos Cadastrados com Botão de Excluir */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">Boletos Registrados</h4>
        <div className="space-y-3">
          {listaBoletos.map((b) => (
            <div key={b.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-yellow-500 text-sm">{b.fornecedor}</span>
                <p className="text-gray-400 mt-0.5">Boleto: {b.numero_boleto} | Vencimento: {b.data_vencimento}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="font-black text-green-400 text-sm block">R$ {Number(b.valor_total).toFixed(2)}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-400 uppercase">{b.status}</span>
                </div>
                <button onClick={() => excluirBoleto(b.id)} className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-700/50 px-2.5 py-1.5 rounded font-bold cursor-pointer">
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))}
          {listaBoletos.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">Nenhum boleto cadastrado até o momento.</p>
          )}
        </div>
      </div>
    </div>
  );
}