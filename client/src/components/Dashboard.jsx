import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import TransactionForm from './TransactionForm';
import CategoryManager from './CategoryManager';
import SpendingSummary from './SpendingSummary';
import ChartsSection from './ChartsSection';
import TransactionList from './TransactionList';
import { LogOut, Wallet } from 'lucide-react'; // Dodane ikony

function Dashboard({ user, onLogout }) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [alert, setAlert] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState('');

  // Stany dla salda (dodane dyskretnie)
  const [walletData, setWalletData] = useState({ balance: 0, totalIncome: 0, totalSpent: 0 });
  const [incomeInput, setIncomeInput] = useState('');

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
    fetchBalance,
    addIncome
  } = useApi(user?.id);

  const updateBalance = () => { if(fetchBalance) fetchBalance().then(setWalletData); };

  const handleAddFunds = async () => {
    const val = parseFloat(incomeInput);
    if (!isNaN(val) && val > 0) {
      await addIncome(val);
      setIncomeInput('');
      updateBalance();
      fetchTransactions(); // Odświeżamy też listę, żeby pokazać wpływ
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCategories().then(data => {
        if (data && data.length > 0 && !categoryId) {
          setCategoryId(data[0].id);
        }
      });
      fetchSpendingSummary();
      fetchTransactions();
      updateBalance();
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
        updateBalance();
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
      updateBalance();
    }
  };

  const handleUpdateTransaction = async (id, data) => {
    await updateTransaction(id, data);
    fetchTransactions();
    fetchSpendingSummary();
    updateBalance();
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
        await fetchCategories();
        await fetchSpendingSummary(); 
        await fetchTransactions();
      }
    } catch (error) {
      setAlert('Błąd podczas aktualizacji limitu');
    }
  };

  const getCategoryName = (id) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : 'Nieznana';
  };

  const spentPercentage = walletData.totalIncome > 0 
    ? Math.min(100, (walletData.totalSpent / walletData.totalIncome) * 100) 
    : 0;

  const getBarColor = () => {
    if (spentPercentage < 50) return 'bg-emerald-500';
    if (spentPercentage < 85) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-24">
      
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

          <div className="ml-11 mt-8 flex flex-col gap-4 min-w-[450px]">
            <div className="flex justify-between items-center gap-6">
              <div>
                <p className="text-slate-500 text-[11px] uppercase font-black tracking-widest mb-1">Dostępne środki</p>
                <p className="text-5xl font-mono font-black text-emerald-400 tracking-tighter italic">
                  {walletData.balance.toFixed(2)} <span className="text-2xl ml-[-10px]">PLN</span>
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                <input type="number" value={incomeInput} onChange={(e) => setIncomeInput(e.target.value)} placeholder="0.00" className="w-32 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-emerald-400 font-mono text-lg font-bold outline-none focus:border-emerald-500/50 transition-all placeholder:text-emerald-900" />
                <button onClick={handleAddFunds} className="px-6 py-3 bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]">Dodaj wpływ</button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                <div className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor()}`} style={{ width: `${spentPercentage}%` }}></div>
              </div>
              <div className="flex justify-between items-center px-1">
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Wykorzystano <span className={spentPercentage > 85 ? 'text-rose-500' : 'text-emerald-400'}>{spentPercentage.toFixed(1)}%</span> budżetu</p>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Suma wydatków: {walletData.totalSpent.toFixed(2)} PLN</p>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onLogout} 
          className="group flex items-center gap-2 px-6 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-full text-xs font-black uppercase tracking-widest transition-all border border-rose-500/20 active:scale-95"
        >
          <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
          Wyloguj się
        </button>
      </header>

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

      <ChartsSection spendingSummary={spendingSummary} transactions={transactions} userId={user?.id} />

      <SpendingSummary spendingSummary={spendingSummary} />

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