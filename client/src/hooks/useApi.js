import { useState } from 'react';

export function useApi(userId) {
  const [categories, setCategories] = useState([]);
  const [spendingSummary, setSpendingSummary] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const fetchCategories = async () => {
    if (!userId) return [];
    try {
      const response = await fetch(`http://localhost:5000/api/categories/${userId}`);
      if (!response.ok) {
        console.error('Failed to fetch categories:', response.status, response.statusText);
        return [];
      }
      const data = await response.json();
      setCategories(data);
      return data;
    } catch (error) {
      console.error('Błąd pobierania kategorii:', error);
      return [];
    }
  };

  const fetchSpendingSummary = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:5000/api/spending-summary/${userId}`);
      if (!response.ok) {
        console.error('Failed to fetch spending summary:', response.status, response.statusText);
        return;
      }
      const data = await response.json();
      setSpendingSummary(data);
    } catch (error) {
      console.error('Błąd pobierania podsumowania:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${userId}`);
      if (!response.ok) {
        console.error('Failed to fetch transactions:', response.status, response.statusText);
        return;
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Błąd pobierania transakcji:', error);
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      const result = await response.json();
      return { response, result };
    } catch (error) {
      console.error('Błąd dodawania transakcji:', error);
      throw error;
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const response = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();
      return { response, result };
    } catch (error) {
      console.error('Błąd dodawania kategorii:', error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      return { response, result };
    } catch (error) {
      console.error('Błąd usuwania kategorii:', error);
      throw error;
    }
  };

  return {
    categories,
    setCategories,
    spendingSummary,
    transactions,
    fetchCategories,
    fetchSpendingSummary,
    fetchTransactions,
    addTransaction,
    addCategory,
    deleteCategory,
  };
}