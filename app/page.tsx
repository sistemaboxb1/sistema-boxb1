'use client';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const fazerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Entrando com o e-mail: ${email}`);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-wider mb-2">
            BOX<span className="text-yellow-500">B1</span>
          </h1>
          <p className="text-gray-400 text-sm">Sistema de Gestão Automotiva</p>
        </div>

        {/* Formulário */}
        <form onSubmit={fazerLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              E-mail de Acesso
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              placeholder="exemplo@boxb1.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md"
          >
            Entrar no Sistema
          </button>
        </form>

      </div>
    </div>
  );
}