import React from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      id="pwa-offline-banner"
      className="bg-amber-600 dark:bg-amber-700 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm font-medium transition-all"
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-200 shrink-0 animate-pulse" />
          <span>
            <strong>Offline Mode:</strong> No internet connection detected. You can still view all your saved itineraries, day-by-day plans, and packing lists!
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-amber-100 bg-amber-800/40 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
          <span>Service Worker Cache Active</span>
        </div>
      </div>
    </div>
  );
};
