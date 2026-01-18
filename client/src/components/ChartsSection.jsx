import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { useApi } from '../hooks/useApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function ChartsSection({ spendingSummary, transactions, userId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);

  const { monthlySummary, fetchMonthlySummary } = useApi(userId);

  // Generowanie dostępnych miesięcy z danych transakcji
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const months = {};
      transactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months[monthKey] = true;
      });

      const sortedMonths = Object.keys(months).sort().reverse();
      setAvailableMonths(sortedMonths);

      // Ustawiamy domyślny miesiąc na ostatni dostępny
      if (sortedMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(sortedMonths[0]);
      }
    }
  }, [transactions]);

  // Przeładowanie danych gdy zmieni się wybrany miesiąc
  useEffect(() => {
    if (selectedMonth && userId) {
      fetchMonthlySummary(selectedMonth);
    }
  }, [selectedMonth, userId]);

  // Przygotowanie danych dla wykresu donut na podstawie wybranego miesiąca
  const pieData = (monthlySummary || [])
    .filter(cat => cat.total_spent > 0)
    .map(cat => ({
      name: cat.name,
      value: parseFloat(cat.total_spent) || 0,
      limit: cat.budget_limit
    }));

  // Przygotowanie danych dla wykresu słupkowego na podstawie wybranego miesiąca
  const barData = (monthlySummary || [])
    .filter(cat => cat.budget_limit > 0)
    .map(cat => {
      const percentUsed = cat.budget_limit > 0 ? (cat.total_spent / cat.budget_limit) * 100 : 0;
      return {
        name: cat.name,
        procent: Math.min(percentUsed, 100),
        pozostalo: Math.max(0, 100 - percentUsed)
      };
    });

  // Przygotowanie danych dla wykresu liniowego (suma wydatków z każdego miesiąca)
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, wydatki: 0, count: 0 };
    }

    acc[monthKey].wydatki += parseFloat(transaction.amount) || 0;
    acc[monthKey].count += 1;

    return acc;
  }, {});

  const lineData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month));

  // Helper do formatowania nazwy miesiąca
  const formatMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
                    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center text-left font-bold mb-4 hover:bg-gray-50 p-2 rounded"
      >
        <span>Wykresy i analizy</span>
        <span className="text-xl">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="space-y-6">
          {/* Selektor miesiąca */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Wybierz miesiąc:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full md:w-64 p-3 border rounded bg-white"
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {formatMonthName(month)}
                </option>
              ))}
            </select>
          </div>

          {/* Wykres donut - wydatki na kategorie */}
          <div>
            <h3 className="font-semibold mb-4 text-center">Rozkład wydatków na kategorie</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={450}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={140}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} zł`, 'Wydatki']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Brak danych do wyświetlenia. Dodaj transakcje w różnych kategoriach.
              </div>
            )}
          </div>

          {/* Wykres słupkowy - procent wykorzystania limitu */}
          <div>
            <h3 className="font-semibold mb-4 text-center">Wykorzystanie limitów budżetowych (%)</h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, '']} />
                  <Legend />
                  <Bar dataKey="procent" stackId="a" fill="#ff6b6b" name="Wykorzystane" />
                  <Bar dataKey="pozostalo" stackId="a" fill="#4ecdc4" name="Pozostało" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Brak danych do wyświetlenia. Ustaw limity dla kategorii.
              </div>
            )}
          </div>

          {/* Wykres liniowy - suma wydatków z każdego miesiąca */}
          <div>
            <h3 className="font-semibold mb-4 text-center">Trend wydatków (wszystkie dostępne miesiące)</h3>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} zł`, 'Wydatki']}
                    labelFormatter={(label) => `Miesiąc: ${formatMonthName(label)}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="wydatki"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Wydatki"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Brak danych do wyświetlenia.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChartsSection;