import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Calendar, DollarSign, Users, Heart, ArrowRight, Loader2, Plane, Compass, Hotel, CheckCircle2, Coins, WifiOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Trip } from '../types';
import { CURRENCY_OPTIONS, getDefaultCurrency, saveDefaultCurrency, getCurrencySymbol } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface TripPlannerWizardProps {
  onTripGenerated: (trip: Trip) => void;
  prefilledDestination?: string;
}

const POPULAR_DESTINATIONS = [
  'Tokyo, Japan',
  'Paris, France',
  'Rome, Italy',
  'Bali, Indonesia',
  'New York, USA',
  'Dubai, UAE',
  'Barcelona, Spain',
  'Santorini, Greece',
  'Kyoto, Japan',
  'Zurich, Switzerland'
];

const INTEREST_TAGS = [
  { id: 'sightseeing', label: 'Landmarks & Sightseeing' },
  { id: 'food', label: 'Food & Culinary' },
  { id: 'culture', label: 'Art, History & Museums' },
  { id: 'nature', label: 'Nature & Hiking' },
  { id: 'shopping', label: 'Shopping & Markets' },
  { id: 'nightlife', label: 'Nightlife & Bars' },
  { id: 'relaxation', label: 'Wellness & Relaxation' }
];

export const TripPlannerWizard: React.FC<TripPlannerWizardProps> = ({ onTripGenerated, prefilledDestination = '' }) => {
  const { language, t } = useLanguage();
  const [destination, setDestination] = useState(prefilledDestination);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durationDays, setDurationDays] = useState(3);
  const [budgetLevel, setBudgetLevel] = useState<'budget' | 'moderate' | 'luxury'>('moderate');
  const [estimatedBudgetAmount, setEstimatedBudgetAmount] = useState<string>('');
  const [travelerType, setTravelerType] = useState<'solo' | 'couple' | 'family' | 'friends'>('solo');
  const [travelersCount, setTravelersCount] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['sightseeing', 'food']);
  const [currency, setCurrency] = useState<string>(() => getDefaultCurrency());
  const [loading, setLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (prefilledDestination) {
      setDestination(prefilledDestination);
    }
  }, [prefilledDestination]);

  const loadingPhases = [
    { title: 'Connecting to Gemini AI Engine', desc: 'Analyzing destination climate & geographic data...' },
    { title: 'Mapping Route & Landmarks', desc: 'Sourcing latitude, longitude, and optimal sequence...' },
    { title: 'Curating Local Stays & Food', desc: 'Finding boutique hotels, authentic dining, and hidden gems...' },
    { title: 'Structuring Budget Breakdown', desc: 'Calculating expense categories & packing suggestions...' },
    { title: 'Finalizing Interactive Itinerary', desc: 'Building responsive map view and exportable PDF...' }
  ];

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    if (!isOnline) {
      setErrorMessage('You are currently offline. Trip generation requires an active internet connection to reach Gemini AI. All your previously generated itineraries and packing lists are saved and ready to browse on your Dashboard.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setActiveStepIndex(0);

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < loadingPhases.length - 1 ? prev + 1 : prev));
    }, 1100);

    try {
      const response = await fetch('/api/generate-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          durationDays,
          budgetLevel,
          estimatedBudget: estimatedBudgetAmount ? Number(estimatedBudgetAmount) : undefined,
          travelerType,
          travelersCount,
          interests: selectedInterests,
          currency,
          language
        })
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error('Failed to generate trip');
      }

      const data = await response.json();

      const createdTrip: Trip = {
        id: `trip-${Date.now()}`,
        userId: 'current-user',
        destination: data.destination || destination,
        country: data.country || 'World',
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date(Date.now() + durationDays * 86400000).toISOString().split('T')[0],
        durationDays: data.itinerary?.length || durationDays,
        budgetLevel,
        totalBudget: estimatedBudgetAmount ? Number(estimatedBudgetAmount) : (data.totalBudgetEstimate || (currency === 'INR' ? 50000 : 1500)),
        currency: currency || 'INR',
        travelerType,
        travelersCount,
        travelerNames: travelerType === 'solo' ? ['Me'] : ['Me', 'Partner/Friend'],
        interests: selectedInterests,
        coverImageUrl: data.coverImageUrl,
        summary: data.summary,
        itinerary: data.itinerary || [],
        packingList: data.packingList ? data.packingList.map((p: any, i: number) => ({ id: `p-${i}`, ...p, packed: false })) : [],
        expenses: [],
        foodRecommendations: data.foodRecommendations ? data.foodRecommendations.map((f: any, i: number) => ({ id: `f-${i}`, ...f })) : [],
        hotelRecommendations: data.hotelRecommendations ? data.hotelRecommendations.map((h: any, i: number) => ({ id: `h-${i}`, ...h })) : [],
        budgetBreakdown: data.budgetBreakdown,
        emergencyContacts: data.emergencyContacts || [],
        hiddenGems: data.hiddenGems ? data.hiddenGems.map((g: any, i: number) => ({ id: `g-${i}`, ...g })) : [],
        weatherForecast: data.weatherForecast || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Confetti fallback
      }

      onTripGenerated(createdTrip);
    } catch (err: any) {
      console.error('Error in trip generation:', err);
      setErrorMessage('A temporary connection issue occurred while planning your trip. Please click below to retry or check your connection.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/20 text-xs font-bold text-sky-600 dark:text-sky-400 mb-3">
          <Sparkles className="w-4 h-4 text-sky-500 animate-spin-slow" />
          <span>{t('plannerTitle')}</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('plannerTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl mx-auto">
          {t('plannerSubtitle')}
        </p>
      </div>

      {/* Friendly Error Banner if generation had an issue */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-800 dark:text-amber-200 text-sm">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleGenerate} className="space-y-6">
        
        {/* Destination & Quick Chips */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            1. {t('destinationLabel')}
          </label>
          <div className="relative">
            <MapPin className="w-5 h-5 absolute left-3.5 top-3.5 text-sky-500" />
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t('destinationPlaceholder')}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm shadow-xs"
            />
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-[11px] font-semibold text-slate-400 py-1">Popular:</span>
            {POPULAR_DESTINATIONS.slice(0, 6).map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => setDestination(dest)}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-medium border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                {dest}
              </button>
            ))}
          </div>
        </div>

        {/* Trip Duration & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Duration ({durationDays} Days)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 mt-2"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
              <span>1 Day</span>
              <span>5 Days</span>
              <span>10 Days</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Currency & Target Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Currency Dropdown + Budget Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              {t('currencyAndBudget')}
            </label>
            <div className="flex items-center gap-2">
              {/* Currency Selector Dropdown */}
              <div className="relative shrink-0 w-36 sm:w-44">
                <select
                  value={currency}
                  onChange={(e) => {
                    const newCode = e.target.value;
                    setCurrency(newCode);
                    saveDefaultCurrency(newCode);
                  }}
                  className="w-full pl-3 pr-8 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs cursor-pointer appearance-none"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {c.label}
                    </option>
                  ))}
                </select>
                <Coins className="w-3.5 h-3.5 text-sky-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Target Budget Input */}
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-sky-600 dark:text-sky-400">
                  {getCurrencySymbol(currency)}
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={estimatedBudgetAmount}
                  onChange={(e) => setEstimatedBudgetAmount(e.target.value)}
                  placeholder="Total budget (optional)"
                  className="w-full pl-7 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              Selected currency applies across all budget charts, hotel rates, and expense splits.
            </p>
          </div>

          {/* Budget Tier */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              {t('budgetTier')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['budget', 'moderate', 'luxury'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudgetLevel(b)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                    budgetLevel === b
                      ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100'
                  }`}
                >
                  {b === 'budget' ? `${getCurrencySymbol(currency)} ${t('budgetLabel')}` : b === 'moderate' ? `${getCurrencySymbol(currency)}${getCurrencySymbol(currency)} ${t('moderateLabel')}` : `${getCurrencySymbol(currency)}${getCurrencySymbol(currency)}${getCurrencySymbol(currency)} ${t('luxuryLabel')}`}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Traveler Group */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            {t('travelerGroup')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['solo', 'couple', 'family', 'friends'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTravelerType(type)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold capitalize transition-all border text-center ${
                  travelerType === type
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100'
                }`}
              >
                {t(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            {t('interestsLabel')}
          </label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_TAGS.map((tag) => {
              const isSelected = selectedInterests.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleInterest(tag.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 space-y-3">
          {!isOnline && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-200 text-xs">
              <WifiOff className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>Offline:</strong> You cannot generate new itineraries while offline. All your previously generated trips and packing lists remain accessible on the Dashboard.
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !destination.trim() || !isOnline}
            className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-600 hover:via-indigo-700 hover:to-purple-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('generatingTrip')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{t('generateTripBtn')}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Full-Screen Animated Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Spinning Compass / Plane Icon */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
              <div className="p-4 rounded-2xl bg-sky-500/10 text-sky-400">
                <Plane className="w-8 h-8 animate-bounce" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">
                Crafting Your Trip to {destination}
              </h3>
              <p className="text-xs text-slate-400">
                EasyTrip Gemini AI is customizing your ultimate itinerary...
              </p>
            </div>

            {/* Step List */}
            <div className="space-y-2 text-left pt-2">
              {loadingPhases.map((phase, idx) => {
                const isDone = idx < activeStepIndex;
                const isCurrent = idx === activeStepIndex;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all duration-300 flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-300 scale-102 shadow-md'
                        : isDone
                        ? 'bg-slate-800/40 border-slate-800/60 text-emerald-400 opacity-80'
                        : 'bg-slate-900/40 border-slate-800/40 text-slate-600 opacity-40'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{phase.title}</span>
                      <span className="text-[10px] text-slate-400">{phase.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
