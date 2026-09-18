import React, { useState } from 'react';
import { Briefcase, CheckCircle2, Circle, Plus, Sparkles, Shirt, Smartphone, FileText, HeartPulse, Sparkle } from 'lucide-react';
import { PackingItem } from '../types';

interface PackingListProps {
  items: PackingItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (item: Omit<PackingItem, 'id' | 'packed'>) => void;
}

export const PackingList: React.FC<PackingListProps> = ({ items, onToggleItem, onAddItem }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PackingItem['category']>('clothing');

  const packedCount = items.filter((i) => i.packed).length;
  const progressPercent = items.length > 0 ? Math.round((packedCount / items.length) * 100) : 0;

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'clothing', label: 'Clothing', icon: Shirt },
    { id: 'electronics', label: 'Tech & Electronics', icon: Smartphone },
    { id: 'documents', label: 'Documents & Passes', icon: FileText },
    { id: 'toiletries', label: 'Toiletries', icon: Briefcase },
    { id: 'medical', label: 'Medical & Health', icon: HeartPulse },
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem({
      name: newItemName.trim(),
      category: newItemCategory,
      isAiSuggested: false,
    });
    setNewItemName('');
  };

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  return (
    <div className="p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md">
      
      {/* Header & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Smart Packing Checklist
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {packedCount} of {items.length} items packed ({progressPercent}%)
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full sm:w-48 flex items-center gap-2">
          <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 min-w-[32px]">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAddSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add custom packing item..."
          className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value as PackingItem['category'])}
          className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="clothing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Clothing</option>
          <option value="electronics" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Electronics</option>
          <option value="documents" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Documents</option>
          <option value="toiletries" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Toiletries</option>
          <option value="medical" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Medical</option>
          <option value="other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Other</option>
        </select>
        <button
          type="submit"
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {/* Items List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id ? `pack-${item.id}-${idx}` : `pack-${idx}`}
            onClick={() => onToggleItem(item.id)}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
              item.packed
                ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800 opacity-60'
                : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {item.packed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
              )}
              <span className={`text-xs font-medium truncate ${item.packed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                {item.name}
              </span>
            </div>

            {item.isAiSuggested && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 shrink-0">
                <Sparkle className="w-2.5 h-2.5" />
                AI
              </span>
            )}
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            No items in this category yet.
          </div>
        )}
      </div>
    </div>
  );
};
