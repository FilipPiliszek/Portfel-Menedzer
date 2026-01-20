import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import TransactionForm from './TransactionForm';
import CategoryManager from './CategoryManager';
import SpendingSummary from './SpendingSummary';
import ChartsSection from './ChartsSection';
import TransactionList from './TransactionList';
import { LogOut, Wallet } from 'lucide-react'; // Dodane ikony do nagłówka

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

  // LOGIKA (BEZ ZMIAN)
  useEffect(() => {
    if (user?.id) {
      fetchCategories().then(data => {
        if (data && data.length > 0 && !categoryId) {
          setCategoryId(data[0].id);
        }
      });
      fetchSpendingSummary();
      fetchTransactions();
    }
  }, [user?.id]);

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

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Usunąć tę transakcję?")) {
      await deleteTransaction(id);
      fetchTransactions();
      fetchSpendingSummary();
    }
  };

  const handleUpdateTransaction = async (id, data) => {
    await updateTransaction(id, data);
    fetchTransactions();
    fetchSpendingSummary();
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

  // Funkcja pomocnicza potrzebna do poprawnego wyświetlania listy transakcji
  const getCategoryName = (id) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : 'Nieznana';
  };

  // --- ZMIANA WYGLĄDU (RETURN) ---
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-24">
      
      {/* NOWOCZESNY NAGŁÓWEK */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-8 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Wallet className="text-indigo-400" size={24} />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent italic tracking-tighter">
              Witaj, {user.name || 'Użytkowniku'}!
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] ml-11">Twój portfel pod kontrolą</p>
        </div>
        
        <button 
          onClick={onLogout} 
          className="group flex items-center gap-2 px-6 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-full text-xs font-black uppercase tracking-widest transition-all border border-rose-500/20 active:scale-95"
        >
          <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
          Wyloguj się
        </button>
      </header>

      {/* SEKCJA FORMULARZY (GRID) */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
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

      {/* WYKRESY I ANALIZY */}
      <ChartsSection spendingSummary={spendingSummary} transactions={transactions} userId={user?.id} />

      {/* PODSUMOWANIE WYDATKÓW */}
      <SpendingSummary spendingSummary={spendingSummary} />

      {/* LISTA TRANSAKCJI */}
      <TransactionList
        transactions={transactions}
        categories={categories}
        getCategoryName={getCategoryName}
        onDelete={handleDeleteTransaction}
        onUpdate={handleUpdateTransaction}
      />
      
    </div>
  );
}

export default Dashboard;