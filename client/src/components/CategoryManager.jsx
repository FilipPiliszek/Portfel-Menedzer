import React, { useState } from 'react';
import { Settings, Plus, Edit2, Check, X, Trash2 } from 'lucide-react';

function CategoryManager({ showAddCategory, setShowAddCategory, newCategoryName, setNewCategoryName, newCategoryLimit, setNewCategoryLimit, categories, onAddCategory, onUpdateCategory, onDeleteCategory }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLimit, setEditLimit] = useState('');

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditLimit(cat.budget_limit || '');
  };

  const handleSave = async (id) => {
    await onUpdateCategory(id, { name: editName, budgetLimit: editLimit });
    setEditingId(null);
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2rem] shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-white flex items-center gap-3"><Settings className="text-cyan-400" size={24} /> Kategorie</h2>
        <button onClick={() => setShowAddCategory(!showAddCategory)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-cyan-400">{showAddCategory ? <X size={20} /> : <Plus size={20} />}</button>
      </div>
      
      {showAddCategory && (
        <form onSubmit={onAddCategory} className="space-y-4 mb-8 p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
          <input type="text" placeholder="Nazwa" value={newCategoryName} className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-white outline-none focus:ring-1 focus:ring-cyan-500" onChange={(e) => setNewCategoryName(e.target.value)} />
          <input type="number" placeholder="Limit" value={newCategoryLimit} className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-white outline-none focus:ring-1 focus:ring-cyan-500" onChange={(e) => setNewCategoryLimit(e.target.value)} />
          <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all">Dodaj kategorię</button>
        </form>
      )}

      <div className="space-y-3">
        {categories.map(cat => (
          <div key={cat.id} className="group flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all">
            {editingId === cat.id ? (
              <div className="flex gap-2 w-full">
                <input type="text" value={editName} className="bg-slate-950 border border-white/10 p-1 rounded text-sm flex-1 text-white" onChange={(e) => setEditName(e.target.value)} />
                <input type="number" value={editLimit} className="bg-slate-950 border border-white/10 p-1 rounded text-sm w-20 text-white" onChange={(e) => setEditLimit(e.target.value)} />
                <button onClick={() => handleSave(cat.id)} className="text-emerald-400 p-1"><Check size={18} /></button>
                <button onClick={() => setEditingId(null)} className="text-slate-500 p-1"><X size={18} /></button>
              </div>
            ) : (
              <>
                <div>
                  <div className="text-slate-100 font-bold">{cat.name}</div>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-tighter italic">Limit: {cat.budget_limit > 0 ? `${cat.budget_limit} zł` : 'Brak'}</div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => startEditing(cat)} className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg"><Edit2 size={16} /></button>
<button onClick={() => onDeleteCategory(cat.id, cat.name)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 size={16} /></button>                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export default CategoryManager;