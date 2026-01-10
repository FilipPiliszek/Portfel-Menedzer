import React from 'react';

function TransactionForm({ amount, setAmount, categoryId, setCategoryId, description, setDescription, categories, onSubmit, alert }) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="font-bold mb-4">Dodaj nową transakcję</h2>
      {alert && (
        <p className={`text-sm mb-4 font-bold ${alert.includes('pomyślnie') ? 'text-green-500' : 'text-red-500'}`}>
          {alert}
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="number"
          step="0.01"
          placeholder="Kwota"
          value={amount}
          className="w-full p-2 border rounded"
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          className="w-full p-2 border rounded"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Wybierz kategorię</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Opis (opcjonalny)"
          value={description}
          className="w-full p-2 border rounded"
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="w-full bg-green-600 text-white py-2 rounded">
          Zapisz transakcję
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;