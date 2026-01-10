import React from 'react';

function TransactionList({ transactions, getCategoryName }) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="font-bold mb-4 border-b pb-2 text-gray-700">Historia transakcji</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b text-sm">
              <th className="py-2">Data</th>
              <th className="py-2">Opis / Kategoria</th>
              <th className="py-2 text-right">Kwota</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan="3" className="py-4 text-center text-gray-400">Brak transakcji w tym miesiącu</td></tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="border-b text-sm hover:bg-gray-50">
                  <td className="py-2 text-gray-500">
                    {t.date ? new Date(t.date).toLocaleDateString('pl-PL') : 'Brak daty'}
                  </td>
                  <td className="py-2 font-medium">
                    {t.description || `Wydatek na ${getCategoryName(t.category_id)}`}
                  </td>
                  <td className="py-2 text-right font-bold text-red-600">-{t.amount} zł</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionList;