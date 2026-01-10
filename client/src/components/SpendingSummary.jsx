import React from 'react';

function SpendingSummary({ spendingSummary }) {
  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="font-bold mb-4">Podsumowanie wydatków</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spendingSummary.map(cat => (
          <div key={cat.id} className="p-4 border rounded">
            <h3 className="font-semibold">{cat.name}</h3>
            <p className="text-sm text-gray-600">Wydano: {cat.total_spent} zł</p>
            {cat.budget_limit > 0 && (
              <div className="mt-2">
                <p className="text-sm">Limit: {cat.budget_limit} zł</p>
                <p className={`text-sm font-semibold ${cat.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Pozostało: {cat.remaining !== null ? (cat.remaining >= 0 ? cat.remaining : Math.abs(cat.remaining)) : 'Brak limitu'} zł
                  {cat.remaining < 0 && ' (PRZEKROCZONY!)'}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${cat.budget_limit > 0 && cat.total_spent / cat.budget_limit > 1 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${cat.budget_limit > 0 ? Math.min(Math.max((cat.total_spent / cat.budget_limit) * 100, 0), 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpendingSummary;