import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Dekoracyjne tło wewnątrz karty */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-500/20 rounded-2xl">
              <LogIn className="text-indigo-400" size={32} />
            </div>
          </div>

          <h2 className="text-3xl font-black mb-2 text-center bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic">
            Witaj ponownie
          </h2>
          <p className="text-slate-500 text-center text-sm font-bold uppercase tracking-widest mb-8">
            Zaloguj się do portfela
          </p>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-6 text-rose-400 text-xs font-black uppercase text-center tracking-tighter">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                placeholder="Adres e-mail" 
                className="w-full bg-slate-950/50 border border-white/10 text-white p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                placeholder="Hasło" 
                className="w-full bg-slate-950/50 border border-white/10 text-white p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group">
              Zaloguj się
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Nie masz jeszcze konta?</p>
            <button 
              onClick={onSwitchToRegister} 
              className="text-indigo-400 font-black hover:text-indigo-300 transition-colors text-sm underline underline-offset-4"
            >
              Zarejestruj się teraz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;