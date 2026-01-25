import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { useApi } from '../hooks/useApi';
import { ChevronDown, BarChart3, TrendingUp, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b'];

function ChartsSection({ spendingSummary, transactions, userId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);

  const { monthlySummary, fetchMonthlySummary } = useApi(userId);

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
      if (sortedMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(sortedMonths[0]);
      }
    }
  }, [transactions]);

  useEffect(() => {
    if (selectedMonth && userId) {
      fetchMonthlySummary(selectedMonth);
    }
  }, [selectedMonth, userId, transactions]); // Dodano transactions do zależności - odświeży po dodaniu wpisu

  const pieData = (monthlySummary || [])
    .filter(cat => cat.total_spent > 0)
    .map(cat => ({
      name: cat.name,
      value: parseFloat(cat.total_spent) || 0,
      limit: cat.budget_limit
    }));

  const barData = (monthlySummary || [])
    .filter(cat => cat.budget_limit > 0)
    .map(cat => {
      const percentUsed = cat.budget_limit > 0 ? (cat.total_spent / cat.budget_limit) * 100 : 0;
      return {
        name: cat.name,
        procent: Math.round(Math.min(percentUsed, 100)),
        pozostalo: Math.round(Math.max(0, 100 - percentUsed))
      };
    });

  const monthlyData = transactions
    .filter(t => t.type !== 'income') // IGNORUJEMY WPŁATY W TRENDZIE
    .reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, wydatki: 0, count: 0 };
      }
      acc[monthKey].wydatki += parseFloat(transaction.amount) || 0;
      acc[monthKey].count += 1;
      return acc;
    }, {});

  const lineData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  const formatMonthName = (monthKey) => {
    if (!monthKey) return '';
    const [year, month] = monthKey.split('-');
    const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
                    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const chartStyle = {
    contentStyle: { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' },
    itemStyle: { color: '#f1f5f9' }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-[2rem] shadow-2xl mb-8 overflow-hidden transition-all">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-4 hover:bg-white/5 rounded-2xl transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
            <BarChart3 size={24} />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-black text-white">Wykresy i analizy</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">Twoje trendy finansowe</p>
          </div>
        </div>
        <ChevronDown className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : ''}`} />
      </button>

      {isExpanded && (
        <div className="p-4 space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 w-fit">
            <label className="text-sm font-black text-slate-400 uppercase tracking-wider">Zakres dat:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-950 border border-white/10 p-2 rounded-xl text-white outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>{formatMonthName(month)}</option>
              ))}
            </select>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 relative group hover:border-indigo-500/30 transition-all">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 text-center italic flex items-center justify-center gap-2">
                <PieIcon size={14} /> Struktura wydatków
              </h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie data={pieData} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-lg" />
                      ))}
                    </Pie>
                    <Tooltip {...chartStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-[350px] flex items-center justify-center text-slate-600 italic">Brak danych</div>}
            </div>

            <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 text-center italic flex items-center justify-center gap-2">
                Wykorzystanie limitów (%)
              </h3>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tick={{fill: '#94a3b8'}} />
                    <Tooltip {...chartStyle} cursor={{fill: 'rgba(255,255,255,0.05)'}} formatter={(value, name) => [`${Math.round(value)}%`, name == 'procent' ? 'Wykorzystane' : 'Pozostało']}/>
                    <Bar dataKey="procent" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} barSize={12} />
                    <Bar dataKey="pozostalo" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-[350px] flex items-center justify-center text-slate-600 italic">Brak limitów</div>}
            </div>
          </div>

          <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 text-center italic flex items-center justify-center gap-2">
              <TrendingUp size={14} /> Trend wydatków miesięcznych
            </h3>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" tickFormatter={formatMonthName} fontSize={10} tick={{fill: '#64748b'}} />
                  <YAxis stroke="#64748b" fontSize={10} tick={{fill: '#64748b'}} />
                  <Tooltip {...chartStyle} />
                  <Line type="monotone" dataKey="wydatki" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#020617' }} activeDot={{ r: 8, fill: '#818cf8' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-[300px] flex items-center justify-center text-slate-600 italic">Zbyt mało transakcji</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChartsSection;