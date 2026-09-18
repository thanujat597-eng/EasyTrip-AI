import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Sparkles, 
  Calendar, 
  Plus, 
  DollarSign, 
  Briefcase, 
  ArrowRight, 
  Trash2, 
  FileText, 
  ChevronRight,
  TrendingUp,
  Globe,
  Search,
  Zap,
  Hotel
} from 'lucide-react';
import { Trip, UserProfile } from '../types';
import { exportTripToPdf } from '../utils/pdfExport';
import { getCurrencySymbol } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';

interface DashboardProps {
  user: UserProfile | null;
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onNewTrip: (prefilledDestination?: string) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  trips,
  onSelectTrip,
  onNewTrip,
  onDeleteTrip
}) => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const activeTrip = trips[0]; // latest trip

  const totalSpent = trips.reduce((acc, t) => {
    return acc + (t.expenses ? t.expenses.reduce((s, e) => s + e.amount, 0) : 0);
  }, 0);

  const totalPacked = trips.reduce((acc, t) => {
    return acc + (t.packingList ? t.packingList.filter((p) => p.packed).length : 0);
  }, 0);

  const popularDestinations = [
    { name: 'Tokyo, Japan', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80' },
    { name: 'Paris, France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80' },
    { name: 'New York, USA', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80' },
    { name: 'Bali, Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80' },
    { name: 'Santorini, Greece', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=400&q=80' },
    { name: 'Rome, Italy', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80' }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNewTrip(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Welcome Hero Search Banner */}
      <div className="relative p-6 sm:p-10 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 text-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Glow & Backdrop Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered Next-Gen Travel Planner</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {t('welcomeSubtitle')}
          </h1>

          <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto leading-relaxed">
            {t('plannerSubtitle')}
          </p>

          {/* Hero Search Box */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/40">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('destinationPlaceholder')}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{t('createTripBtn')}</span>
              </button>
            </div>
          </form>

          {/* Popular Shortcuts Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-semibold text-sky-200 mr-1">Popular:</span>
            {popularDestinations.map((dest) => (
              <button
                key={dest.name}
                onClick={() => onNewTrip(dest.name)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[11px] font-medium border border-white/20 transition-all hover:scale-105"
              >
                {dest.name}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white">
              {trips.length}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Trips Planned
            </span>
          </div>
        </div>

        <div className="p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white">
              ${totalSpent.toFixed(0)}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Expenses Logged
            </span>
          </div>
        </div>

        <div className="p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalPacked}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Items Packed
            </span>
          </div>
        </div>

        <div className="p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white">
              {trips.reduce((acc, t) => acc + (t.hiddenGems ? t.hiddenGems.length : 0), 0)}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Hidden Gems Saved
            </span>
          </div>
        </div>

      </div>

      {/* Trip Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-500" />
            Your Travel Itineraries
          </h2>

          <button
            onClick={onNewTrip}
            className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="p-12 text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Trips Planned Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              Use EasyTrip AI to generate your customized trip in seconds with maps, weather, and budget details.
            </p>
            <button
              onClick={onNewTrip}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-opacity"
            >
              Start AI Trip Planner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Cover Image Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                    <img
                      src={trip.coverImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                      alt={trip.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white border border-white/20">
                        {trip.durationDays} Days
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete trip to ${trip.destination}?`)) {
                            onDeleteTrip(trip.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-slate-900/60 backdrop-blur-md text-white/80 hover:text-red-400 hover:bg-slate-900/90 transition-colors"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Destination Title on Image */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-xl font-black tracking-tight drop-shadow-sm">
                        {trip.destination}
                      </h3>
                      <p className="text-xs text-sky-200 flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-sky-400" />
                        {trip.country || 'Destination'}
                      </p>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {trip.summary}
                    </p>

                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 capitalize">
                        💰 {getCurrencySymbol(trip.currency)}{trip.totalBudget ? trip.totalBudget.toLocaleString() : trip.budgetLevel}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 capitalize">
                        👥 {trip.travelerType}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                        📅 {trip.startDate || 'Upcoming'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => exportTripToPdf(trip)}
                    className="p-2 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title="Export PDF Itinerary"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectTrip(trip)}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <span>View Itinerary</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
