import React from 'react';

function CategoryManager({
  showAddCategory,
  setShowAddCategory,
  newCategoryName,
  setNewCategoryName,
  newCategoryLimit,
  setNewCategoryLimit,
  categories,
  onAddCategory
}) {
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
          <div key={cat.id} className="flex justify-between items-center p-2 border rounded">
            <span>{cat.name}</span>
            <span className="text-sm text-gray-500">
              Limit: {cat.budget_limit > 0 ? `${cat.budget_limit} zł` : 'Brak'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryManager;