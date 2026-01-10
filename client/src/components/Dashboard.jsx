import React, { useState, useEffect } from 'react';

function Dashboard({ user, onLogout }) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [alert, setAlert] = useState('');
  const [categories, setCategories] = useState([]);
  const [spendingSummary, setSpendingSummary] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState('');

  // Pobieranie danych przy montowaniu komponentu
  useEffect(() => {
    fetchCategories();
    fetchSpendingSummary();
    fetchTransactions();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/categories/${user.id}`);
      const data = await response.json();
      setCategories(data);
      if (data.length > 0 && !categoryId) {
        setCategoryId(data[0].id);
      }
    } catch (error) {
      console.error('Błąd pobierania kategorii:', error);
    }
  };

  const fetchSpendingSummary = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/spending-summary/${user.id}`);
      const data = await response.json();
      setSpendingSummary(data);
    } catch (error) {
      console.error('Błąd pobierania podsumowania:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${user.id}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Błąd pobierania transakcji:', error);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setAlert('');

    if (!amount || amount <= 0 || !categoryId) {
      setAlert('Wypełnij wszystkie pola poprawnie');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          categoryId: parseInt(categoryId),
          amount: parseFloat(amount),
          description: description || 'Transakcja'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setAlert('Transakcja dodana pomyślnie!');
        setAmount('');
        setDescription('');
        fetchSpendingSummary();
        fetchTransactions();
      } else {
        setAlert(result.message);
      }
    } catch (error) {
      console.error('Błąd dodawania transakcji:', error);
      setAlert('Błąd serwera');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      setAlert('Nazwa kategorii jest wymagana');
      return;
    }

    const limit = parseFloat(newCategoryLimit);
    if (newCategoryLimit && (isNaN(limit) || limit < 0)) {
      setAlert('Limit budżetowy musi być liczbą nieujemną');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          name: newCategoryName.trim(),
          budgetLimit: limit || 0
        }),
      });

      if (response.ok) {
        setNewCategoryName('');
        setNewCategoryLimit('');
        setShowAddCategory(false);
        setAlert('');
        fetchCategories();
        fetchSpendingSummary();
      } else {
        const error = await response.json();
        setAlert(error.message || 'Błąd dodawania kategorii');
      }
    } catch (error) {
      console.error('Błąd dodawania kategorii:', error);
      setAlert('Błąd serwera');
    }
  };

  const getCategoryName = (id) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : 'Nieznana';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold">Witaj, {user.name}!</h1>
        <button onClick={onLogout} className="text-red-500 underline text-sm">Wyloguj</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Dodawanie transakcji */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-bold mb-4">Dodaj nową transakcję</h2>
          {alert && (
            <p className={`text-sm mb-4 font-bold ${alert.includes('pomyślnie') ? 'text-green-500' : 'text-red-500'}`}>
              {alert}
            </p>
          )}
          <form onSubmit={handleAddTransaction} className="space-y-4">
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

        {/* Dodawanie kategorii */}
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
            <form onSubmit={handleAddCategory} className="space-y-4 mb-4 p-4 bg-gray-50 rounded">
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
      </div>

      {/* Podsumowanie wydatków */}
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
                    Pozostało: {cat.remaining >= 0 ? cat.remaining : Math.abs(cat.remaining)} zł
                    {cat.remaining < 0 && ' (PRZEKROCZONY!)'}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${cat.total_spent / cat.budget_limit > 1 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min((cat.total_spent / cat.budget_limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lista transakcji */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-bold mb-4">Ostatnie transakcje</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {transactions.slice(0, 10).map(transaction => (
            <div key={transaction.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <span className="font-semibold">{transaction.amount} zł</span>
                <span className="text-gray-500 ml-2">({getCategoryName(transaction.category_id)})</span>
                {transaction.description && (
                  <span className="text-gray-400 ml-2">- {transaction.description}</span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(transaction.date).toLocaleDateString('pl-PL')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;