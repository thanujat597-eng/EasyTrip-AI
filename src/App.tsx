import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, signOut, User } from './lib/firebase';
import { Trip, UserProfile } from './types';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { TripPlannerWizard } from './components/TripPlannerWizard';
import { TripDetailView } from './components/TripDetailView';
import { ProfileView } from './components/ProfileView';
import { AIChatDrawer } from './components/AIChatDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SAMPLE_TRIP } from './utils/dummyData';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('easytrip_theme') ?? localStorage.getItem('travelmate_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return true;
  });

  // Trips state
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('easytrip_trips') || localStorage.getItem('travelmate_trips');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [SAMPLE_TRIP];
      }
    }
    return [SAMPLE_TRIP];
  });

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(trips[0] || SAMPLE_TRIP);
  const [plannerPrefill, setPlannerPrefill] = useState<string>('');

  // Persist trips locally
  useEffect(() => {
    localStorage.setItem('easytrip_trips', JSON.stringify(trips));
  }, [trips]);

  // Handle dark mode class on root html & save to localStorage
  useEffect(() => {
    localStorage.setItem('easytrip_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: User | null) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Traveler',
          photoURL: fbUser.photoURL,
          homeCurrency: 'USD',
          theme: isDarkMode ? 'dark' : 'light',
          createdAt: new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [isDarkMode]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleTripGenerated = (newTrip: Trip) => {
    const updatedTrips = [newTrip, ...trips];
    setTrips(updatedTrips);
    setSelectedTrip(newTrip);
    setActiveTab('trip-details');
  };

  const handleUpdateTrip = (updatedTrip: Trip) => {
    const updatedList = trips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t));
    setTrips(updatedList);
    setSelectedTrip(updatedTrip);
  };

  const handleDeleteTrip = (tripId: string) => {
    const updatedList = trips.filter((t) => t.id !== tripId);
    setTrips(updatedList);
    if (selectedTrip?.id === tripId) {
      setSelectedTrip(updatedList[0] || null);
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Top Glassmorphic Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onToggleChat={() => setChatOpen(!chatOpen)}
        hasActiveTrip={Boolean(selectedTrip)}
      />

      {/* Offline Connectivity Notification Banner */}
      <OfflineIndicator />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            user={user}
            trips={trips}
            onSelectTrip={(t) => {
              setSelectedTrip(t);
              setActiveTab('trip-details');
            }}
            onNewTrip={(prefilled) => {
              setPlannerPrefill(prefilled || '');
              setActiveTab('planner');
            }}
            onDeleteTrip={handleDeleteTrip}
          />
        )}

        {activeTab === 'planner' && (
          <TripPlannerWizard
            onTripGenerated={handleTripGenerated}
            prefilledDestination={plannerPrefill}
          />
        )}

        {activeTab === 'trip-details' && selectedTrip && (
          <TripDetailView
            trip={selectedTrip}
            onUpdateTrip={handleUpdateTrip}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            trips={trips}
            onSignOut={handleSignOut}
            onOpenAuth={() => setAuthModalOpen(true)}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 EasyTrip AI • Powered by Gemini AI & Firebase</p>
        </div>
      </footer>

      {/* Modals & AI Chatbot */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />

      <AIChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        activeTrip={selectedTrip}
      />

      {/* Floating AI Travel Assistant Trigger Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center gap-2 group border border-white/20"
          title="Open EasyTrip AI Assistant"
        >
          <div className="relative">
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.35 5L2 22l5-1.35C8.47 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
            </svg>
          </div>
          <span className="text-xs font-black tracking-wide hidden sm:inline-block pr-1 group-hover:translate-x-0.5 transition-transform">
            AI Assistant
          </span>
        </button>
      )}
    </div>
  );
}
