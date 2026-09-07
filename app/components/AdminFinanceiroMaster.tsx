'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ComandaDigitalOS from './ComandaDigitalOS';
import GeradorOrcamentoWhatsApp from './GeradorOrcamentoWhatsApp';
import PainelGestaoClientes from './PainelGestaoClientes';

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

const getMesAtualYYYYMM = () => new Date().toISOString().slice(0, 7);
const formatarMesAno = (yyyyMm: string) => {
  if (!yyyyMm) return '';
  const [ano, mes] = yyyyMm.split('-');
  const nomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return `${nomes[parseInt(mes) - 1]} / ${ano}`;
};

export default function AdminFinanceiroMaster({ emailUsuario, onLogout }: AdminFinanceiroMasterProps) {
  const [abaAtiva, setAbaAtiva] = useState<
    'visao-geral' | 'orcamento-zap' | 'contador-cartao' | 'lucro-pecas' | 'lucro-total' | 'comanda' | 'despesas' | 'pecas' | 'clientes' | 'boletos'
  >('visao-geral');
  
  const [carregando, setCarregando] = useState<boolean>(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState<boolean>(false);

  const [mesSelecionado, setMesSelecionado] = useState<string>(getMesAtualYYYYMM());
  const [mesesDisponiveis, setMesesDisponiveis] = useState<string[]>([]);

  const [listaOrdens, setListaOrdens] = useState<any[]>([]);
  const [listaPecas, setListaPecas] = useState<any[]>([]);
  const [listaClientes, setListaClientes] = useState<any[]>([]);
  const [listaBoletos, setListaBoletos] = useState<any[]>([]);
  const [listaDespesas, setListaDespesas] = useState<any[]>([]);

  const [termoBuscaCliente, setTermoBuscaCliente] = useState<string>('');
  const [novoCliNome, setNovoCliNome] = useState<string>('');
  const [novoCliTelefone, setNovoCliTelefone] = useState<string>('');
  const [msgCliente, setMsgCliente] = useState<string>('');

  const [editandoDespesaId, setEditandoDespesaId] = useState<string | null>(null);
  const [descDespesa, setDescDespesa] = useState<string>('');
  const [catDespesa, setCatDespesa] = useState<string>('luz_energia');
  const [valorDespesa, setValorDespesa] = useState<string>('');
  const [dataDespesa, setDataDespesa] = useState<string>('');
  const [mensagemDespesa, setMensagemDespesa] = useState<string>('');

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

      const todosMeses = new Set<string>();
      todosMeses.add(getMesAtualYYYYMM());
      osData?.forEach(item => { if (item.criado_em) todosMeses.add(String(item.criado_em).slice(0, 7)); });
      pecasData?.forEach(item => { if (item.criado_em) todosMeses.add(String(item.criado_em).slice(0, 7)); });
      bolData?.forEach(item => { if (item.data_vencimento) todosMeses.add(String(item.data_vencimento).slice(0, 7)); });
      despData?.forEach(item => { if (item.data_vencimento) todosMeses.add(String(item.data_vencimento).slice(0, 7)); });

      setMesesDisponiveis(Array.from(todosMeses).sort().reverse());
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setCarregando(false);
    }
  };

  const ordensDoMes = listaOrdens.filter(os => {
    if (!os.criado_em) return false;
    return String(os.criado_em).startsWith(mesSelecionado);
  });

  const pecasDoMes = listaPecas.filter(p => {
    if (!p.criado_em) return false;
    return String(p.criado_em).startsWith(mesSelecionado);
  });

  const boletosDoMes = listaBoletos.filter(b => {
    if (!b.data_vencimento) return false;
    return String(b.data_vencimento).startsWith(mesSelecionado);
  });

  const despesasDoMes = listaDespesas.filter(d => {
    if (!d.data_vencimento) return false;
    return String(d.data_vencimento).startsWith(mesSelecionado);
  });

  // Separação oficial: Apenas O.S. pagas entram no Faturamento Real do Caixa
  const ordensPagasMes = ordensDoMes.filter(os => (os.status_pagamento || '').toLowerCase() === 'pago');
  const ordensPendentesMes = ordensDoMes.filter(os => (os.status_pagamento || '').toLowerCase() !== 'pago');

  const faturamentoTotalMes = ordensPagasMes.reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);
  const totalPendenteMes = ordensPendentesMes.reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);
  
  const totalDespesasMes = despesasDoMes.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  const totalBoletosPecasMes = boletosDoMes.reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);

  const totaisPorMetodo: { [key: string]: number } = {};
  ordensPagasMes.forEach(os => {
    const metodoBruto = (os.forma_pagamento || 'outros').toLowerCase();
    let chaveMetodo = 'Outros';
    if (metodoBruto.includes('pix')) chaveMetodo = 'PIX';
    else if (metodoBruto.includes('cartao') || metodoBruto.includes('credito') || metodoBruto.includes('debito')) chaveMetodo = 'Cartão';
    else if (metodoBruto.includes('dinheiro')) chaveMetodo = 'Dinheiro';
    else if (metodoBruto.includes('boleto')) chaveMetodo = 'Boleto';
    else chaveMetodo = os.forma_pagamento.toUpperCase();

    const valor = Number(os.valor_total) || 0;
    totaisPorMetodo[chaveMetodo] = (totaisPorMetodo[chaveMetodo] || 0) + valor;
  });

  const pagamentosCartaoMes = ordensPagasMes.filter(os => 
    os.forma_pagamento && (os.forma_pagamento.toLowerCase().includes('cartao') || os.forma_pagamento.toLowerCase().includes('credito') || os.forma_pagamento.toLowerCase().includes('debito'))
  );
  const totalCartaoMes = pagamentosCartaoMes.reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);

  const custoTotalPecasMes = pecasDoMes.reduce((acc, curr) => acc + (Number(curr.preco_custo) || 0), 0);
  const vendaTotalPecasMes = pecasDoMes.reduce((acc, curr) => acc + (Number(curr.preco_venda) || 0), 0);
  const lucroTotalPecasMes = pecasDoMes.reduce((acc, curr) => acc + (Number(curr.lucro_unitario) || 0), 0);

  const lucroLiquidoGeralMes = faturamentoTotalMes + lucroTotalPecasMes - totalDespesasMes - totalBoletosPecasMes;

  const balancoSemanal = [0, 0, 0, 0];
  ordensPagasMes.forEach(os => {
    if (os.criado_em) {
      const diaStr = String(os.criado_em).split('T')[0].split('-')[2];
      const dia = parseInt(diaStr) || 1;
      if (dia <= 7) balancoSemanal[0] += Number(os.valor_total);
      else if (dia <= 14) balancoSemanal[1] += Number(os.valor_total);
      else if (dia <= 21) balancoSemanal[2] += Number(os.valor_total);
      else balancoSemanal[3] += Number(os.valor_total);
    }
  });

  const excluirOs = async (id: string) => {
    if (!confirm('Excluir esta Ordem de Serviço permanentemente?')) return;
    await supabase.from('ordens_servico').delete().eq('id', id);
    carregarDadosAdmin();
  };

  const excluirBoleto = async (id: string) => {
    if (!confirm('Excluir este boleto de peças?')) return;
    await supabase.from('boletos_pecas').delete().eq('id', id);
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

  const excluirPeca = async (id: string) => {
    if (!confirm('Excluir esta peça do sistema?')) return;
    await supabase.from('pecas_cadastradas').delete().eq('id', id);
    carregarDadosAdmin();
  };

  const salvarDespesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemDespesa('');
    try {
      if (editandoDespesaId) {
        const { error } = await supabase.from('despesas_oficina').update({
          descricao: descDespesa.trim(), categoria: catDespesa, valor: parseFloat(valorDespesa) || 0, data_vencimento: dataDespesa
        }).eq('id', editandoDespesaId);
        if (error) throw error;
        setMensagemDespesa('Despesa atualizada!');
        setEditandoDespesaId(null);
      } else {
        const { error } = await supabase.from('despesas_oficina').insert([{
          descricao: descDespesa.trim(), categoria: catDespesa, valor: parseFloat(valorDespesa) || 0, data_vencimento: dataDespesa, status: 'pendente'
        }]);
        if (error) throw error;
        setMensagemDespesa('Despesa cadastrada!');
      }
      setDescDespesa(''); setValorDespesa(''); setDataDespesa('');
      carregarDadosAdmin();
    } catch (err: any) { setMensagemDespesa('Erro: ' + err.message); }
  };

  const iniciarEdicaoDespesa = (d: Despesa) => {
    setEditandoDespesaId(d.id); setDescDespesa(d.descricao); setCatDespesa(d.categoria); setValorDespesa(d.valor.toString()); setDataDespesa(d.data_vencimento);
  };

  const excluirDespesa = async (id: string) => {
    if (!confirm('Deseja excluir permanentemente esta despesa?')) return;
    try {
      await supabase.from('despesas_oficina').delete().eq('id', id);
      carregarDadosAdmin();
    } catch (err: any) { alert('Erro: ' + err.message); }
  };

  const mudarAba = (novaAba: any) => {
    setAbaAtiva(novaAba);
    setMenuMobileAberto(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 text-white">
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

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Controle BOXB1</span>
            <div className="flex items-center space-x-2 bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-700">
              <span className="text-xs text-gray-400 font-bold">MÊS/ARQUIVO:</span>
              <select 
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(e.target.value)}
                className="bg-transparent text-yellow-500 font-bold text-xs outline-none cursor-pointer"
              >
                {mesesDisponiveis.map(m => (
                  <option key={m} value={m} className="bg-gray-900 text-white">{formatarMesAno(m)} {m === getMesAtualYYYYMM() ? '(Atual)' : ''}</option>
                ))}
              </select>
            </div>
          </div>

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
              {mesSelecionado !== getMesAtualYYYYMM() && (
                <div className="bg-blue-900/30 border border-blue-800 p-4 rounded-xl flex items-center justify-between text-blue-300 shadow-md">
                  <span className="text-xs font-bold">📂 Visualizando registro arquivado de <strong>{formatarMesAno(mesSelecionado)}</strong></span>
                  <button onClick={() => setMesSelecionado(getMesAtualYYYYMM())} className="text-xs bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded font-bold text-white cursor-pointer transition-colors">Voltar ao Mês Atual</button>
                </div>
              )}

              {abaAtiva === 'visao-geral' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
                      <span className="text-[11px] uppercase font-bold text-gray-400">Faturamento Bruto (Pago)</span>
                      <h2 className="text-2xl font-black text-green-400 mt-2">R$ {faturamentoTotalMes.toFixed(2)}</h2>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
                      <span className="text-[11px] uppercase font-bold text-gray-400">Total a Receber (Pendente)</span>
                      <h2 className="text-2xl font-black text-yellow-400 mt-2">R$ {totalPendenteMes.toFixed(2)}</h2>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
                      <span className="text-[11px] uppercase font-bold text-gray-400">Total Despesas / Gastos</span>
                      <h2 className="text-2xl font-black text-red-400 mt-2">R$ {totalDespesasMes.toFixed(2)}</h2>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
                      <span className="text-[11px] uppercase font-bold text-gray-400">Boletos de Peças</span>
                      <h2 className="text-2xl font-black text-yellow-400 mt-2">R$ {totalBoletosPecasMes.toFixed(2)}</h2>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
                      <span className="text-[11px] uppercase font-bold text-gray-400">Lucro Líquido Estimado</span>
                      <h2 className={`text-2xl font-black mt-2 ${lucroLiquidoGeralMes >= 0 ? 'text-blue-400' : 'text-red-400'}`}>R$ {lucroLiquidoGeralMes.toFixed(2)}</h2>
                    </div>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-500">Valores Recebidos por Método de Pagamento ({formatarMesAno(mesSelecionado)})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.keys(totaisPorMetodo).length > 0 ? (
                        Object.entries(totaisPorMetodo).map(([metodo, valor]) => (
                          <div key={metodo} className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                            <span className="text-[11px] uppercase font-bold text-gray-400 block">{metodo}</span>
                            <strong className="text-green-400 text-lg block mt-1">R$ {valor.toFixed(2)}</strong>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 col-span-4 py-2">Nenhum pagamento quitado registrado neste mês.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {abaAtiva === 'orcamento-zap' && <GeradorOrcamentoWhatsApp />}

              {abaAtiva === 'contador-cartao' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white">Relatório de Pagamentos em Cartão (Quitados) - {formatarMesAno(mesSelecionado)}</h3>
                    <p className="text-xs text-gray-400 mt-1">Listagem detalhada de recebimentos em cartão para envio ao contador.</p>
                  </div>

                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-xs text-gray-400">Total Acumulado em Cartões no Mês:</span>
                      <strong className="text-green-400 text-base md:text-lg block">R$ {totalCartaoMes.toFixed(2)}</strong>
                    </div>
                    <span className="text-xs text-yellow-500 font-semibold">{pagamentosCartaoMes.length} transação(ões) quitadas</span>
                  </div>

                  <div className="space-y-2">
                    {pagamentosCartaoMes.map((os) => (
                      <div key={os.id} className="bg-gray-950 p-3 rounded-lg border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                        <div>
                          <strong className="text-yellow-400">{os.os_codigo}</strong> - <span className="text-gray-300">{os.problema_relatado}</span>
                          <span className="text-[10px] text-gray-500 block mt-1">
                            Data: {new Date(os.criado_em).toLocaleDateString()} | Modalidade: <span className="text-blue-300 uppercase">{os.forma_pagamento}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-bold text-green-400 text-sm">R$ {Number(os.valor_total).toFixed(2)}</span>
                          <button onClick={() => excluirOs(os.id)} className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-2 py-1 rounded text-[10px] font-bold cursor-pointer">🗑️ Excluir O.S.</button>
                        </div>
                      </div>
                    ))}
                    {pagamentosCartaoMes.length === 0 && <p className="text-xs text-gray-500 text-center py-6">Nenhum pagamento em cartão quitado registrado nesta pasta mensal.</p>}
                  </div>
                </div>
              )}

              {abaAtiva === 'lucro-pecas' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white">Balanço de Peças Registradas - {formatarMesAno(mesSelecionado)}</h3>
                    <p className="text-xs text-gray-400 mt-1">Acompanhamento de finanças mensal.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <span className="text-xs text-gray-400 block">Custo Total de Peças (Mês):</span>
                      <strong className="text-red-400 text-base md:text-lg">R$ {custoTotalPecasMes.toFixed(2)}</strong>
                    </div>
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <span className="text-xs text-gray-400 block">Preço de Venda Total (Mês):</span>
                      <strong className="text-green-400 text-base md:text-lg">R$ {vendaTotalPecasMes.toFixed(2)}</strong>
                    </div>
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <span className="text-xs text-gray-400 block">Lucro Bruto de Peças (Mês):</span>
                      <strong className="text-yellow-400 text-base md:text-lg">R$ {lucroTotalPecasMes.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-800">
                    <h4 className="text-xs font-bold text-yellow-500 uppercase">Detalhamento Individual das Peças</h4>
                    {pecasDoMes.map((p) => (
                      <div key={p.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs">
                        {editandoPecaId === p.id ? (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                            <div><label className="text-[10px] text-gray-400 block">Nome Peça</label><input type="text" value={editPecaNome} onChange={(e) => setEditPecaNome(e.target.value)} className="w-full bg-gray-900 border border-gray-700 px-2 py-1.5 rounded text-white" /></div>
                            <div><label className="text-[10px] text-gray-400 block">Custo (R$)</label><input type="number" step="0.01" value={editPecaCusto} onChange={(e) => setEditPecaCusto(e.target.value)} className="w-full bg-gray-900 border border-gray-700 px-2 py-1.5 rounded text-white" /></div>
                            <div><label className="text-[10px] text-gray-400 block">Venda (R$)</label><input type="number" step="0.01" value={editPecaVenda} onChange={(e) => setEditPecaVenda(e.target.value)} className="w-full bg-gray-900 border border-gray-700 px-2 py-1.5 rounded text-white" /></div>
                            <div className="flex space-x-2">
                              <button onClick={() => salvarEdicaoPeca(p.id)} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded font-bold w-full cursor-pointer">Salvar</button>
                              <button onClick={() => setEditandoPecaId(null)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded font-bold w-full cursor-pointer">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <strong className="text-yellow-400 text-sm">{p.nome_peca}</strong>
                              <span className="text-[10px] text-gray-500 block mt-1">Data Registro: {new Date(p.criado_em).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                              <div className="text-center"><span className="block text-[10px] text-gray-500">Custo</span><span className="text-red-400 font-bold">R$ {Number(p.preco_custo).toFixed(2)}</span></div>
                              <div className="text-center"><span className="block text-[10px] text-gray-500">Venda</span><span className="text-green-400 font-bold">R$ {Number(p.preco_venda).toFixed(2)}</span></div>
                              <div className="text-center border-l border-gray-800 pl-4"><span className="block text-[10px] text-gray-500">Lucro</span><span className="text-blue-400 font-black">R$ {Number(p.lucro_unitario).toFixed(2)}</span></div>
                              <div className="flex flex-col space-y-1 ml-4 border-l border-gray-800 pl-4">
                                <button onClick={() => { setEditandoPecaId(p.id); setEditPecaNome(p.nome_peca); setEditPecaCusto(p.preco_custo); setEditPecaVenda(p.preco_venda); }} className="text-blue-400 text-[10px] hover:underline font-bold text-left cursor-pointer">Editar</button>
                                <button onClick={() => excluirPeca(p.id)} className="text-red-400 text-[10px] hover:underline font-bold text-left cursor-pointer">Excluir</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {pecasDoMes.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Nenhuma peça registrada no mês de {formatarMesAno(mesSelecionado)}.</p>}
                  </div>
                </div>
              )}

              {abaAtiva === 'lucro-total' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white">Balanço do Mês - {formatarMesAno(mesSelecionado)}</h3>
                    <p className="text-xs text-gray-400 mt-1">Cálculos integrados baseados estritamente em serviços efetivamente pagos.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4 text-xs">
                      <h4 className="font-bold text-yellow-500 uppercase border-b border-gray-800 pb-2">Extrato Mensal Consolidado</h4>
                      <div className="flex justify-between py-1 border-b border-gray-800/50">
                        <span className="text-gray-400">(+) Faturamento Serviços Pagos:</span><strong className="text-green-400 text-sm">R$ {faturamentoTotalMes.toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-800/50">
                        <span className="text-gray-400">(+) Lucro Sobre Peças Lançadas:</span><strong className="text-blue-400 text-sm">R$ {lucroTotalPecasMes.toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-800/50">
                        <span className="text-gray-400">(-) Despesas Gerais e Custos:</span><strong className="text-red-400 text-sm">R$ {totalDespesasMes.toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-800/50">
                        <span className="text-gray-400">(-) Boletos e Fornecedores:</span><strong className="text-red-400 text-sm">R$ {totalBoletosPecasMes.toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between py-3 text-sm font-bold bg-gray-900 px-3 rounded-lg mt-2">
                        <span className="text-white">= Lucro Líquido Final:</span>
                        <span className={`text-base ${lucroLiquidoGeralMes >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {lucroLiquidoGeralMes.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4 text-xs">
                      <h4 className="font-bold text-blue-400 uppercase border-b border-gray-800 pb-2">Faturamento Semanal (Serviços Pagos)</h4>
                      <div className="flex justify-between py-1.5"><span className="text-gray-400">Semana 1 (Dias 01-07):</span><strong className="text-white">R$ {balancoSemanal[0].toFixed(2)}</strong></div>
                      <div className="flex justify-between py-1.5"><span className="text-gray-400">Semana 2 (Dias 08-14):</span><strong className="text-white">R$ {balancoSemanal[1].toFixed(2)}</strong></div>
                      <div className="flex justify-between py-1.5"><span className="text-gray-400">Semana 3 (Dias 15-21):</span><strong className="text-white">R$ {balancoSemanal[2].toFixed(2)}</strong></div>
                      <div className="flex justify-between py-1.5"><span className="text-gray-400">Semana 4 (Dias 22 até o fim):</span><strong className="text-white">R$ {balancoSemanal[3].toFixed(2)}</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {abaAtiva === 'comanda' && <ComandaDigitalOS />}

              {abaAtiva === 'despesas' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white">Gerenciamento de Despesas - {formatarMesAno(mesSelecionado)}</h3>
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
                        <button type="button" onClick={() => { setEditandoDespesaId(null); setDescDespesa(''); setValorDespesa(''); setDataDespesa(''); }} className="bg-gray-800 text-gray-300 px-4 py-3 rounded-lg text-xs font-bold cursor-pointer">
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="space-y-2 pt-4 border-t border-gray-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500">Despesas Registradas</h4>
                    {despesasDoMes.map((d) => (
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
                    {despesasDoMes.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Nenhuma despesa cadastrada nesta pasta.</p>}
                  </div>
                </div>
              )}

              {abaAtiva === 'pecas' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl text-center">
                  <h3 className="text-lg font-black text-white">Visualização de Peças</h3>
                  <p className="text-xs text-gray-400 mt-2">A lista e controle de peças foi integrada ao painel "📦 Lucro & Custos de Peças".</p>
                  <button onClick={() => setAbaAtiva('lucro-pecas')} className="mt-4 bg-yellow-600 px-4 py-2 rounded font-bold text-xs text-white">Ir para Controle de Peças</button>
                </div>
              )}

              {abaAtiva === 'clientes' && <PainelGestaoClientes />}

              {abaAtiva === 'boletos' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-4">
                  <h3 className="text-lg md:text-xl font-black text-white">Controle de Boletos de Peças - {formatarMesAno(mesSelecionado)}</h3>
                  <div className="space-y-2">
                    {boletosDoMes.map((b) => (
                      <div key={b.id} className="bg-gray-950 p-3 rounded-xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                        <div>
                          <strong className="text-yellow-400">{b.fornecedor}</strong> - Boleto: {b.numero_boleto}
                          <span className="text-gray-400 block">Vencimento: {b.data_vencimento}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-bold text-red-400">R$ {Number(b.valor_total).toFixed(2)}</span>
                          <button onClick={() => excluirBoleto(b.id)} className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-2 py-1.5 rounded text-[10px] font-bold cursor-pointer">🗑️ Excluir</button>
                        </div>
                      </div>
                    ))}
                    {boletosDoMes.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Nenhum boleto registrado na pasta selecionada.</p>}
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