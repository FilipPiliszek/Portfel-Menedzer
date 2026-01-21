import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import TransactionForm from './TransactionForm';
import CategoryManager from './CategoryManager';
import SpendingSummary from './SpendingSummary';
import ChartsSection from './ChartsSection';
import TransactionList from './TransactionList';

function Dashboard({ user, onLogout }) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [alert, setAlert] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState('');

  const {
    categories,
    setCategories,
    spendingSummary,
    transactions,
    fetchCategories,
    fetchSpendingSummary,
    fetchTransactions,
    addTransaction,
    deleteCategory,
    addCategory,
    updateCategory,
    deleteTransaction,
    updateTransaction,
  } = useApi(user?.id);

  // Efekt przy montowaniu komponentu
  useEffect(() => {
    if (user?.id) {
      fetchCategories().then(data => {
        if (data.length > 0 && !categoryId) {
          setCategoryId(data[0].id);
        }
      });
      fetchSpendingSummary();
      fetchTransactions();
    }
  }, [user?.id]);

  // Obsługa dodawania transakcji
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setAlert('');

    if (!amount || parseFloat(amount) <= 0 || !categoryId) {
      setAlert('Błąd: Wprowadź kwotę i wybierz kategorię!');
      return;
    }

    try {
      const { response, result } = await addTransaction({
        userId: user.id,
        categoryId: parseInt(categoryId),
        amount: parseFloat(amount),
        description: description || 'Transakcja'
      });

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
      setAlert('Błąd serwera');
    }
  };

  // obsluga usuwania transakcji
  const handleDeleteTransaction = async (id) => {
  if (window.confirm("Usunąć tę transakcję?")) {
    await deleteTransaction(id);
    fetchTransactions();
    fetchSpendingSummary(); // Ważne: odświeża paski budżetu!
  }
};

// obsluga edycji transakcji
const handleUpdateTransaction = async (id, data) => {
  await updateTransaction(id, data);
  fetchTransactions();
  fetchSpendingSummary();
};

  // Obsługa dodawania kategorii
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
      const { response, result } = await addCategory({
        userId: user.id,
        name: newCategoryName.trim(),
        budgetLimit: limit || 0
      });

      if (response.ok) {
        setNewCategoryName('');
        setNewCategoryLimit('');
        setShowAddCategory(false);
        setAlert('');
        fetchCategories();
        fetchSpendingSummary();
      } else {
        setAlert(result.message || 'Błąd dodawania kategorii');
      }
    } catch (error) {
      setAlert('Błąd serwera');
    }
  };

  // Obsługa usuwania kategorii
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć kategorię "${categoryName}"? Wszystkie transakcje w tej kategorii zostaną zachowane, ale nie będą przypisane do żadnej kategorii.`)) {
      return;
    }

    try {
      const { response, result } = await deleteCategory(categoryId);

      if (response.ok) {
        setAlert(`Kategoria "${categoryName}" została usunięta`);
        fetchCategories();
        fetchSpendingSummary();
        fetchTransactions();
      } else {
        setAlert(result.message || 'Błąd usuwania kategorii');
      }
    } catch (error) {
      setAlert('Błąd serwera');
    }
  };

  // obsluga edytowania kategorii
  const handleUpdateCategory = async (id, updatedData) => {
  try {
    const { response } = await updateCategory(id, updatedData);
    if (response.ok) {
      fetchCategories();
      fetchSpendingSummary();
    }
  } catch (error) {
    setAlert('Błąd podczas aktualizacji limitu');
  }
};

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold">Witaj, {user.name || 'Użytkowniku'}!</h1>
        <button onClick={onLogout} className="text-red-500 underline text-sm">Wyloguj</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <TransactionForm
          amount={amount}
          setAmount={setAmount}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          description={description}
          setDescription={setDescription}
          categories={categories}
          onSubmit={handleAddTransaction}
          alert={alert}
        />

        <CategoryManager
          showAddCategory={showAddCategory}
          setShowAddCategory={setShowAddCategory}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          newCategoryLimit={newCategoryLimit}
          setNewCategoryLimit={setNewCategoryLimit}
          categories={categories}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onUpdateCategory={handleUpdateCategory}
        />
      </div>

      <SpendingSummary spendingSummary={spendingSummary} />

      <ChartsSection spendingSummary={spendingSummary} transactions={transactions} userId={user?.id} />

      <TransactionList
      transactions={transactions}
      categories={categories}
      onDelete={handleDeleteTransaction}
      onUpdate={handleUpdateTransaction}
      />
    </div>
  );
}

export default Dashboard;