import React, { useState } from 'react';

function CategoryManager({
  showAddCategory,
  setShowAddCategory,
  newCategoryName,
  setNewCategoryName,
  newCategoryLimit,
  setNewCategoryLimit,
  categories,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory
}) {
  // lokalne stany do edycji (kategoria)
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLimit, setEditLimit] = useState('');

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditLimit(cat.budget_limit);
  };

  const handleSave = async (id) => {
    await onUpdateCategory(id, { name: editName, budgetLimit: editLimit });
    setEditingId(null);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">Zarządzanie kategoriami</h2>
        <button
          onClick={() => setShowAddCategory(!showAddCategory)}
          className="text-blue-500 underline text-sm"
        >
          {showAddCategory ? 'Anuluj' : '+ Dodaj kategorię'}
        </button>
      </div>

      {showAddCategory && (
        <form onSubmit={onAddCategory} className="space-y-4 mb-4 p-4 bg-gray-50 rounded">
          <input
            type="text"
            placeholder="Nazwa kategorii"
            value={newCategoryName}
            className="w-full p-2 border rounded"
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Limit budżetowy (opcjonalny)"
            value={newCategoryLimit}
            className="w-full p-2 border rounded"
            onChange={(e) => setNewCategoryLimit(e.target.value)}
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded">
            Dodaj kategorię
          </button>
        </form>
      )}

      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50 transition">
            {editingId === cat.id ? (
              // widok edycji
              <div className="flex gap-2 w-full">
                <input 
                  type="text" value={editName} className="p-1 border rounded text-sm flex-1"
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input 
                  type="number" value={editLimit} className="p-1 border rounded text-sm w-20"
                  onChange={(e) => setEditLimit(e.target.value)}
                />
                <button onClick={() => handleSave(cat.id)} className="text-green-600 text-xs font-bold">Zapisz</button>
                <button onClick={() => setEditingId(null)} className="text-gray-400 text-xs">Anuluj</button>
              </div>
            ) : (
              // widok standardowy
              <>
                <div className="flex flex-col text-left">
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-xs text-gray-500 text-left">
                    Limit: {cat.budget_limit > 0 ? `${parseFloat(cat.budget_limit).toFixed(2)} zł` : 'Brak'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => startEditing(cat)}
                    className="text-gray-400 hover:text-blue-500 p-1 transition"
                    title="Edytuj"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteCategory(cat.id, cat.name)}
                    className="text-red-500 hover:text-red-700 text-sm underline transition"
                  >
                    Usuń
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryManager;

