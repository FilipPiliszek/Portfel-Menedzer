import React, { useState } from 'react';
import { Trash2, Edit2, Check, X, Calendar, Tag, DollarSign } from 'lucide-react';

function TransactionList({ transactions, getCategoryName, categories, onDelete, onUpdate }) {
  // stany do edycji
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ amount: '', categoryId: '', description: '' });

  const startEditing = (t) => {
    setEditingId(t.id);
    setEditData({ amount: t.amount, categoryId: t.category_id, description: t.description || '' });
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2rem] shadow-2xl mt-8">
      <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
        <div className="w-2 h-8 bg-gradient-to-b from-rose-500 to-orange-400 rounded-full"></div> 
        Historia operacji
      </h2>
      
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 italic bg-black/20 rounded-2xl border border-dashed border-white/10">
            Brak zapisanych transakcji
          </div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="group p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
              {editingId === t.id ? (
                /* WIDOK EDYCJI*/
                <div className="flex flex-wrap gap-4 items-center animate-in fade-in zoom-in-95 duration-200">
                  <input 
                    type="number" 
                    value={editData.amount} 
                    className="bg-slate-950 border border-white/10 p-2 rounded-lg text-white w-24 outline-none focus:ring-1 focus:ring-indigo-500" 
                    onChange={e => setEditData({...editData, amount: e.target.value})} 
                  />
                  <select 
                    value={editData.categoryId} 
                    className="bg-slate-950 border border-white/10 p-2 rounded-lg text-white flex-1 outline-none" 
                    onChange={e => setEditData({...editData, categoryId: e.target.value})}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input 
                    type="text" 
                    value={editData.description} 
                    className="bg-slate-950 border border-white/10 p-2 rounded-lg text-white flex-[2] outline-none" 
                    onChange={e => setEditData({...editData, description: e.target.value})} 
                  />
                  <div className="flex gap-1">
                    <button 
                      onClick={() => { onUpdate(t.id, editData); setEditingId(null); }} 
                      className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-all"
                    >
                      <Check size={18}/>
                    </button>
                    <button 
                      onClick={() => setEditingId(null)} 
                      className="p-2 bg-white/5 text-slate-400 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <X size={18}/>
                    </button>
                  </div>
                </div>
              ) : (
                /* WIDOK STANDARDOWY */
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <div className="text-slate-100 font-bold">{t.description || 'Transakcja'}</div>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {t.date ? new Date(t.date).toLocaleDateString('pl-PL') : '---'}
                        </span>
                        <span className="flex items-center gap-1 text-indigo-400">
                          <Tag size={10} /> {getCategoryName(t.category_id)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black text-rose-400">-{t.amount} zł</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => startEditing(t)} 
                        className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all"
                        title="Edytuj"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(t.id)} 
                        className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Usuń"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TransactionList;