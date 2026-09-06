'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ComandaDigitalOS from './ComandaDigitalOS';
import GeradorOrcamentoWhatsApp from './GeradorOrcamentoWhatsApp';

interface AdminFinanceiroMasterProps {
  emailUsuario: string;
  onLogout: () => void;
}

interface Despesa {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_vencimento: string;
  status: string;
}

export default function AdminFinanceiroMaster({ emailUsuario, onLogout }: AdminFinanceiroMasterProps) {
  const [abaAtiva, setAbaAtiva] = useState<
    'visao-geral' | 'orcamento-zap' | 'contador-cartao' | 'lucro-pecas' | 'lucro-total' | 'comanda' | 'despesas' | 'pecas' | 'clientes' | 'boletos'
  >('visao-geral');
  
  const [carregando, setCarregando] = useState<boolean>(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState<boolean>(false);

  // Estados dos dados
  const [listaOrdens, setListaOrdens] = useState<any[]>([]);
  const [listaPecas, setListaPecas] = useState<any[]>([]);
  const [listaClientes, setListaClientes] = useState<any[]>([]);
  const [listaBoletos, setListaBoletos] = useState<any[]>([]);
  const [listaDespesas, setListaDespesas] = useState<any[]>([]);

  // Pesquisa de clientes
  const [termoBuscaCliente, setTermoBuscaCliente] = useState<string>('');

  // Estados de Despesas (Cadastro e Edição)
  const [editandoDespesaId, setEditandoDespesaId] = useState<string | null>(null);
  const [descDespesa, setDescDespesa] = useState<string>('');
  const [catDespesa, setCatDespesa] = useState<string>('luz_energia');
  const [valorDespesa, setValorDespesa] = useState<string>('');
  const [dataDespesa, setDataDespesa] = useState<string>('');
  const [mensagemDespesa, setMensagemDespesa] = useState<string>('');

  useEffect(() => {
    carregarDadosAdmin();
  }, []);

  const carregarDadosAdmin = async () => {
    setCarregando(true);
    try {
      const { data: osData } = await supabase.from('ordens_servico').select('*');
      if (osData) setListaOrdens(osData);

      const { data: pecasData } = await supabase.from('pecas_cadastradas').select('*').order('criado_em', { ascending: false });
      if (pecasData) setListaPecas(pecasData);

      const { data: cliData } = await supabase.from('clientes').select('*').order('nome', { ascending: true });
      if (cliData) setListaClientes(cliData);

      const { data: bolData } = await supabase.from('boletos_pecas').select('*').order('data_vencimento', { ascending: true });
      if (bolData) setListaBoletos(bolData);

      const { data: despData } = await supabase.from('despesas_oficina').select('*').order('data_vencimento', { ascending: true });
      if (despData) setListaDespesas(despData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setCarregando(false);
    }
  };

  const salvarDespesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemDespesa('');
    try {
      if (editandoDespesaId) {
        // Atualizar despesa existente
        const { error } = await supabase.from('despesas_oficina').update({
          descricao: descDespesa.trim(),
          categoria: catDespesa,
          valor: parseFloat(valorDespesa) || 0,
          data_vencimento: dataDespesa
        }).eq('id', editandoDespesaId);

        if (error) throw error;
        setMensagemDespesa('Despesa atualizada com sucesso!');
        setEditandoDespesaId(null);
      } else {
        // Inserir nova despesa
        const { error } = await supabase.from('despesas_oficina').insert([{
          descricao: descDespesa.trim(),
          categoria: catDespesa,
          valor: parseFloat(valorDespesa) || 0,
          data_vencimento: dataDespesa,
          status: 'pendente'
        }]);

        if (error) throw error;
        setMensagemDespesa('Despesa cadastrada com sucesso!');
      }

      setDescDespesa('');
      setValorDespesa('');
      setDataDespesa('');
      carregarDadosAdmin();
    } catch (err: any) {
      setMensagemDespesa('Erro: ' + err.message);
    }
  };

  const iniciarEdicaoDespesa = (d: Despesa) => {
    setEditandoDespesaId(d.id);
    setDescDespesa(d.descricao);
    setCatDespesa(d.categoria);
    setValorDespesa(d.valor.toString());
    setDataDespesa(d.data_vencimento);
  };

  const excluirDespesa = async (id: string) => {
    if (!confirm('Deseja excluir permanentemente esta despesa?')) return;
    try {
      const { error } = await supabase.from('despesas_oficina').delete().eq('id', id);
      if (error) throw error;
      carregarDadosAdmin();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  // Cálculos
  const faturamentoTotal = listaOrdens.reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);
  const totalDespesas = listaDespesas.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  const totalBoletosPecas = listaBoletos.reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);

  const pagamentosCartao = listaOrdens.filter(os => 
    os.forma_pagamento && (os.forma_pagamento.toLowerCase().includes('cartao') || os.forma_pagamento.toLowerCase().includes('credito') || os.forma_pagamento.toLowerCase().includes('debito'))
  );
  const totalCartao = pagamentosCartao.reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);

  const custoTotalPecasCadastradas = listaPecas.reduce((acc, curr) => acc + (Number(curr.preco_custo) || 0), 0);
  const vendaTotalPecasCadastradas = listaPecas.reduce((acc, curr) => acc + (Number(curr.preco_venda) || 0), 0);
  const lucroTotalPecasCadastradas = listaPecas.reduce((acc, curr) => acc + (Number(curr.lucro_unitario) || 0), 0);

  const lucroLiquidoGeral = faturamentoTotal - totalDespesas - totalBoletosPecas;

  const clientesFiltrados = listaClientes.filter(cli => 
    cli.nome.toLowerCase().includes(termoBuscaCliente.toLowerCase()) || 
    (cli.telefone && cli.telefone.includes(termoBuscaCliente))
  );

  const mudarAba = (novaAba: any) => {
    setAbaAtiva(novaAba);
    setMenuMobileAberto(false); // Fecha o menu no celular ao clicar
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 text-white">
      
      {/* Botão de Menu Mobile para Celular */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-lg font-black tracking-wider text-white">
            BOX<span className="text-yellow-500">B1</span>
          </h1>
          <span className="text-[10px] text-yellow-500 uppercase font-semibold">Painel Master (Izaias)</span>
        </div>
        <button 
          onClick={() => setMenuMobileAberto(!menuMobileAberto)}
          className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-bold border border-gray-700 cursor-pointer"
        >
          {menuMobileAberto ? '✕ Fechar Menu' : '☰ Menu de Opções'}
        </button>
      </div>

      {/* Barra Lateral (Desktop & Mobile Dropdown) */}
      <aside className={`w-full md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between shadow-xl ${menuMobileAberto ? 'block' : 'hidden md:flex'}`}>
        <div>
          <div className="p-6 border-b border-gray-800 hidden md:block">
            <h1 className="text-2xl font-black tracking-wider text-white">
              BOX<span className="text-yellow-500">B1</span>
            </h1>
            <p className="text-xs font-semibold text-yellow-500 uppercase tracking-widest mt-1">
              Diretoria (Izaias)
            </p>
          </div>

          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
            <button onClick={() => mudarAba('visao-geral')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 cursor-pointer ${abaAtiva === 'visao-geral' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span>📊 Visão Geral & Caixa</span>
            </button>

            <button onClick={() => mudarAba('orcamento-zap')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 cursor-pointer ${abaAtiva === 'orcamento-zap' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span>📱 Orçamento Rápido (WhatsApp)</span>
            </button>

            <button onClick={() => mudarAba('contador-cartao')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 cursor-pointer ${abaAtiva === 'contador-cartao' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span>📑 Relatório Cartão (Contador)</span>
            </button>

            <button onClick={() => mudarAba('lucro-pecas')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 cursor-pointer ${abaAtiva === 'lucro-pecas' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span>📦 Lucro & Custos de Peças</span>
            </button>

            <button onClick={() => mudarAba('lucro-total')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 cursor-pointer ${abaAtiva === 'lucro-total' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span>💰 Lucro Líquido & Balanço Total</span>
            </button>

            <button onClick={() => mudarAba('comanda')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 cursor-pointer ${abaAtiva === 'comanda' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span>📋 Comanda Digital (Admin)</span>
            </button>

            <button onClick={() => mudarAba('despesas')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 cursor-pointer ${abaAtiva === 'despesas' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span>💸 Gastos & Despesas (Editar/Excluir)</span>
            </button>

            <button onClick={() => mudarAba('pecas')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 cursor-pointer ${abaAtiva === 'pecas' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span>🛠️ Peças Cadastradas</span>
            </button>

            <button onClick={() => mudarAba('clientes')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 cursor-pointer ${abaAtiva === 'clientes' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span>👥 Clientes & Pesquisa</span>
            </button>

            <button onClick={() => mudarAba('boletos')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 cursor-pointer ${abaAtiva === 'boletos' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span>🧾 Boletos de Peças</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-950/40">
          <div className="text-xs text-gray-400 mb-2 truncate">
            Admin: <strong className="text-gray-200">{emailUsuario}</strong>
          </div>
          <button onClick={onLogout} className="w-full bg-red-600/25 hover:bg-red-600/40 border border-red-700/50 text-red-300 text-xs font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer text-center">
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 hidden md:flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Diretoria / Controle Geral BOXB1</span>
          <div className="flex items-center space-x-3">
            <button onClick={carregarDadosAdmin} className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer">
              🔄 Sincronizar Dados
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              👑 Master Admin
            </span>
          </div>
        </header>

        <div className="p-4 md:p-8 overflow-y-auto space-y-6">
          {carregando ? (
            <div className="text-xs text-gray-400 py-10 text-center">Carregando informações do Supabase...</div>
          ) : (
            <>
              {/* 1. VISÃO GERAL */}
              {abaAtiva === 'visao-geral' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
                      <span className="text-[11px] uppercase font-bold text-gray-400">Faturamento Bruto</span>
                      <h2 className="text-2xl font-black text-green-400 mt-2">R$ {faturamentoTotal.toFixed(2)}</h2>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
                      <span className="text-[11px] uppercase font-bold text-gray-400">Total Despesas / Gastos</span>
                      <h2 className="text-2xl font-black text-red-400 mt-2">R$ {totalDespesas.toFixed(2)}</h2>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
                      <span className="text-[11px] uppercase font-bold text-gray-400">Boletos de Peças</span>
                      <h2 className="text-2xl font-black text-yellow-400 mt-2">R$ {totalBoletosPecas.toFixed(2)}</h2>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
                      <span className="text-[11px] uppercase font-bold text-gray-400">Lucro Líquido Estimado</span>
                      <h2 className="text-2xl font-black text-blue-400 mt-2">R$ {lucroLiquidoGeral.toFixed(2)}</h2>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ORÇAMENTO WHATSAPP */}
              {abaAtiva === 'orcamento-zap' && <GeradorOrcamentoWhatsApp />}

              {/* 3. RELATÓRIO CARTÃO CONTADOR */}
              {abaAtiva === 'contador-cartao' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white">Relatório de Pagamentos em Cartão (Para o Contador)</h3>
                    <p className="text-xs text-gray-400 mt-1">Listagem de recebimentos via cartão para apuração de impostos mensais.</p>
                  </div>

                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-xs text-gray-400">Total Acumulado em Cartões:</span>
                      <strong className="text-green-400 text-base md:text-lg block">R$ {totalCartao.toFixed(2)}</strong>
                    </div>
                    <span className="text-xs text-yellow-500 font-semibold">{pagamentosCartao.length} transação(ões)</span>
                  </div>

                  <div className="space-y-2">
                    {pagamentosCartao.map((os) => (
                      <div key={os.id} className="bg-gray-950 p-3 rounded-lg border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                        <div>
                          <strong className="text-yellow-400">{os.os_codigo}</strong> - <span className="text-gray-300">{os.problema_relatado}</span>
                          <span className="text-[10px] text-gray-500 block">Forma: {os.forma_pagamento?.toUpperCase()} | Data: {new Date(os.criado_em).toLocaleDateString()}</span>
                        </div>
                        <span className="font-bold text-green-400 text-sm">R$ {Number(os.valor_total).toFixed(2)}</span>
                      </div>
                    ))}
                    {pagamentosCartao.length === 0 && <p className="text-xs text-gray-500 text-center py-6">Nenhum pagamento em cartão registrado.</p>}
                  </div>
                </div>
              )}

              {/* 4. LUCRO E CUSTOS DE PEÇAS */}
              {abaAtiva === 'lucro-pecas' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white">Balanço de Lucro e Gastos com Peças</h3>
                    <p className="text-xs text-gray-400 mt-1">Análise consolidada do custo versus preço de venda cadastrado nas peças.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <span className="text-xs text-gray-400 block">Custo Total de Peças:</span>
                      <strong className="text-red-400 text-base md:text-lg">R$ {custoTotalPecasCadastradas.toFixed(2)}</strong>
                    </div>
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <span className="text-xs text-gray-400 block">Preço de Venda Total:</span>
                      <strong className="text-green-400 text-base md:text-lg">R$ {vendaTotalPecasCadastradas.toFixed(2)}</strong>
                    </div>
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <span className="text-xs text-gray-400 block">Lucro Bruto de Peças:</span>
                      <strong className="text-yellow-400 text-base md:text-lg">R$ {lucroTotalPecasCadastradas.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. LUCRO LÍQUIDO E BALANÇO TOTAL */}
              {abaAtiva === 'lucro-total' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white">Cálculo de Lucro Líquido & Balanço do Mês</h3>
                    <p className="text-xs text-gray-400 mt-1">Visão geral descontando despesas operacionais e boletos de peças.</p>
                  </div>

                  <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4 text-xs">
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">(+) Faturamento Total de Serviços:</span>
                      <strong className="text-green-400 text-sm">R$ {faturamentoTotal.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">(-) Total de Despesas (Luz, Maquininha, etc.):</span>
                      <strong className="text-red-400 text-sm">R$ {totalDespesas.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">(-) Total de Boletos de Peças:</span>
                      <strong className="text-red-400 text-sm">R$ {totalBoletosPecas.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-bold">
                      <span className="text-white">= Lucro Líquido Real Disponível:</span>
                      <span className={`text-base ${lucroLiquidoGeral >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        R$ {lucroLiquidoGeral.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. COMANDA DIGITAL ADMIN */}
              {abaAtiva === 'comanda' && <ComandaDigitalOS />}

              {/* 7. DESPESAS COM EDIÇÃO E EXCLUSÃO DEFINITIVA */}
              {abaAtiva === 'despesas' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white">Gerenciamento Definitivo de Gastos & Despesas</h3>
                    <p className="text-xs text-gray-400 mt-1">Cadastre, edite ou exclua custos como luz, funcionários, maquininha e aluguel. Salvo direto no Supabase.</p>
                  </div>

                  {mensagemDespesa && <div className="bg-gray-950 p-3 rounded border border-gray-800 text-xs text-yellow-400 font-semibold">{mensagemDespesa}</div>}

                  <form onSubmit={salvarDespesa} className="space-y-4 bg-gray-950 p-6 rounded-xl border border-gray-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500">
                      {editandoDespesaId ? 'Editando Despesa' : 'Nova Despesa'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Descrição</label>
                        <input type="text" value={descDespesa} onChange={(e) => setDescDespesa(e.target.value)} placeholder="Ex: Conta de Luz" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Categoria</label>
                        <select value={catDespesa} onChange={(e) => setCatDespesa(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
                          <option value="luz_energia">Luz / Energia</option>
                          <option value="funcionario">Funcionário / Salário</option>
                          <option value="maquininha">Taxa de Maquininha</option>
                          <option value="aluguel">Aluguel</option>
                          <option value="outros">Outros</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Valor (R$)</label>
                        <input type="number" step="0.01" value={valorDespesa} onChange={(e) => setValorDespesa(e.target.value)} placeholder="0.00" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Vencimento</label>
                        <input type="date" value={dataDespesa} onChange={(e) => setDataDespesa(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white" required />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button type="submit" className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-xs py-3 rounded-lg cursor-pointer">
                        {editandoDespesaId ? 'Salvar Alterações' : 'Cadastrar Despesa'}
                      </button>
                      {editandoDespesaId && (
                        <button type="button" onClick={() => { setEditandoDespesaId(null); setDescDespesa(''); setValorDespesa(''); setDataDespesa(''); }} className="bg-gray-800 text-gray-300 px-4 py-3 rounded-lg text-xs font-bold">
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="space-y-2 pt-4 border-t border-gray-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500">Despesas Registradas</h4>
                    {listaDespesas.map((d) => (
                      <div key={d.id} className="bg-gray-950 p-3 rounded-xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                        <div>
                          <strong className="text-white">{d.descricao}</strong> (<span className="uppercase text-yellow-400">{d.categoria}</span>) - Venc: {d.data_vencimento}
                          <strong className="text-red-400 block sm:hidden mt-1">R$ {Number(d.valor).toFixed(2)}</strong>
                        </div>
                        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                          <span className="font-bold text-red-400 hidden sm:inline">R$ {Number(d.valor).toFixed(2)}</span>
                          <div className="space-x-1">
                            <button onClick={() => iniciarEdicaoDespesa(d)} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-[10px] font-bold cursor-pointer">✏️ Editar</button>
                            <button onClick={() => excluirDespesa(d.id)} className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-[10px] font-bold cursor-pointer">🗑️ Excluir</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {listaDespesas.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Nenhuma despesa cadastrada.</p>}
                  </div>
                </div>
              )}

              {/* 8. PEÇAS */}
              {abaAtiva === 'pecas' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-4">
                  <h3 className="text-lg md:text-xl font-black text-white">Peças Lançadas pela Operação</h3>
                  <div className="space-y-2">
                    {listaPecas.map((p) => (
                      <div key={p.id} className="bg-gray-950 p-3 rounded-xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                        <div>
                          <strong className="text-yellow-400">{p.nome_peca}</strong>
                          <span className="text-gray-400 block">Custo: R$ {Number(p.preco_custo).toFixed(2)} | Venda: R$ {Number(p.preco_venda).toFixed(2)}</span>
                        </div>
                        <span className="font-bold text-green-400">Lucro Unit.: R$ {Number(p.lucro_unitario).toFixed(2)}</span>
                      </div>
                    ))}
                    {listaPecas.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Nenhuma peça cadastrada.</p>}
                  </div>
                </div>
              )}

              {/* 9. GESTÃO DE CLIENTES COM PESQUISA RESPONSIVA */}
              {abaAtiva === 'clientes' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white">Base de Clientes & Módulo de Pesquisa</h3>
                    <p className="text-xs text-gray-400 mt-1">Busque instantaneamente por nome ou telefone do cliente.</p>
                  </div>

                  <div>
                    <input 
                      type="text" 
                      value={termoBuscaCliente} 
                      onChange={(e) => setTermoBuscaCliente(e.target.value)} 
                      placeholder="🔍 Pesquisar por nome ou telefone..." 
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white shadow-inner" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clientesFiltrados.map((cli) => (
                      <div key={cli.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs space-y-1">
                        <h4 className="font-bold text-white text-sm">{cli.nome}</h4>
                        <p className="text-gray-400">Telefone: {cli.telefone}</p>
                      </div>
                    ))}
                    {clientesFiltrados.length === 0 && <p className="text-xs text-gray-500 text-center py-6 col-span-2">Nenhum cliente encontrado.</p>}
                  </div>
                </div>
              )}

              {/* 10. BOLETOS */}
              {abaAtiva === 'boletos' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-4">
                  <h3 className="text-lg md:text-xl font-black text-white">Controle de Boletos de Peças</h3>
                  <div className="space-y-2">
                    {listaBoletos.map((b) => (
                      <div key={b.id} className="bg-gray-950 p-3 rounded-xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                        <div>
                          <strong className="text-yellow-400">{b.fornecedor}</strong> - Boleto: {b.numero_boleto}
                          <span className="text-gray-400 block">Vencimento: {b.data_vencimento}</span>
                        </div>
                        <span className="font-bold text-red-400">R$ {Number(b.valor_total).toFixed(2)}</span>
                      </div>
                    ))}
                    {listaBoletos.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Nenhum boleto registrado.</p>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}