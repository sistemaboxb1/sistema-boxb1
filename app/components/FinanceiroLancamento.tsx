'use client';

import React, { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';

interface FinanceiroLancamentoProps {
  osIdMock?: string; // ID da Ordem de Serviço vinculada
}

export default function FinanceiroLancamento({ osIdMock = 'OS-2026-001' }: FinanceiroLancamentoProps) {
  // Estados detalhados para controle fiscal e de recebimento
  const [osId, setOsId] = useState<string>(osIdMock);
  const [valorBruto, setValorBruto] = useState<string>('');
  const [statusPagamento, setStatusPagamento] = useState<'pago' | 'aguardando' | 'parcelado'>('pago');
  const [formaPagamento, setFormaPagamento] = useState<'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'boleto'>('cartao_credito');
  
  // Variáveis específicas para Cartão de Crédito e Parcelamento (Cálculo de Impostos / Contador)
  const [tipoCartao, setTipoCartao] = useState<'credito_avista' | 'credito_parcelado'>('credito_parcelado');
  const [numeroParcelas, setNumeroParcelas] = useState<number>(3);
  const [teveJuros, setTeveJuros] = useState<boolean>(true);
  const [taxaJurosPercentual, setTaxaJurosPercentual] = useState<string>('2.99');
  const [valorJuros, setValorJuros] = useState<string>('');
  
  const [salvando, setSalvando] = useState<boolean>(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [erro, setErro] = useState<string>('');

  /**
   * Função que processa o lançamento financeiro calculando taxas, juros 
   * e separando os dados fiscais essenciais para o contador.
   */
  const lidarComSalvarFinanceiro = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    setMensagemSucesso('');

    try {
      const valorNum = parseFloat(valorBruto) || 0;
      const jurosNum = parseFloat(valorJuros) || 0;
      const valorTotalComJuros = valorNum + (teveJuros ? jurosNum : 0);

      // Objeto estruturado com todas as variáveis financeiras e fiscais para o Supabase
      const dadosFinanceiros = {
        os_id: osId,
        valor_bruto: valorNum,
        status_pagamento: statusPagamento,
        forma_pagamento: formaPagamento,
        detalhes_cartao: formaPagamento === 'cartao_credito' ? {
          tipo_cartao: tipoCartao,
          parcelas: tipoCartao === 'credito_parcelado' ? numeroParcelas : 1,
          teve_juros: teveJuros,
          taxa_juros: teveJuros ? parseFloat(taxaJurosPercentual) : 0,
          valor_juros: teveJuros ? jurosNum : 0,
          valor_final_transacao: valorTotalComJuros
        } : null,
        criado_em: new Date().toISOString()
      };

      // Simulação de salvamento estruturado (pronto para inserir na tabela 'financeiro' do Supabase)
      console.log('Dados financeiros preparados para o Supabase:', dadosFinanceiros);
      
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setMensagemSucesso('Lançamento financeiro vinculado à O.S. e registrado com sucesso para o relatório do contador!');
    } catch (err) {
      setErro('Erro ao registrar lançamento financeiro. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
      
      {/* Cabeçalho do Módulo */}
      <div>
        <h3 className="text-xl font-black text-white">Vínculo Financeiro e Fechamento de O.S.</h3>
        <p className="text-xs text-gray-400 mt-1">
          Associe o valor do serviço executado, configure meios de pagamento, parcelamentos de cartão e controle de recebimentos fiscais.
        </p>
      </div>

      {/* Alertas de Feedback */}
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

      {/* Formulário Principal Detalhado */}
      <form onSubmit={lidarComSalvarFinanceiro} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identificação da O.S. */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Referência da O.S.
            </label>
            <input 
              type="text" 
              value={osId}
              onChange={(e) => setOsId(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Valor Bruto do Serviço */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Valor Bruto do Serviço (R$)
            </label>
            <input 
              type="number" 
              step="0.01"
              placeholder="0.00"
              value={valorBruto}
              onChange={(e) => setValorBruto(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Status do Pagamento */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Status do Pagamento
            </label>
            <select 
              value={statusPagamento}
              onChange={(e) => setStatusPagamento(e.target.value as any)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="pago">Pago (Quitado)</option>
              <option value="aguardando">Aguardando Pagamento</option>
              <option value="parcelado">Parcelado (Em Aberto)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Forma de Pagamento
            </label>
            <select 
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value as any)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="boleto">Boleto Bancário</option>
            </select>
          </div>

          {/* Campos condicionais se a forma for Cartão de Crédito */}
          {formaPagamento === 'cartao_credito' && (
            <div className="space-y-4 bg-gray-950/60 p-4 rounded-xl border border-gray-800">
              <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Parâmetros de Cartão para o Contador</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Modalidade</label>
                  <select 
                    value={tipoCartao}
                    onChange={(e) => setTipoCartao(e.target.value as any)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="credito_avista">Crédito à Vista</option>
                    <option value="credito_parcelado">Crédito Parcelado</option>
                  </select>
                </div>

                {tipoCartao === 'credito_parcelado' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Nº de Parcelas</label>
                    <input 
                      type="number" 
                      min="2" 
                      max="12"
                      value={numeroParcelas}
                      onChange={(e) => setNumeroParcelas(parseInt(e.target.value) || 1)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input 
                  type="checkbox" 
                  id="teveJuros"
                  checked={teveJuros}
                  onChange={(e) => setTeveJuros(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-blue-600"
                />
                <label htmlFor="teveJuros" className="text-xs text-gray-300 cursor-pointer">Incidiu juros de parcelamento ao cliente?</label>
              </div>

              {teveJuros && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Taxa de Juros (%)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={taxaJurosPercentual}
                      onChange={(e) => setTaxaJurosPercentual(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Valor do Juros (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={valorJuros}
                      onChange={(e) => setValorJuros(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botão de Submissão */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={salvando}
            className="w-full flex justify-center items-center rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-500 cursor-pointer disabled:opacity-50"
          >
            {salvando ? 'Processando Lançamento...' : 'Salvar Fechamento e Integrar com Caixa'}
          </button>
        </div>

      </form>
    </div>
  );
}