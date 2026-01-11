import React, { useState } from 'react';

function TransactionList({ transactions, categories, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ amount: '', description: '', categoryId: '' });

  const startEditing = (t) => {
    setEditingId(t.id);
    setEditData({ amount: t.amount, description: t.description, categoryId: t.category_id });
  };

  const handleSave = async (id) => {
    await onUpdate(id, editData);
    setEditingId(null);
  };

  return (
      <div className="bg-white p-6 rounded shadow mt-6">
        <h2 className="font-bold mb-4 border-b pb-2 text-gray-700">Historia transakcji</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b text-sm">
                <th className="py-2">Data</th>
                <th className="py-2">Opis</th>
                <th className="py-2">Kategoria</th>
                <th className="py-2 text-right">Kwota</th>
                <th className="py-2 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b text-sm hover:bg-gray-50">
                  {editingId === t.id ? (
                    // tryb edycji
                    <>
                      <td className="py-2 text-gray-400">---</td>
                      <td className="py-2">
                        <input type="text" value={editData.description} className="border rounded p-1 w-full"
                               onChange={e => setEditData({...editData, description: e.target.value})} />
                      </td>
                      <td className="py-2">
                        <select value={editData.categoryId} className="border rounded p-1"
                                onChange={e => setEditData({...editData, categoryId: e.target.value})}>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </td>
                      <td className="py-2">
                        <input type="number" value={editData.amount} className="border rounded p-1 w-24 text-right"
                               onChange={e => setEditData({...editData, amount: e.target.value})} />
                      </td>
                      <td className="py-2 text-right">
                        <button onClick={() => handleSave(t.id)} className="text-green-600 font-bold mr-2">Zapisz</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400">Anuluj</button>
                      </td>
                    </>
                  ) : (
                    // widok standarodwy
                    <>
                      <td className="py-2 text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="py-2 font-medium">
                        {t.description || `Wydatek na ${t.category_name}`}
                      </td>
                      <td className="py-2"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{t.category_name}</span></td>
                      <td className="py-2 text-right font-bold text-red-600">-{parseFloat(t.amount).toFixed(2)} zł</td>
                      <td className="py-2 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => startEditing(t)} className="text-blue-500 hover:text-blue-700">Edytuj</button>
                          <button onClick={() => onDelete(t.id)} className="text-red-500 hover:text-red-700">Usuń</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

export default TransactionList;