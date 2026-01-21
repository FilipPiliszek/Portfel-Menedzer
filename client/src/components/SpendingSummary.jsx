import React from 'react';
import { LayoutDashboard } from 'lucide-react';

function SpendingSummary({ spendingSummary }) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2rem] shadow-2xl mb-8">
      <h2 className="text-2xl font-black mb-8 text-white flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <LayoutDashboard className="text-indigo-400" size={20} />
        </div>
        Podsumowanie wydatków
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spendingSummary.map(cat => (
          <div key={cat.id} className="group relative p-6 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 overflow-hidden">

            <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-all"></div>
            
            <div className="relative z-10">
              <h3 className="font-bold text-slate-100 text-lg mb-1 group-hover:text-indigo-300 transition-colors">
                {cat.name}
              </h3>
              
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-black text-white">{cat.total_spent}</span>
                <span className="text-slate-500 text-sm font-bold uppercase">zł</span>
              </div>
              
              {cat.budget_limit > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Limit: {cat.budget_limit} zł</span>
                    <span className={cat.remaining >= 0 ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}>
                      {cat.remaining >= 0 ? `Pozostało: ${cat.remaining} zł` : `Nadwyżka: ${Math.abs(cat.remaining)} zł`}
                    </span>
                  </div>
                  
                  <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-white/5 p-[1px]">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        cat.total_spent / cat.budget_limit > 1 
                        ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' 
                        : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                      }`}
                      style={{ width: `${Math.min((cat.total_spent / cat.budget_limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {!cat.budget_limit && (
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4">
                  Brak ustawionego limitu
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {spendingSummary.length === 0 && (
        <div className="text-center py-12 bg-black/20 rounded-[2rem] border border-dashed border-white/10">
          <p className="text-slate-500 font-medium italic">Dodaj kategorie, aby zobaczyć podsumowanie</p>
        </div>
      )}
    </div>
  );
}

export default SpendingSummary;