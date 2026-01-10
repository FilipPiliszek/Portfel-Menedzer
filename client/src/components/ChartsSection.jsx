import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function ChartsSection({ spendingSummary, transactions }) {
  const [isExpanded, setIsExpanded] = useState(false);


  // Przygotowanie danych dla wykresu donut (wydatki na kategorie)
  const pieData = spendingSummary
    .filter(cat => cat.total_spent > 0) // tylko kategorie z wydatkami
    .map(cat => ({
      name: cat.name,
      value: parseFloat(cat.total_spent) || 0, // upewnij się że to number
      limit: cat.budget_limit
    }));

  console.log('ChartsSection - pieData:', pieData);
  console.log('ChartsSection - pieData.length:', pieData.length);

  // Przygotowanie danych dla wykresu liniowego (wydatki w czasie)
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
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // ostatnie 6 miesięcy

  // Przygotowanie danych dla wykresu słupkowego (procent wykorzystania limitu)
  const barData = spendingSummary
    .filter(cat => cat.budget_limit > 0)
    .map(cat => {
      const percentUsed = cat.budget_limit > 0 ? (cat.total_spent / cat.budget_limit) * 100 : 0;
      return {
        name: cat.name,
        procent: Math.min(percentUsed, 100), // maksymalnie 100%
        pozostalo: Math.max(0, 100 - percentUsed) // pozostała część do 100%
      };
    });

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
          {/* Wykres donut - wydatki na kategorie */}
          <div>
            <h3 className="font-semibold mb-4 text-center">Rozkład wydatków na kategorie</h3>
            {console.log('Rendering pie chart, pieData:', pieData, 'length:', pieData.length)}
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} zł`, 'Wydatki']} />
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

          {/* Wykres liniowy - wydatki w czasie */}
          <div>
            <h3 className="font-semibold mb-4 text-center">Trend wydatków (ostatnie 6 miesięcy)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} zł`, 'Wydatki']}
                  labelFormatter={(label) => `Miesiąc: ${label}`}
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
          </div>
        </div>
      )}
    </div>
  );
}

export default ChartsSection;