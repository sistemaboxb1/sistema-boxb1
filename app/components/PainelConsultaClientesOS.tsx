'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface OrdemServicoItem {
  id: string;
  os_codigo: string;
  problema_relatado: string;
  valor_total: number;
  status_pagamento: string;
  forma_pagamento: string;
  criado_em: string;
}

interface VeiculoItem {
  id: string;
  modelo: string;
  placa: string;
}

interface ClienteComHistorico {
  id: string;
  nome: string;
  telefone: string;
  veiculos: VeiculoItem[];
  ordens_servico: OrdemServicoItem[];
}

export default function PainelConsultaClientesOS() {
  const [clientes, setClientes] = useState<ClienteComHistorico[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  useEffect(() => {
    carregarClientesEOs();
  }, []);

  const carregarClientesEOs = async () => {
    setCarregando(true);
    try {
      // 1. Busca todos os clientes
      const { data: clientesData, error: errCli } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true });

      if (errCli) throw errCli;

      // 2. Para cada cliente, busca seus veículos e ordens de serviço vinculadas
      const clientesCompletos = await Promise.all(
        (clientesData || []).map(async (cli) => {
          const { data: veiculosData } = await supabase
            .from('veiculos')
            .select('id, modelo, placa')
            .eq('cliente_id', cli.id);

          const { data: osData } = await supabase
            .from('ordens_servico')
            .select('*')
            .eq('cliente_id', cli.id)
            .order('criado_em', { ascending: false });

          return {
            ...cli,
            veiculos: veiculosData || [],
            ordens_servico: osData || []
          };
        })
      );

      setClientes(clientesCompletos);
    } catch (err) {
      console.error('Erro ao buscar dados de clientes e O.S.:', err);
    } finally {
      setCarregando(false);
    }
  };

  const alternarExpandir = (id: string) => {
    setExpandidoId(expandidoId === id ? null : id);
  };

  if (carregando) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-400 text-xs">
        Carregando base de clientes e ordens de serviço...
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white">Consulta de Clientes & Ordens de Serviço Vinculadas</h3>
          <p className="text-xs text-gray-400 mt-1">Visualize o histórico completo de passagens e O.S. associadas a cada cliente da oficina.</p>
        </div>
        <button 
          onClick={carregarClientesEOs}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs py-2 px-4 rounded-lg transition-colors cursor-pointer"
        >
          🔄 Atualizar Lista
        </button>
      </div>

      <div className="space-y-4">
        {clientes.map((cli) => {
          const estaExpandido = expandidoId === cli.id;
          const total Gasto = cli.ordens_servico.reduce((acc, os) => acc + Number(os.valor_total), 0);

          return (
            <div key={cli.id} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden transition-all">
              
              {/* Cabeçalho do Cliente */}
              <div 
                onClick={() => alternarExpandir(cli.id)}
                className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-gray-900/50"
              >
                <div>
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-black text-white">{cli.nome}</h4>
                    <span className="text-[11px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                      {cli.telefone}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
                    <span>Veículo(s):</span>
                    {cli.veiculos.length > 0 ? (
                      cli.veiculos.map(v => (
                        <strong key={v.id} className="text-yellow-400">{v.modelo} ({v.placa})</strong>
                      ))
                    ) : (
                      <span className="italic text-gray-500">Nenhum veículo cadastrado diretamente</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Total em O.S.</span>
                    <span className="text-sm font-black text-green-400">R$ {total Gasto.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Passagens</span>
                    <span className="text-sm font-black text-white">{cli.ordens_servico.length} O.S.</span>
                  </div>
                  <span className="text-xs font-bold text-yellow-500">
                    {estaExpandido ? '▲ Ocultar O.S.' : '▼ Ver O.S.'}
                  </span>
                </div>
              </div>

              {/* Lista Expansível de Ordens de Serviço do Cliente */}
              {estaExpandido && (
                <div className="bg-gray-900/80 border-t border-gray-800 p-5 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-yellow-500">Ordens de Serviço Registradas para {cli.nome}:</h5>
                  
                  {cli.ordens_servico.length > 0 ? (
                    <div className="space-y-2">
                      {cli.ordens_servico.map((os) => (
                        <div key={os.id} className="bg-gray-950 p-4 rounded-lg border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-yellow-400">{os.os_codigo}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${os.status_pagamento === 'pago' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                {os.status_pagamento.toUpperCase()} ({os.forma_pagamento})
                              </span>
                            </div>
                            <p className="text-gray-300 mt-1">{os.problema_relatado || 'Nenhum defeito detalhado.'}</p>
                            <span className="text-[10px] text-gray-500 block mt-1">Data: {new Date(os.criado_em).toLocaleDateString()}</span>
                          </div>

                          <div className="text-right font-black text-white text-sm">
                            R$ {Number(os.valor_total).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic py-2">Nenhuma ordem de serviço cadastrada para este cliente ainda.</p>
                  )}

                </div>
              )}

            </div>
          );
        })}

        {clientes.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-8">Nenhum cliente cadastrado no banco de dados.</p>
        )}
      </div>

    </div>
  );
}