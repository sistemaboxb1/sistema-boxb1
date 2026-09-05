'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AdminFinanceiroMasterProps {
  emailUsuario: string;
  onLogout: () => void;
}

export default function AdminFinanceiroMaster({ emailUsuario, onLogout }: AdminFinanceiroMasterProps) {
  const [abaAtiva, setAbaAtiva] = useState<'visao-geral' | 'pecas' | 'clientes' | 'boletos'>('visao-geral');
  const [carregando, setCarregando] = useState<boolean>(true);

  // Estados dos dados consolidados
  const [faturamentoTotal, setFaturamentoTotal] = useState<number>(0);
  const [totalOrdens, setTotalOrdens] = useState<number>(0);
  const [listaPecas, setListaPecas] = useState<any[]>([]);
  const [listaClientes, setListaClientes] = useState<any[]>([]);
  const [listaBoletos, setListaBoletos] = useState<any[]>([]);

  useEffect(() => {
    carregarDadosAdmin();
  }, []);

  const carregarDadosAdmin = async () => {
    setCarregando(true);
    try {
      // Carregar Ordens de Serviço / Faturamento
      const { data: osData } = await supabase.from('ordens_servico').select('*');
      if (osData) {
        setTotalOrdens(osData.length);
        const soma = osData.reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0);
        setFaturamentoTotal(soma);
      }

      // Carregar Peças Cadastradas
      const { data: pecasData } = await supabase.from('pecas_cadastradas').select('*').order('criado_em', { ascending: false });
      if (pecasData) setListaPecas(pecasData);

      // Carregar Clientes
      const { data: cliData } = await supabase.from('clientes').select('*').order('nome', { ascending: true });
      if (cliData) setListaClientes(cliData);

      // Carregar Boletos
      const { data: bolData } = await supabase.from('boletos_pecas').select('*').order('data_vencimento', { ascending: true });
      if (bolData) setListaBoletos(bolData);

    } catch (err) {
      console.error('Erro ao carregar dados do admin:', err);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      
      {/* Barra Lateral do Administrador */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between hidden md:flex shadow-xl">
        <div>
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-black tracking-wider text-white">
              BOX<span className="text-yellow-500">B1</span>
            </h1>
            <p className="text-xs font-semibold text-yellow-500 uppercase tracking-widest mt-1">
              Painel Diretoria (Izaias)
            </p>
          </div>

          <nav className="p-4 space-y-2">
            <button
              onClick={() => setAbaAtiva('visao-geral')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'visao-geral' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>📊 Visão Geral & Faturamento</span>
            </button>

            <button
              onClick={() => setAbaAtiva('pecas')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'pecas' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>📦 Peças & Margens de Lucro</span>
            </button>

            <button
              onClick={() => setAbaAtiva('clientes')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'clientes' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>👥 Gestão de Clientes</span>
            </button>

            <button
              onClick={() => setAbaAtiva('boletos')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-3 cursor-pointer ${
                abaAtiva === 'boletos' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>🧾 Boletos & Contas a Pagar</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-950/40">
          <div className="text-xs text-gray-400 mb-2 truncate">
            Admin: <strong className="text-gray-200">{emailUsuario}</strong>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-red-600/25 hover:bg-red-600/40 border border-red-700/50 text-red-300 text-xs font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer text-center"
          >
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Diretoria / Controle Geral da Oficina</span>
          <div className="flex items-center space-x-3">
            <button onClick={carregarDadosAdmin} className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer">
              🔄 Atualizar Dados
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              👑 Acesso Total Master
            </span>
          </div>
        </header>

        <div className="p-8 overflow-y-auto space-y-6">
          
          {carregando ? (
            <div className="text-xs text-gray-400 py-10 text-center">Carregando painel do administrador...</div>
          ) : (
            <>
              {abaAtiva === 'visao-geral' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
                      <span className="text-xs uppercase font-bold text-gray-400">Faturamento Consolidado (O.S.)</span>
                      <h2 className="text-3xl font-black text-green-400 mt-2">R$ {faturamentoTotal.toFixed(2)}</h2>
                      <p className="text-[11px] text-gray-500 mt-1">Soma de todas as ordens de serviço registradas.</p>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
                      <span className="text-xs uppercase font-bold text-gray-400">Total de Ordens Emitidas</span>
                      <h2 className="text-3xl font-black text-yellow-500 mt-2">{totalOrdens}</h2>
                      <p className="text-[11px] text-gray-500 mt-1">Serviços executados na oficina.</p>
                    </div>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Resumo Rápido das Atividades</h3>
                    <p className="text-xs text-gray-400">Utilize o menu lateral para navegar entre o controle de peças cadastradas pelos funcionários, listagem completa de clientes e boletos pendentes.</p>
                  </div>
                </div>
              )}

              {abaAtiva === 'pecas' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">Peças Cadastradas & Margens de Lucro</h3>
                    <p className="text-xs text-gray-400 mt-1">Visualização de todas as peças cadastradas pela equipe operacional.</p>
                  </div>

                  <div className="space-y-3">
                    {listaPecas.map((p) => (
                      <div key={p.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-yellow-500 text-sm">{p.nome_peca}</span>
                          <p className="text-gray-400 mt-0.5">Custo: R$ {Number(p.preco_custo).toFixed(2)} | Venda: R$ {Number(p.preco_venda).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-green-400 text-sm block">Lucro: R$ {Number(p.lucro_unitario).toFixed(2)}</span>
                          <span className="text-[10px] text-gray-500">{new Date(p.criado_em).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {listaPecas.length === 0 && <p className="text-xs text-gray-500 text-center py-6">Nenhuma peça cadastrada ainda.</p>}
                  </div>
                </div>
              )}

              {abaAtiva === 'clientes' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">Base de Clientes Cadastrados</h3>
                    <p className="text-xs text-gray-400 mt-1">Lista geral de clientes registrados no sistema.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listaClientes.map((cli) => (
                      <div key={cli.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs space-y-1">
                        <h4 className="font-bold text-white text-sm">{cli.nome}</h4>
                        <p className="text-gray-400">Telefone: {cli.telefone}</p>
                      </div>
                    ))}
                    {listaClientes.length === 0 && <p className="text-xs text-gray-500 text-center py-6 col-span-2">Nenhum cliente cadastrado.</p>}
                  </div>
                </div>
              )}

              {abaAtiva === 'boletos' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">Boletos & Contas a Pagar (Revendedores)</h3>
                    <p className="text-xs text-gray-400 mt-1">Acompanhamento dos boletos de peças cadastrados pela oficina.</p>
                  </div>

                  <div className="space-y-3">
                    {listaBoletos.map((b) => (
                      <div key={b.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-yellow-500 text-sm">{b.fornecedor}</span>
                          <p className="text-gray-400 mt-0.5">Boleto: {b.numero_boleto} | Vencimento: {b.data_vencimento}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-green-400 text-sm block">R$ {Number(b.valor_total).toFixed(2)}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-400 uppercase">{b.status}</span>
                        </div>
                      </div>
                    ))}
                    {listaBoletos.length === 0 && <p className="text-xs text-gray-500 text-center py-6">Nenhum boleto registrado.</p>}
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