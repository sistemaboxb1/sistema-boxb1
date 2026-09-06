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

// Helper para pegar o mês atual no formato YYYY-MM
const getMesAtualYYYYMM = () => new Date().toISOString().slice(0, 7);

const formatarMesAno = (yyyyMm: string) => {
  if (!yyyyMm) return '';
  const [ano, mes] = yyyyMm.split('-');
  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return `${nomesMeses[parseInt(mes) - 1]} de ${ano}`;
};

export default function AdminFinanceiroMaster({ emailUsuario, onLogout }: AdminFinanceiroMasterProps) {
  const [abaAtiva, setAbaAtiva] = useState<
    'visao-geral' | 'orcamento-zap' | 'contador-cartao' | 'lucro-pecas' | 'lucro-total' | 'comanda' | 'despesas' | 'clientes' | 'boletos'
  >('visao-geral');
  
  const [carregando, setCarregando] = useState<boolean>(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState<boolean>(false);

  // Mês de Referência Global (Fechamento Mensal)
  const [mesSelecionado, setMesSelecionado] = useState<string>(getMesAtualYYYYMM());
  const [mesesDisponiveis, setMesesDisponiveis] = useState<string[]>([]);

  // Estados dos dados brutos
  const [listaOrdens, setListaOrdens] = useState<any[]>([]);
  const [listaPecas, setListaPecas] = useState<any[]>([]);
  const [listaClientes, setListaClientes] = useState<any[]>([]);
  const [listaBoletos, setListaBoletos] = useState<any[]>([]);
  const [listaDespesas, setListaDespesas] = useState<Despesa[]>([]);

  // Estados para Clientes
  const [termoBuscaCliente, setTermoBuscaCliente] = useState<string>('');
  const [novoCliNome, setNovoCliNome] = useState<string>('');
  const [novoCliTelefone, setNovoCliTelefone] = useState<string>('');
  const [msgCliente, setMsgCliente] = useState<string>('');

  // Estados de Despesas
  const [editandoDespesaId, setEditandoDespesaId] = useState<string | null>(null);
  const [descDespesa, setDescDespesa] = useState<string>('');
  const [catDespesa, setCatDespesa] = useState<string>('luz_energia');
  const [valorDespesa, setValorDespesa] = useState<string>('');
  const [dataDespesa, setDataDespesa] = useState<string>('');
  const [mensagemDespesa, setMensagemDespesa] = useState<string>('');

  // Estados de Peças (Edição)
  const [editandoPecaId, setEditandoPecaId] = useState<string | null>(null);
  const [editPecaNome, setEditPecaNome] = useState<string>('');
  const [editPecaCusto, setEditPecaCusto] = useState<string>('');
  const [editPecaVenda, setEditPecaVenda] = useState<string>('');

  useEffect(() => {
    carregarDadosAdmin();
  }, []);

  const carregarDadosAdmin = async () => {
    setCarregando(true);
    try {
      const { data: osData } = await supabase.from('ordens_servico').select('*').order('criado_em', { ascending: false });
      const { data: pecasData } = await supabase.from('pecas_cadastradas').select('*').order('criado_em', { ascending: false });
      const { data: cliData } = await supabase.from('clientes').select('*').order('nome', { ascending: true });
      const { data: bolData } = await supabase.from('boletos_pecas').select('*').order('data_vencimento', { ascending: true });
      const { data: despData } = await supabase.from('despesas_oficina').select('*').order('data_vencimento', { ascending: true });

      if (osData) setListaOrdens(osData);
      if (pecasData) setListaPecas(pecasData);
      if (cliData) setListaClientes(cliData);
      if (bolData) setListaBoletos(bolData);
      if (despData) setListaDespesas(despData);

      // Extrair todos os meses únicos para o seletor de histórico
      const todosMeses = new Set<string>();
      todosMeses.add(getMesAtualYYYYMM());
      osData?.forEach(item => { if (item.criado_em) todosMeses.add(item.criado_em.slice(0, 7)); });
      despData?.forEach(item => { if (item.data_vencimento) todosMeses.add(item.data_vencimento.slice(0, 7)); });
      bolData?.forEach(item => { if (item.data_vencimento) todosMeses.add(item.data_vencimento.slice(0, 7)); });
      pecasData?.forEach(item => { if (item.criado_em) todosMeses.add(item.criado_em.slice(0, 7)); });

      setMesesDisponiveis(Array.from(todosMeses).sort().reverse());

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setCarregando(false);
    }
  };

  // --- FILTROS POR MÊS SELECIONADO ---
  const ordensDoMes = listaOrdens.filter(os => os.criado_em?.startsWith(mesSelecionado));
  const despesasDoMes = listaDespesas.filter(d => d.data_vencimento?.startsWith(mesSelecionado));
  const boletosDoMes = listaBoletos.filter(b => b.data_vencimento?.startsWith(mesSelecionado));
  const pecasDoMes = listaPecas.filter(p => p.criado_em?.startsWith(mesSelecionado));

  // --- CÁLCULOS DO MÊS ---
  const faturamentoMes = ordensDoMes.reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);
  const gastosDespesasMes = despesasDoMes.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  const gastosBoletosMes = boletosDoMes.reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);
  const lucroLiquidoMes = faturamentoMes - gastosDespesasMes - gastosBoletosMes;

  const custoPecasMes = pecasDoMes.reduce((acc, curr) => acc + (Number(curr.preco_custo) || 0), 0);
  const vendaPecasMes = pecasDoMes.reduce((acc, curr) => acc + (Number(curr.preco_venda) || 0), 0);
  const lucroPecasMes = pecasDoMes.reduce((acc, curr) => acc + (Number(curr.lucro_unitario) || 0), 0);

  // Cartão (Contador)
  const pagamentosCartaoMes = ordensDoMes.filter(os => os.forma_pagamento?.toLowerCase().includes('cartao') || os.forma_pagamento?.toLowerCase().includes('credito') || os.forma_pagamento?.toLowerCase().includes('debito'));
  const totalCartaoMes = pagamentosCartaoMes.reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);

  // Semanal (Aproximação por dia do mês)
  const getSemana = (dia: number) => dia <= 7 ? 1 : dia <= 14 ? 2 : dia <= 21 ? 3 : 4;
  const faturamentoSemanal = [0, 0, 0, 0];
  ordensDoMes.forEach(os => {
    if (os.criado_em) {
      const dia = parseInt(os.criado_em.split('-')[2].slice(0, 2));
      faturamentoSemanal[getSemana(dia) - 1] += Number(os.valor_total) || 0;
    }
  });

  // --- FUNÇÕES CRUD COMPLETAS (ADMIN) ---

  const cadastrarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCliNome.trim()) return;
    try {
      await supabase.from('clientes').insert([{ nome: novoCliNome, telefone: novoCliTelefone }]);
      setMsgCliente('Cliente cadastrado!');
      setNovoCliNome(''); setNovoCliTelefone('');
      carregarDadosAdmin();
    } catch (err: any) { setMsgCliente('Erro: ' + err.message); }
  };

  const excluirCliente = async (id: string) => {
    if (!confirm('Excluir cliente e todo histórico?')) return;
    await supabase.from('clientes').delete().eq('id', id);
    carregarDadosAdmin();
  };

  const excluirOs = async (id: string) => {
    if (!confirm('Excluir Ordem de Serviço permanentemente?')) return;
    await supabase.from('ordens_servico').delete().eq('id', id);
    carregarDadosAdmin();
  };

  const excluirBoleto = async (id: string) => {
    if (!confirm('Excluir boleto de peça?')) return;
    await supabase.from('boletos_pecas').delete().eq('id', id);
    carregarDadosAdmin();
  };

  const excluirPeca = async (id: string) => {
    if (!confirm('Apagar esta peça do registro?')) return;
    await supabase.from('pecas_cadastradas').delete().eq('id', id);
    carregarDadosAdmin();
  };

  const salvarEdicaoPeca = async (id: string) => {
    const custo = parseFloat(editPecaCusto) || 0;
    const venda = parseFloat(editPecaVenda) || 0;
    await supabase.from('pecas_cadastradas').update({
      nome_peca: editPecaNome, preco_custo: custo, preco_venda: venda, lucro_unitario: venda - custo
    }).eq('id', id);
    setEditandoPecaId(null);
    carregarDadosAdmin();
  };

  const salvarDespesa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editandoDespesaId) {
        await supabase.from('despesas_oficina').update({
          descricao: descDespesa.trim(), categoria: catDespesa, valor: parseFloat(valorDespesa) || 0, data_vencimento: dataDespesa
        }).eq('id', editandoDespesaId);
        setEditandoDespesaId(null);
      } else {
        await supabase.from('despesas_oficina').insert([{
          descricao: descDespesa.trim(), categoria: catDespesa, valor: parseFloat(valorDespesa) || 0, data_vencimento: dataDespesa, status: 'pendente'
        }]);
      }
      setDescDespesa(''); setValorDespesa(''); setDataDespesa('');
      carregarDadosAdmin();
    } catch (err: any) { setMensagemDespesa('Erro: ' + err.message); }
  };

  const excluirDespesa = async (id: string) => {
    if (!confirm('Excluir despesa?')) return;
    await supabase.from('despesas_oficina').delete().eq('id', id);
    carregarDadosAdmin();
  };

  const clientesFiltrados = listaClientes.filter(cli => 
    cli.nome.toLowerCase().includes(termoBuscaCliente.toLowerCase()) || 
    (cli.telefone && cli.telefone.includes(termoBuscaCliente))
  );

  const mudarAba = (novaAba: any) => { setAbaAtiva(novaAba); setMenuMobileAberto(false); };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 text-white">
      
      {/* Menu Mobile */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-lg font-black tracking-wider text-white">BOX<span className="text-yellow-500">B1</span></h1>
          <span className="text-[10px] text-yellow-500 uppercase font-semibold">Master (Izaias)</span>
        </div>
        <button onClick={() => setMenuMobileAberto(!menuMobileAberto)} className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-bold border border-gray-700">
          {menuMobileAberto ? '✕ Fechar' : '☰ Menu'}
        </button>
      </div>

      {/* Barra Lateral */}
      <aside className={`w-full md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between shadow-xl ${menuMobileAberto ? 'block' : 'hidden md:flex'}`}>
        <div>
          <div className="p-6 border-b border-gray-800 hidden md:block">
            <h1 className="text-2xl font-black tracking-wider text-white">BOX<span className="text-yellow-500">B1</span></h1>
            <p className="text-xs font-semibold text-yellow-500 uppercase tracking-widest mt-1">Diretoria</p>
          </div>

          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
            <button onClick={() => mudarAba('visao-geral')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${abaAtiva === 'visao-geral' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><span>📊 Visão Geral</span></button>
            <button onClick={() => mudarAba('lucro-total')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${abaAtiva === 'lucro-total' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><span>💰 Lucro & Balanço</span></button>
            <button onClick={() => mudarAba('contador-cartao')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${abaAtiva === 'contador-cartao' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><span>📑 Relatório Contador</span></button>
            <button onClick={() => mudarAba('lucro-pecas')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${abaAtiva === 'lucro-pecas' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><span>📦 Lucro Peças</span></button>
            <button onClick={() => mudarAba('despesas')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${abaAtiva === 'despesas' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><span>💸 Gastos & Despesas</span></button>
            <button onClick={() => mudarAba('clientes')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${abaAtiva === 'clientes' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><span>👥 Gestão Clientes</span></button>
            <button onClick={() => mudarAba('boletos')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${abaAtiva === 'boletos' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><span>🧾 Boletos</span></button>
            <button onClick={() => mudarAba('orcamento-zap')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${abaAtiva === 'orcamento-zap' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><span>📱 Orçamento WhatsApp</span></button>
            <button onClick={() => mudarAba('comanda')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${abaAtiva === 'comanda' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><span>📋 Emitir O.S. Admin</span></button>
          </nav>
        </div>
      </aside>

      {/* Conteúdo Central */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between">
          
          {/* SELETOR DE MÊS GLOBAL */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase text-gray-400 hidden sm:inline">Mês Referência:</span>
            <select 
              value={mesSelecionado} 
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="bg-gray-950 border border-gray-700 text-yellow-500 font-bold text-sm px-3 py-1.5 rounded-lg shadow-inner cursor-pointer"
            >
              {mesesDisponiveis.map(m => (
                <option key={m} value={m}>{formatarMesAno(m)} {m === getMesAtualYYYYMM() ? '(Atual)' : ''}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={carregarDadosAdmin} className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg">🔄 Atualizar</button>
          </div>
        </header>

        <div className="p-4 md:p-8 overflow-y-auto space-y-6">
          
          {/* MENSAGEM DE PASTA MENSAL */}
          {mesSelecionado !== getMesAtualYYYYMM() && (
            <div className="bg-blue-900/30 border border-blue-800/50 p-4 rounded-xl flex items-center justify-between text-blue-300">
              <span className="text-xs font-bold">📂 Visualizando Arquivo Histórico: <strong>{formatarMesAno(mesSelecionado)}</strong></span>
              <button onClick={() => setMesSelecionado(getMesAtualYYYYMM())} className="text-xs bg-blue-800/50 hover:bg-blue-700 px-3 py-1 rounded font-bold text-white">Voltar ao Mês Atual</button>
            </div>
          )}

          {carregando ? (
            <div className="text-xs text-gray-400 py-10 text-center">Sincronizando banco de dados...</div>
          ) : (
            <>
              {/* VISÃO GERAL */}
              {abaAtiva === 'visao-geral' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-white">Resumo de {formatarMesAno(mesSelecionado)}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
                      <span className="text-[11px] uppercase font-bold text-gray-400">Entradas (O.S.)</span>
                      <h2 className="text-2xl font-black text-green-400 mt-2">R$ {faturamentoMes.toFixed(2)}</h2>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
                      <span className="text-[11px] uppercase font-bold text-gray-400">Saídas (Despesas)</span>
                      <h2 className="text-2xl font-black text-red-400 mt-2">R$ {gastosDespesasMes.toFixed(2)}</h2>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
                      <span className="text-[11px] uppercase font-bold text-gray-400">Saídas (Peças/Boletos)</span>
                      <h2 className="text-2xl font-black text-yellow-400 mt-2">R$ {gastosBoletosMes.toFixed(2)}</h2>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
                      <span className="text-[11px] uppercase font-bold text-gray-400">Líquido do Mês</span>
                      <h2 className={`text-2xl font-black mt-2 ${lucroLiquidoMes >= 0 ? 'text-blue-400' : 'text-red-500'}`}>R$ {lucroLiquidoMes.toFixed(2)}</h2>
                    </div>
                  </div>
                </div>
              )}

              {/* LUCRO LÍQUIDO E BALANÇO (SEMANAL E MENSAL) */}
              {abaAtiva === 'lucro-total' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <h3 className="text-xl font-black text-white">Balanço Financeiro - {formatarMesAno(mesSelecionado)}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4 text-xs">
                      <h4 className="font-bold text-yellow-500 uppercase border-b border-gray-800 pb-2">Fechamento Mensal Consolidado</h4>
                      <div className="flex justify-between py-1"><span className="text-gray-400">(+) Faturamento Serviços:</span><strong className="text-green-400">R$ {faturamentoMes.toFixed(2)}</strong></div>
                      <div className="flex justify-between py-1"><span className="text-gray-400">(+) Lucro Sobre Peças (Bruto):</span><strong className="text-blue-400">R$ {lucroPecasMes.toFixed(2)}</strong></div>
                      <div className="flex justify-between py-1"><span className="text-gray-400">(-) Despesas Operacionais:</span><strong className="text-red-400">R$ {gastosDespesasMes.toFixed(2)}</strong></div>
                      <div className="flex justify-between py-1"><span className="text-gray-400">(-) Boletos de Fornecedores:</span><strong className="text-red-400">R$ {gastosBoletosMes.toFixed(2)}</strong></div>
                      <div className="flex justify-between py-3 mt-2 border-t border-gray-800 text-sm font-bold">
                        <span className="text-white">= Saldo Líquido do Mês:</span>
                        <span className={lucroLiquidoMes >= 0 ? 'text-green-400' : 'text-red-400'}>R$ {lucroLiquidoMes.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4 text-xs">
                      <h4 className="font-bold text-blue-500 uppercase border-b border-gray-800 pb-2">Faturamento Semanal (Serviços)</h4>
                      <div className="flex justify-between py-1"><span className="text-gray-400">Semana 1 (Dias 01-07):</span><strong className="text-white">R$ {faturamentoSemanal[0].toFixed(2)}</strong></div>
                      <div className="flex justify-between py-1"><span className="text-gray-400">Semana 2 (Dias 08-14):</span><strong className="text-white">R$ {faturamentoSemanal[1].toFixed(2)}</strong></div>
                      <div className="flex justify-between py-1"><span className="text-gray-400">Semana 3 (Dias 15-21):</span><strong className="text-white">R$ {faturamentoSemanal[2].toFixed(2)}</strong></div>
                      <div className="flex justify-between py-1"><span className="text-gray-400">Semana 4 (Dias 22-Fim):</span><strong className="text-white">R$ {faturamentoSemanal[3].toFixed(2)}</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* RELATÓRIO CONTADOR (CARTÃO) MENSAL */}
              {abaAtiva === 'contador-cartao' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div className="flex justify-between items-end border-b border-gray-800 pb-4">
                    <div>
                      <h3 className="text-xl font-black text-white">Relatório Fiscal / Contador</h3>
                      <p className="text-xs text-gray-400 mt-1">Transações detalhadas em Cartão no mês de {formatarMesAno(mesSelecionado)}.</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-gray-500 block">Volume Total Cartão (Mês)</span>
                      <strong className="text-green-400 text-2xl">R$ {totalCartaoMes.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {pagamentosCartaoMes.map((os) => (
                      <div key={os.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between md:items-center text-xs gap-3">
                        <div className="flex-1">
                          <strong className="text-yellow-400 text-sm">{os.os_codigo}</strong> - {os.problema_relatado}
                          <div className="text-[10px] text-gray-400 mt-1 space-x-3">
                            <span>📅 Emissão: {new Date(os.criado_em).toLocaleDateString()}</span>
                            <span className="uppercase text-blue-300">💳 Forma: {os.forma_pagamento}</span>
                            {/* Detalhe de parcelamento estimado se contiver 'x' na forma de pagamento */}
                            {os.forma_pagamento.includes('x') && <span className="text-red-300">⚠️ Venda Parcelada</span>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 border-t md:border-t-0 md:border-l border-gray-800 pt-2 md:pt-0 md:pl-4">
                          <div className="text-right">
                            <span className="text-[10px] text-gray-500 block">Valor Bruto</span>
                            <strong className="text-green-400 text-base">R$ {Number(os.valor_total).toFixed(2)}</strong>
                          </div>
                          <button onClick={() => excluirOs(os.id)} className="bg-red-600/20 text-red-400 px-3 py-2 rounded font-bold hover:bg-red-600/40 transition-colors">🗑️ O.S.</button>
                        </div>
                      </div>
                    ))}
                    {pagamentosCartaoMes.length === 0 && <p className="text-xs text-gray-500 text-center py-6">Sem registros de cartão neste mês.</p>}
                  </div>
                </div>
              )}

              {/* LUCRO E PEÇAS MENSAL COM CRUD */}
              {abaAtiva === 'lucro-pecas' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">Gestão e Lucro de Peças ({formatarMesAno(mesSelecionado)})</h3>
                    <p className="text-xs text-gray-400 mt-1">O histórico zera na virada do mês, mas os registros antigos ficam salvos nas pastas dos meses anteriores.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-b border-gray-800 pb-6">
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800"><span className="text-xs text-gray-400 block">Custo Mês:</span><strong className="text-red-400 text-lg">R$ {custoPecasMes.toFixed(2)}</strong></div>
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800"><span className="text-xs text-gray-400 block">Venda Mês:</span><strong className="text-green-400 text-lg">R$ {vendaPecasMes.toFixed(2)}</strong></div>
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800"><span className="text-xs text-gray-400 block">Lucro Mês:</span><strong className="text-yellow-400 text-lg">R$ {lucroPecasMes.toFixed(2)}</strong></div>
                  </div>

                  <div className="space-y-3">
                    {pecasDoMes.map((p) => (
                      <div key={p.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs">
                        {editandoPecaId === p.id ? (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                            <div><label className="text-[10px] text-gray-400">Nome</label><input type="text" value={editPecaNome} onChange={e => setEditPecaNome(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white" /></div>
                            <div><label className="text-[10px] text-gray-400">Custo</label><input type="number" step="0.01" value={editPecaCusto} onChange={e => setEditPecaCusto(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white" /></div>
                            <div><label className="text-[10px] text-gray-400">Venda</label><input type="number" step="0.01" value={editPecaVenda} onChange={e => setEditPecaVenda(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white" /></div>
                            <div className="flex space-x-2">
                              <button onClick={() => salvarEdicaoPeca(p.id)} className="bg-green-600 text-white px-3 py-2 rounded font-bold">Salvar</button>
                              <button onClick={() => setEditandoPecaId(null)} className="bg-gray-700 text-white px-3 py-2 rounded font-bold">X</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                            <div>
                              <strong className="text-yellow-400 text-sm">{p.nome_peca}</strong>
                              <span className="text-[10px] text-gray-500 block mt-1">Cadastrado em: {new Date(p.criado_em).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="flex space-x-4 text-center">
                                <div><span className="block text-[10px] text-gray-500">Custo</span><span className="text-red-400 font-bold">R$ {Number(p.preco_custo).toFixed(2)}</span></div>
                                <div><span className="block text-[10px] text-gray-500">Venda</span><span className="text-green-400 font-bold">R$ {Number(p.preco_venda).toFixed(2)}</span></div>
                                <div><span className="block text-[10px] text-gray-500">Lucro Obtido</span><span className="text-blue-400 font-black">R$ {Number(p.lucro_unitario).toFixed(2)}</span></div>
                              </div>
                              <div className="flex flex-col space-y-1 border-l border-gray-800 pl-4">
                                <button onClick={() => { setEditandoPecaId(p.id); setEditPecaNome(p.nome_peca); setEditPecaCusto(p.preco_custo); setEditPecaVenda(p.preco_venda); }} className="text-blue-400 text-[10px] hover:underline font-bold text-left">Editar</button>
                                <button onClick={() => excluirPeca(p.id)} className="text-red-400 text-[10px] hover:underline font-bold text-left">Excluir</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {pecasDoMes.length === 0 && <p className="text-xs text-gray-500 text-center py-6">Nenhuma peça registrada no mês de {formatarMesAno(mesSelecionado)}.</p>}
                  </div>
                </div>
              )}

              {/* CLIENTES COM CRUD ADMIN */}
              {abaAtiva === 'clientes' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <h3 className="text-xl font-black text-white">Gestão Total de Clientes</h3>
                  
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <h4 className="text-xs font-bold text-yellow-500 mb-3 uppercase">Cadastrar Novo Cliente (Acesso Admin)</h4>
                    <form onSubmit={cadastrarCliente} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input type="text" value={novoCliNome} onChange={e => setNovoCliNome(e.target.value)} placeholder="Nome do Cliente" className="bg-gray-900 border border-gray-700 px-3 py-2 rounded text-xs text-white" required/>
                      <input type="text" value={novoCliTelefone} onChange={e => setNovoCliTelefone(e.target.value)} placeholder="Telefone / WhatsApp" className="bg-gray-900 border border-gray-700 px-3 py-2 rounded text-xs text-white" required/>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs px-4">Salvar Cliente</button>
                    </form>
                    {msgCliente && <p className="text-xs text-green-400 mt-2">{msgCliente}</p>}
                  </div>

                  <input type="text" value={termoBuscaCliente} onChange={(e) => setTermoBuscaCliente(e.target.value)} placeholder="🔍 Pesquisar por nome ou telefone na base inteira..." className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white shadow-inner" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clientesFiltrados.map((cli) => (
                      <div key={cli.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs flex justify-between items-center">
                        <div><h4 className="font-bold text-white text-sm">{cli.nome}</h4><p className="text-gray-400">Tel: {cli.telefone}</p></div>
                        <button onClick={() => excluirCliente(cli.id)} className="bg-red-600/20 text-red-400 px-3 py-1.5 rounded font-bold hover:bg-red-600/40">🗑️ Excluir</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BOLETOS (FILTRADO POR MÊS E EXCLUSÃO) */}
              {abaAtiva === 'boletos' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-xl font-black text-white">Boletos Cadastrados - {formatarMesAno(mesSelecionado)}</h3>
                  <div className="space-y-2">
                    {boletosDoMes.map((b) => (
                      <div key={b.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
                        <div><strong className="text-yellow-400">{b.fornecedor}</strong><span className="text-gray-400 block mt-1">Vencimento: {b.data_vencimento}</span></div>
                        <div className="flex items-center space-x-4">
                          <strong className="text-red-400 text-sm">R$ {Number(b.valor_total).toFixed(2)}</strong>
                          <button onClick={() => excluirBoleto(b.id)} className="bg-red-600/20 text-red-400 px-2 py-1 rounded font-bold hover:bg-red-600/40">Excluir</button>
                        </div>
                      </div>
                    ))}
                    {boletosDoMes.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Nenhum boleto registrado neste mês.</p>}
                  </div>
                </div>
              )}

              {/* OUTRAS ABAS INALTERADAS (Despesas, Comanda, WhatsApp) */}
              {abaAtiva === 'despesas' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <h3 className="text-xl font-black text-white">Despesas do Mês - {formatarMesAno(mesSelecionado)}</h3>
                  <form onSubmit={salvarDespesa} className="space-y-4 bg-gray-950 p-6 rounded-xl border border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" value={descDespesa} onChange={(e) => setDescDespesa(e.target.value)} placeholder="Descrição" className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-white" required />
                      <input type="number" step="0.01" value={valorDespesa} onChange={(e) => setValorDespesa(e.target.value)} placeholder="Valor" className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-white" required />
                      <input type="date" value={dataDespesa} onChange={(e) => setDataDespesa(e.target.value)} className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-white" required />
                    </div>
                    <button type="submit" className="w-full bg-yellow-600 text-white font-bold text-xs py-3 rounded">Salvar Despesa</button>
                  </form>
                  <div className="space-y-2 pt-4">
                    {despesasDoMes.map((d) => (
                      <div key={d.id} className="bg-gray-950 p-3 rounded-xl border border-gray-800 flex justify-between text-xs">
                        <span><strong className="text-white">{d.descricao}</strong> - Venc: {d.data_vencimento}</span>
                        <div className="space-x-3"><span className="text-red-400 font-bold">R$ {Number(d.valor).toFixed(2)}</span><button onClick={() => excluirDespesa(d.id)} className="text-red-400 px-2 py-1 bg-red-900/30 rounded">Excluir</button></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {abaAtiva === 'orcamento-zap' && <GeradorOrcamentoWhatsApp />}
              {abaAtiva === 'comanda' && <ComandaDigitalOS />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}