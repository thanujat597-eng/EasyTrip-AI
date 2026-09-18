import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  Compass, 
  Utensils, 
  Briefcase, 
  Receipt, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Clock, 
  ExternalLink,
  ChevronLeft,
  Navigation
} from 'lucide-react';
import { Trip, Activity, PackingItem, Expense } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { WeatherWidget } from './WeatherWidget';
import { PackingList } from './PackingList';
import { FoodGuide } from './FoodGuide';
import { HiddenGems } from './HiddenGems';
import { EmergencyContacts } from './EmergencyContacts';
import { ExpenseSplitter } from './ExpenseSplitter';
import { HotelGuide } from './HotelGuide';
import { BudgetChart } from './BudgetChart';
import { exportTripToPdf } from '../utils/pdfExport';
import { Hotel, PieChart } from 'lucide-react';
import { getCurrencySymbol } from '../utils/currency';

interface TripDetailViewProps {
  trip: Trip;
  onUpdateTrip: (updated: Trip) => void;
  onBackToDashboard: () => void;
}

export const TripDetailView: React.FC<TripDetailViewProps> = ({
  trip,
  onUpdateTrip,
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map' | 'hotels' | 'weather' | 'packing' | 'food' | 'gems' | 'budget' | 'emergency' | 'expenses'>('itinerary');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedPointId, setSelectedPointId] = useState<string | undefined>();

  // Toggle activity completion
  const handleToggleActivity = (dayNumber: number, activityId: string) => {
    const updatedItinerary = trip.itinerary.map((day) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          activities: day.activities.map((act) =>
            act.id === activityId ? { ...act, isCompleted: !act.isCompleted } : act
          ),
        };
      }
      return day;
    });

    onUpdateTrip({ ...trip, itinerary: updatedItinerary, updatedAt: new Date().toISOString() });
  };

  // Toggle packing item
  const handleTogglePacking = (id: string) => {
    const updatedPacking = trip.packingList.map((item) =>
      item.id === id ? { ...item, packed: !item.packed } : item
    );
    onUpdateTrip({ ...trip, packingList: updatedPacking, updatedAt: new Date().toISOString() });
  };

  // Add custom packing item
  const handleAddPacking = (item: Omit<PackingItem, 'id' | 'packed'>) => {
    const newItem: PackingItem = {
      ...item,
      id: `p-${Date.now()}`,
      packed: false,
    };
    onUpdateTrip({
      ...trip,
      packingList: [...trip.packingList, newItem],
      updatedAt: new Date().toISOString(),
    });
  };

  // Add expense
  const handleAddExpense = (exp: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...exp,
      id: `e-${Date.now()}`,
    };
    onUpdateTrip({
      ...trip,
      expenses: [...trip.expenses, newExpense],
      updatedAt: new Date().toISOString(),
    });
  };

  // Gather map points for InteractiveMap
  const mapPoints = [
    ...trip.itinerary.flatMap((day) =>
      day.activities.map((act) => ({
        id: act.id,
        title: act.title,
        category: 'activity' as const,
        lat: act.lat,
        lng: act.lng,
        description: act.description,
        locationName: act.locationName,
      }))
    ),
    ...trip.foodRecommendations.map((food) => ({
      id: food.id,
      title: food.name,
      category: 'food' as const,
      lat: food.lat,
      lng: food.lng,
      description: food.description,
      locationName: food.locationName,
    })),
    ...trip.hiddenGems.map((gem) => ({
      id: gem.id,
      title: gem.title,
      category: 'hidden-gem' as const,
      lat: gem.lat,
      lng: gem.lng,
      description: gem.description,
      locationName: gem.locationName,
    })),
  ];

  const mapCenter = mapPoints.length > 0 && mapPoints[0].lat
    ? { lat: mapPoints[0].lat, lng: mapPoints[0].lng }
    : { lat: 48.8566, lng: 2.3522 };

  const tabs = [
    { id: 'itinerary', label: 'Itinerary Schedule', icon: Calendar },
    { id: 'map', label: 'Interactive Map', icon: Navigation },
    { id: 'hotels', label: 'Hotel Stays', icon: Hotel },
    { id: 'weather', label: 'Weather Outlook', icon: Compass },
    { id: 'packing', label: 'Packing Checklist', icon: Briefcase },
    { id: 'food', label: 'Food Guide', icon: Utensils },
    { id: 'gems', label: 'Hidden Gems', icon: Sparkles },
    { id: 'budget', label: 'Budget Analytics', icon: PieChart },
    { id: 'emergency', label: 'Safety & Emergency', icon: ShieldAlert },
    { id: 'expenses', label: 'Expense Splitter', icon: Receipt },
  ];

  const activeDayData = trip.itinerary.find((d) => d.dayNumber === selectedDay) || trip.itinerary[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold" title="This itinerary schedule and packing list are saved locally and cached by the Service Worker">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Available Offline</span>
          </div>

          <button
            onClick={() => exportTripToPdf(trip)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF Itinerary</span>
          </button>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="relative h-64 sm:h-72 w-full rounded-3xl overflow-hidden shadow-xl bg-slate-900">
        <img
          src={trip.coverImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-sky-500/80 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              {trip.durationDays} Days Trip
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-500/80 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              {trip.budgetLevel} Budget
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/20">
              {trip.travelerType} traveler
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {trip.destination}, {trip.country}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl line-clamp-2 leading-relaxed">
            {trip.summary}
          </p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}

      {/* 1. ITINERARY SCHEDULE */}
      {activeTab === 'itinerary' && (
        <div className="space-y-4">
          
          {/* Day Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {trip.itinerary.map((day, dayIdx) => (
              <button
                key={`day-tab-${day.dayNumber || dayIdx}`}
                onClick={() => setSelectedDay(day.dayNumber)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedDay === day.dayNumber
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          {/* Active Day Content */}
          {activeDayData && (
            <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-5">
              
              <div className="border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Day {activeDayData.dayNumber} Overview
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeDayData.theme}
                </h3>
              </div>

              {/* Activities Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {activeDayData.activities.map((act, idx) => (
                  <div key={act.id ? `act-${activeDayData.dayNumber}-${act.id}-${idx}` : `act-${activeDayData.dayNumber}-${idx}`} className="relative group">
                    
                    {/* Timeline Circle */}
                    <button
                      onClick={() => handleToggleActivity(activeDayData.dayNumber, act.id)}
                      className="absolute -left-[30px] top-1 p-0.5 bg-white dark:bg-slate-900 rounded-full cursor-pointer"
                    >
                      {act.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>

                    {/* Activity Card */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      act.isCompleted
                        ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800 opacity-60'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:border-sky-400 dark:hover:border-sky-500'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/50">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {act.time}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                            {act.category}
                          </span>
                        </div>

                        {act.estimatedCost > 0 && (
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Est. {getCurrencySymbol(trip.currency)}{act.estimatedCost.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <h4 className={`font-bold text-sm mb-1 ${act.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {act.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                        {act.description}
                      </p>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                          <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span className="truncate">{act.locationName}</span>
                        </span>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${act.lat || 0},${act.lng || 0}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400 hover:underline shrink-0"
                        >
                          Google Maps
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. INTERACTIVE MAP VIEW */}
      {activeTab === 'map' && (
        <div className="space-y-3">
          <InteractiveMap
            center={mapCenter}
            zoom={12}
            points={mapPoints}
            selectedPointId={selectedPointId}
            onSelectPoint={(pt) => setSelectedPointId(pt.id)}
          />
        </div>
      )}

      {/* 2.5 HOTEL STAYS */}
      {activeTab === 'hotels' && (
        <HotelGuide
          hotels={trip.hotelRecommendations || []}
          destination={trip.destination}
          currency={trip.currency}
        />
      )}

      {/* 3. WEATHER FORECAST */}
      {activeTab === 'weather' && (
        <WeatherWidget
          forecast={trip.weatherForecast || []}
          destination={trip.destination}
        />
      )}

      {/* 4. PACKING CHECKLIST */}
      {activeTab === 'packing' && (
        <PackingList
          items={trip.packingList || []}
          onToggleItem={handleTogglePacking}
          onAddItem={handleAddPacking}
        />
      )}

      {/* 5. FOOD RECOMMENDATIONS */}
      {activeTab === 'food' && (
        <FoodGuide
          recommendations={trip.foodRecommendations || []}
          destination={trip.destination}
        />
      )}

      {/* 6. HIDDEN GEMS */}
      {activeTab === 'gems' && (
        <HiddenGems
          hiddenGems={trip.hiddenGems || []}
          destination={trip.destination}
        />
      )}

      {/* 6.5 BUDGET ANALYTICS */}
      {activeTab === 'budget' && (
        <BudgetChart trip={trip} />
      )}

      {/* 7. EMERGENCY CONTACTS */}
      {activeTab === 'emergency' && (
        <EmergencyContacts
          contacts={trip.emergencyContacts || []}
          destination={trip.destination}
        />
      )}

      {/* 8. EXPENSE SPLITTER */}
      {activeTab === 'expenses' && (
        <ExpenseSplitter
          expenses={trip.expenses || []}
          travelerNames={trip.travelerNames || ['Me']}
          currency={trip.currency || 'USD'}
          onAddExpense={handleAddExpense}
        />
      )}

    </div>
  );
};
