'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ItemBoleto {
  id: string;
  peca: string;
  quantidade: number;
  valorUnitario: number;
}

interface BoletoRegistro {
  id: string;
  codigo_boleto: string;
  revendedor: string;
  valor_total: number;
  data_validade: string;
  foto_url: string;
  status: 'pendente' | 'pago';
}

export default function PainelBoletosPecas() {
  const [revendedor, setRevendedor] = useState<string>('Auto Peças Distribuidora B1');
  const [dataValidade, setDataValidade] = useState<string>('');
  const [fotoBoleto, setFotoBoleto] = useState<File | null>(null);
  
  const [itensBoleto, setItensBoleto] = useState<ItemBoleto[]>([
    { id: '1', peca: 'Kit Embreagem Corsa 1.8', quantidade: 1, valorUnitario: 380.00 },
    { id: '2', peca: 'Amortecedor Dianteiro Par', quantidade: 1, valorUnitario: 450.00 }
  ]);

  const [pecaInput, setPecaInput] = useState<string>('');
  const [qtdInput, setQtdInput] = useState<string>('1');
  const [valorUnitInput, setValorUnitInput] = useState<string>('');
  
  const [boletosSalvos, setBoletosSalvos] = useState<BoletoRegistro[]>([]);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<string>('');

  // Busca os boletos salvos no Supabase ao carregar a página
  useEffect(() => {
    carregarBoletos();
  }, []);

  const carregarBoletos = async () => {
    try {
      const { data, error } = await supabase
        .from('boletos_pecas')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      if (data) setBoletosSalvos(data);
    } catch (err) {
      console.error('Erro ao buscar boletos:', err);
    }
  };

  const adicionarItemBoleto = () => {
    if (!pecaInput.trim() || !valorUnitInput) return;
    const novoItem: ItemBoleto = {
      id: Date.now().toString(),
      peca: pecaInput.trim(),
      quantidade: parseInt(qtdInput) || 1,
      valorUnitario: parseFloat(valorUnitInput) || 0
    };
    setItensBoleto([...itensBoleto, novoItem]);
    setPecaInput('');
    setQtdInput('1');
    setValorUnitInput('');
  };

  const removerItemBoleto = (id: string) => {
    setItensBoleto(itensBoleto.filter(i => i.id !== id));
  };

  const lidarComEnvioBoleto = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');

    try {
      const valorTotalCalc = itensBoleto.reduce((acc, i) => acc + (i.quantidade * i.valorUnitario), 0);
      const codigoGerado = `BOL-${Math.floor(100 + Math.random() * 900)}`;

      // 1. Salva o boleto principal no Supabase
      const { data: boletoData, error: boletoError } = await supabase
        .from('boletos_pecas')
        .insert([
          {
            codigo_boleto: codigoGerado,
            revendedor: revendedor.trim(),
            valor_total: valorTotalCalc,
            data_validade: dataValidade,
            foto_url: fotoBoleto ? fotoBoleto.name : 'sem_foto.png',
            status: 'pendente'
          }
        ])
        .select()
        .single();

      if (boletoError) throw boletoError;
      const boletoId = boletoData.id;

      // 2. Salva os itens discriminados do boleto
      if (itensBoleto.length > 0) {
        const itensFormatados = itensBoleto.map(item => ({
          boleto_id: boletoId,
          peca: item.peca,
          quantidade: item.quantidade,
          valor_unitario: item.valorUnitario
        }));

        const { error: itensError } = await supabase
          .from('itens_boletos')
          .insert(itensFormatados);

        if (itensError) throw itensError;
      }

      setMensagem('Boleto, itens e foto salvos com sucesso no Supabase!');
      setRevendedor('');
      setDataValidade('');
      setFotoBoleto(null);
      setItensBoleto([]);
      carregarBoletos(); // Atualiza a lista na tela

    } catch (err: any) {
      console.error('Erro ao salvar boleto:', err);
      setMensagem('Erro ao salvar boleto: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-8">
      
      <div>
        <h3 className="text-xl font-black text-white">Painel de Boletos de Revendedores de Peças (Supabase)</h3>
        <p className="text-xs text-gray-400 mt-1">
          Registre contas a pagar, anexe a foto do boleto físico, defina validade e detalhe peça por peça com persistência real.
        </p>
      </div>

      {mensagem && (
        <div className="rounded-lg bg-gray-950 border border-gray-800 p-3 text-xs text-yellow-400 font-semibold">
          {mensagem}
        </div>
      )}

      {/* Formulário de Cadastro de Boleto */}
      <form onSubmit={lidarComEnvioBoleto} className="space-y-6 bg-gray-950 p-6 rounded-xl border border-gray-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500">Cadastrar Novo Boleto de Peças</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Revendedor / Fornecedor</label>
            <input 
              type="text" 
              value={revendedor}
              onChange={(e) => setRevendedor(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Data de Validade (Vencimento)</label>
            <input 
              type="date" 
              value={dataValidade}
              onChange={(e) => setDataValidade(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Foto / Imagem do Boleto</label>
            <input 
              type="file" 
              accept="image/*,application/pdf"
              onChange={(e) => e.target.files && setFotoBoleto(e.target.files[0])}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white cursor-pointer"
            />
          </div>
        </div>

        {/* Detalhamento de Itens do Boleto */}
        <div className="space-y-3 pt-2 border-t border-gray-800">
          <span className="block text-xs font-bold uppercase text-gray-300">Detalhamento das Peças Contidas no Boleto</span>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <input 
                type="text" 
                placeholder="Nome da peça..."
                value={pecaInput}
                onChange={(e) => setPecaInput(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <input 
                type="number" 
                min="1"
                placeholder="Qtd"
                value={qtdInput}
                onChange={(e) => setQtdInput(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="flex space-x-2">
              <input 
                type="number" 
                step="0.01"
                placeholder="Valor Unit. R$"
                value={valorUnitInput}
                onChange={(e) => setValorUnitInput(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              />
              <button 
                type="button"
                onClick={adicionarItemBoleto}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-xs font-bold text-white cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-800">
            {itensBoleto.map((item) => (
              <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                <span className="text-gray-300">{item.quantidade}x {item.peca}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-yellow-500 font-bold">R$ {(item.quantidade * item.valorUnitario).toFixed(2)}</span>
                  <button type="button" onClick={() => removerItemBoleto(item.id)} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            disabled={salvando}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold text-xs py-3 rounded-lg transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {salvando ? 'Salvando no Banco...' : 'Salvar Boleto, Foto e Itens no Supabase'}
          </button>
        </div>
      </form>

      {/* Lista de Boletos Registrados no Supabase */}
      <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">Boletos Cadastrados (Banco de Dados)</h4>
        
        <div className="space-y-4">
          {boletosSalvos.map((bol) => (
            <div key={bol.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-yellow-500">{bol.codigo_boleto} - {bol.revendedor}</span>
                <p className="text-sm font-black text-white mt-0.5">Total: R$ {Number(bol.valor_total).toFixed(2)}</p>
                <p className="text-[11px] text-gray-400 mt-1">Vencimento: <strong className="text-red-400">{bol.data_validade}</strong> | Arquivo: {bol.foto_url}</p>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 mb-2">
                  {bol.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
          {boletosSalvos.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">Nenhum boleto cadastrado no banco ainda.</p>
          )}
        </div>
      </div>

    </div>
  );
}