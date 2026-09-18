import React, { useState } from 'react';
import { DollarSign, Plus, Users, Receipt, ArrowRight, PieChart } from 'lucide-react';
import { Expense } from '../types';
import { getCurrencySymbol } from '../utils/currency';

interface ExpenseSplitterProps {
  expenses: Expense[];
  travelerNames: string[];
  currency?: string;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

export const ExpenseSplitter: React.FC<ExpenseSplitterProps> = ({
  expenses,
  travelerNames,
  currency = 'INR',
  onAddExpense,
}) => {
  const currencySymbol = getCurrencySymbol(currency);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('food');
  const [paidBy, setPaidBy] = useState(travelerNames[0] || 'Me');
  const [selectedSplits, setSelectedSplits] = useState<string[]>(travelerNames);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculate balances per traveler
  const balances: Record<string, number> = {};
  travelerNames.forEach((name) => (balances[name] = 0));

  expenses.forEach((exp) => {
    const payer = exp.paidBy;
    const splitCount = exp.splitAmong.length || 1;
    const share = exp.amount / splitCount;

    if (balances[payer] !== undefined) {
      balances[payer] += exp.amount;
    } else {
      balances[payer] = exp.amount;
    }

    exp.splitAmong.forEach((person) => {
      if (balances[person] !== undefined) {
        balances[person] -= share;
      } else {
        balances[person] = -share;
      }
    });
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    onAddExpense({
      title: title.trim(),
      amount: numAmount,
      category,
      paidBy,
      splitAmong: selectedSplits.length > 0 ? selectedSplits : travelerNames,
      date: new Date().toISOString().split('T')[0],
    });

    setTitle('');
    setAmount('');
  };

  const toggleSplitPerson = (name: string) => {
    if (selectedSplits.includes(name)) {
      if (selectedSplits.length === 1) return; // Keep at least 1
      setSelectedSplits(selectedSplits.filter((n) => n !== name));
    } else {
      setSelectedSplits([...selectedSplits, name]);
    }
  };

  return (
    <div className="p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Trip Expense Splitter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Log shared costs & see automated balances
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-2">
          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
            Total Spent:
          </span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {currencySymbol}{totalSpent.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left: Add Expense Form */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            Add New Expense
          </h4>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Group Dinner, Taxi fare"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Amount (${currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Expense['category'])}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="food" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Food & Drinks</option>
                  <option value="transport" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Transport</option>
                  <option value="accommodation" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lodging</option>
                  <option value="activities" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Activities</option>
                  <option value="shopping" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Shopping</option>
                  <option value="other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                {travelerNames.map((name) => (
                  <option key={name} value={name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Split Among
              </label>
              <div className="flex flex-wrap gap-1.5">
                {travelerNames.map((name) => {
                  const isSelected = selectedSplits.includes(name);
                  return (
                    <button
                      type="button"
                      key={name}
                      onClick={() => toggleSplitPerson(name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </form>
        </div>

        {/* Middle & Right: Balances & Expense List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Traveler Balances */}
          <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
              Settlement Balances
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(balances).map(([name, bal]) => {
                const isPositive = bal >= 0;
                return (
                  <div
                    key={name}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {name}
                    </span>
                    <span className={`text-xs font-extrabold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                      {isPositive ? `Gets back +${currencySymbol}${bal.toLocaleString()}` : `Owes -${currencySymbol}${Math.abs(bal).toLocaleString()}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expense History List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Expense History
            </h4>
            {expenses.map((exp, idx) => (
              <div
                key={exp.id ? `exp-${exp.id}-${idx}` : `exp-${idx}`}
                className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {exp.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {exp.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Paid by <strong>{exp.paidBy}</strong> • Split ({exp.splitAmong.join(', ')})
                  </span>
                </div>

                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {currencySymbol}{exp.amount.toLocaleString()}
                </span>
              </div>
            ))}

            {expenses.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                No expenses logged yet. Add your first shared cost above!
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
