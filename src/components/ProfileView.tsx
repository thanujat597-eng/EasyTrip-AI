import React, { useState } from 'react';
import { UserProfile, Trip } from '../types';
import { User, Mail, Globe, Sun, Moon, LogOut, ShieldCheck, Heart, Compass } from 'lucide-react';
import { CURRENCY_OPTIONS, getDefaultCurrency, saveDefaultCurrency } from '../utils/currency';

interface ProfileViewProps {
  user: UserProfile | null;
  trips: Trip[];
  onSignOut: () => void;
  onOpenAuth: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  trips,
  onSignOut,
  onOpenAuth,
  isDarkMode,
  setIsDarkMode
}) => {
  const [currency, setCurrency] = useState(() => getDefaultCurrency());

  const handleCurrencyChange = (newCode: string) => {
    setCurrency(newCode);
    saveDefaultCurrency(newCode);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Profile Card */}
      <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-200/60 dark:border-slate-800">
          
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User Avatar'}
              className="w-20 h-20 rounded-full object-cover border-2 border-sky-500/50 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {user?.displayName || 'Traveler'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-sky-500" />
              {user?.email || 'Guest Explorer Mode'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/50">
                {user ? 'Firebase Auth Connected' : 'Guest Account'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                {trips.length} Saved Trips
              </span>
            </div>
          </div>

          {!user && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-opacity"
            >
              Sign In to Sync
            </button>
          )}
        </div>

        {/* Preferences Form */}
        <div className="pt-6 space-y-5">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Travel Preferences & Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Preferred Currency */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Preferred Currency
              </label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                App Theme
              </label>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-semibold flex items-center justify-between"
              >
                <span>Current: {isDarkMode ? 'Dark Glassmorphism' : 'Light Glassmorphism'}</span>
                {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-slate-700" />}
              </button>
            </div>

          </div>

          {user && (
            <div className="pt-4">
              <button
                onClick={onSignOut}
                className="w-full py-3 px-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl border border-red-200 dark:border-red-900/40 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
