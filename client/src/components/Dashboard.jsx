import React, { useState, useEffect } from 'react';

function Dashboard({ user, onLogout }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Jedzenie');
  const [alert, setAlert] = useState('');
  const [transactions, setTransactions] = useState([]);

  // funkcja do pobierania listy z serwera
  useEffect(() => {
    fetch(`http://localhost:5000/api/transactions/${user.id}`)
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error("Błąd pobierania:", err));
  }, [user.id]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setAlert('');

    // walidacja poprawnosci danych
    if (!amount || amount <= 0) {
      setAlert('Dane są niekompletne lub kwota jest błędna');
      return;
    }

    try {
      // dane do backendu
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id, // ID zalogowanego użytkownika
          amount: parseFloat(amount),
          category: category,
          description: `Wydatek na ${category}`
        })
      });

      const data = await response.json();

      if (data.success) {
        // obsluga limitu miesiecznego
        if (data.overLimit) {
          setAlert(`PRZEKROCZONO LIMIT! W tym miesiącu na "${category}" wydano już łącznie: ${data.currentSum} zł (Twój limit to: ${data.limit} zł).`);
        } else {
          window.alert("Transakcja zapisana pomyślnie!");
        }

        setAmount('');
        
        // odswiezanie listy po dodaniu transakcji
        fetch(`http://localhost:5000/api/transactions/${user.id}`)
          .then(res => res.json())
          .then(data => setTransactions(data));

      } else {
        setAlert(`Błąd serwera: ${data.message || 'Nie udało się zapisać.'}`);
      }

    } catch (err) {
      console.error("Błąd połączenia:", err);
      setAlert('Błąd połączenia z serwerem. Upewnij się, że backend działa.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold">Witaj, {user.name}!</h1>
        <button onClick={onLogout} className="text-red-500 underline text-sm">Wyloguj</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* blok dodawania nowej transakcji */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-bold mb-4">Dodaj nową transakcję</h2>
          {alert && <p className="text-orange-500 text-sm mb-4 font-bold">{alert}</p>}
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <input 
              type="number" placeholder="Kwota" value={amount}
              className="w-full p-2 border rounded"
              onChange={(e) => setAmount(e.target.value)}
            />
            <select className="w-full p-2 border rounded" onChange={(e) => setCategory(e.target.value)}>
              <option>Jedzenie</option>
              <option>Rozrywka</option>
              <option>Transport</option>
            </select>
            <button className="w-full bg-green-600 text-white py-2 rounded">
              Zapisz transakcję
            </button>
          </form>
        </div>

        {/* miejsce na wykresy */}
        <div className="bg-white p-6 rounded shadow border-dashed border-2 flex items-center justify-center text-gray-400">
          Tu będą wykresy (Recharts)
        </div>
        </div>
        {/* lista transakcji */}
      <div className="mt-8 bg-white p-6 rounded shadow">
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
                    <td className="py-2 text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="py-2 font-medium">{t.description}</td>
                    <td className="py-2 text-right font-bold text-red-600">-{t.amount} zł</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;