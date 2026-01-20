import React from 'react';
import { Trash2, Calendar, Tag, DollarSign } from 'lucide-react';

function TransactionList({ transactions, getCategoryName, onDelete }) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2rem] shadow-2xl mt-8">
      <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3"><div className="w-2 h-8 bg-gradient-to-b from-rose-500 to-orange-400 rounded-full"></div> Historia operacji</h2>
      <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500"><DollarSign size={20} /></div>
                <div>
                  <div className="text-slate-100 font-bold">{t.description}</div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter text-slate-500">
                    <Calendar size={10} /> {new Date(t.date).toLocaleDateString('pl-PL')}
                    <Tag size={10} className="text-indigo-400 ml-2"/> {getCategoryName(t.category_id)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xl font-black text-rose-400">-{t.amount} zł</span>
                <button onClick={() => onDelete(t.id)} className="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
export default TransactionList;