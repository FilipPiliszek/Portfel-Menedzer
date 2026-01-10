import React, { useState } from 'react';

function Dashboard({ user, onLogout }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Jedzenie');
  const [alert, setAlert] = useState('');

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
    </div>
  );
}

export default Dashboard;