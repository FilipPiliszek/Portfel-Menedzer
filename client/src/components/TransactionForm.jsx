import React from 'react';
import { PlusCircle, DollarSign, Tag, FileText } from 'lucide-react';

function TransactionForm({ amount, setAmount, categoryId, setCategoryId, description, setDescription, categories, onSubmit, alert }) {
  const inputClass = "w-full bg-slate-950/50 border border-white/10 text-slate-200 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2rem] shadow-2xl">
      <h2 className="text-xl font-black mb-6 text-white flex items-center gap-3"><PlusCircle className="text-indigo-400" size={24} /> Nowa transakcja</h2>
      {alert && <div className={`p-4 rounded-2xl mb-6 text-xs font-black uppercase border ${alert.includes('pomyślnie') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>{alert}</div>}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="relative">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Kwota</label>
          <DollarSign className="absolute left-3 top-[34px] text-slate-600" size={18} />
          <input type="number" step="0.01" placeholder="0.00" value={amount} className={inputClass} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="relative">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Kategoria</label>
          <Tag className="absolute left-3 top-[34px] text-slate-600" size={18} />
          <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Wybierz kategorię</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div className="relative">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Opis</label>
          <FileText className="absolute left-3 top-[34px] text-slate-600" size={18} />
          <input type="text" placeholder="Na co wydano?" value={description} className={inputClass} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]">Zapisz transakcję</button>
      </form>
    </div>
  );
}
export default TransactionForm;