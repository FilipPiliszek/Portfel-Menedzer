import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';

function Register({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError('Wszystkie pola są wymagane!');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        onRegister(data.user);
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
        {/* Dekoracyjne tło */}
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-500/20 rounded-2xl">
              <UserPlus className="text-emerald-400" size={32} />
            </div>
          </div>

          <h2 className="text-3xl font-black mb-2 text-center bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic">
            Dołącz do nas
          </h2>
          <p className="text-slate-500 text-center text-sm font-bold uppercase tracking-widest mb-8">
            Stwórz darmowe konto
          </p>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-6 text-rose-400 text-xs font-black uppercase text-center tracking-tighter">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Imię lub Nick" 
                className="w-full bg-slate-950/50 border border-white/10 text-white p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                onChange={e => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                placeholder="Adres e-mail" 
                className="w-full bg-slate-950/50 border border-white/10 text-white p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                placeholder="Twoje hasło" 
                className="w-full bg-slate-950/50 border border-white/10 text-white p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
              Stwórz konto
            </button>
          </form>

          <button 
            onClick={onSwitchToLogin} 
            className="w-full mt-6 flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Wróć do logowania
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;