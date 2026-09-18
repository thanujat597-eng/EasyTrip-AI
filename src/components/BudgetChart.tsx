import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DollarSign, Wallet, TrendingUp, AlertCircle, PieChart as PieIcon, CreditCard } from 'lucide-react';
import { Trip, Expense } from '../types';
import { getCurrencySymbol } from '../utils/currency';

interface BudgetChartProps {
  trip: Trip;
}

export const BudgetChart: React.FC<BudgetChartProps> = ({ trip }) => {
  const currencySymbol = getCurrencySymbol(trip.currency);

  // Calculate actual tracked expenses sum
  const totalTrackedExpenses = (trip.expenses || []).reduce((acc, curr) => acc + curr.amount, 0);

  // Breakdown source: either AI suggested budget breakdown or fallback calculated
  const breakdown = trip.budgetBreakdown || {
    lodging: Math.round(trip.totalBudget * 0.45),
    food: Math.round(trip.totalBudget * 0.25),
    activities: Math.round(trip.totalBudget * 0.15),
    transport: Math.round(trip.totalBudget * 0.10),
    shopping: Math.round(trip.totalBudget * 0.03),
    misc: Math.round(trip.totalBudget * 0.02),
  };

  const pieData = [
    { name: 'Lodging & Hotels', value: breakdown.lodging, color: '#38bdf8' },
    { name: 'Dining & Food', value: breakdown.food, color: '#818cf8' },
    { name: 'Tours & Activities', value: breakdown.activities, color: '#c084fc' },
    { name: 'Transport & Transit', value: breakdown.transport, color: '#f472b6' },
    { name: 'Shopping', value: breakdown.shopping, color: '#fb923c' },
    { name: 'Misc & Emergency', value: breakdown.misc, color: '#94a3b8' },
  ].filter((item) => item.value > 0);

  const budgetUsedPercentage = Math.min(100, Math.round((totalTrackedExpenses / (trip.totalBudget || 1)) * 100));

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Overview Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Total Budget */}
        <div className="p-5 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-sky-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider">Total Trip Budget</span>
            <div className="p-2 bg-sky-500/10 rounded-xl text-sky-500">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {currencySymbol}{trip.totalBudget.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 capitalize">
            {trip.budgetLevel} budget tier for {trip.durationDays} days
          </p>
        </div>

        {/* Card 2: Tracked Expenses */}
        <div className="p-5 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-indigo-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider">Spent So Far</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {currencySymbol}{totalTrackedExpenses.toLocaleString()}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${budgetUsedPercentage}%` }}
            />
          </div>
        </div>

        {/* Card 3: Remaining Balance */}
        <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-emerald-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider">Remaining Budget</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${
            trip.totalBudget - totalTrackedExpenses < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {currencySymbol}{(trip.totalBudget - totalTrackedExpenses).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {trip.totalBudget - totalTrackedExpenses >= 0 ? 'On track with travel plan' : 'Exceeded estimated plan'}
          </p>
        </div>

      </div>

      {/* Visual Chart and Category Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart Card */}
        <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Estimated Expense Distribution
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 rounded-full">
              AI Projected
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${currencySymbol}${Number(value).toLocaleString()}`, 'Estimated']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Items List */}
        <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200/60 dark:border-slate-800 pb-3 mb-4">
              Budget Category Breakdown
            </h3>

            <div className="space-y-3">
              {pieData.map((item) => {
                const percentage = Math.round((item.value / trip.totalBudget) * 100);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {currencySymbol}{item.value.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 mt-4">
            <AlertCircle className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Pro tip: You can track exact group splitting and individual receipts in the <strong>Expense Splitter</strong> tab.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
