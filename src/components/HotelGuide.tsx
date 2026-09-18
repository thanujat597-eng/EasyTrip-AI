import React from 'react';
import { Building2, Star, MapPin, ExternalLink, ShieldCheck, Sparkles, Bed, Wifi, Coffee } from 'lucide-react';
import { HotelRecommendation } from '../types';
import { getCurrencySymbol } from '../utils/currency';

interface HotelGuideProps {
  hotels: HotelRecommendation[];
  destination: string;
  currency?: string;
}

export const HotelGuide: React.FC<HotelGuideProps> = ({
  hotels,
  destination,
  currency = 'INR'
}) => {
  if (!hotels || hotels.length === 0) {
    return (
      <div className="p-8 text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-3">
        <Building2 className="w-10 h-10 text-sky-500 mx-auto opacity-70" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No specific hotel recommendations found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          You can ask our AI Travel Assistant for top-rated hotels, boutique stays, or cozy hostels in {destination}!
        </p>
      </div>
    );
  }

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/50">
              Where to Stay
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Curated Accommodations
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Recommended Hotels & Stays in {destination}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Handpicked places offering great location, high comfort, and authentic local ambiance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hotels.map((hotel, idx) => (
          <div
            key={hotel.id ? `hotel-${hotel.id}-${idx}` : `hotel-${idx}`}
            className="group relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Image header */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-900">
              <img
                src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                alt={hotel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
                  {hotel.type || 'Hotel'}
                </span>
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-slate-950" />
                  {hotel.rating ? hotel.rating.toFixed(1) : '4.8'}
                </span>
              </div>

              <div className="absolute bottom-3 right-3 text-right">
                <span className="text-xs text-slate-300 font-medium block">Starting from</span>
                <span className="text-xl font-black text-white">
                  {currencySymbol}{hotel.pricePerNight || 180} <span className="text-xs font-semibold text-slate-300">/ night</span>
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                  {hotel.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>{hotel.locationName}</span>
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                  {hotel.description}
                </p>
              </div>

              {/* Highlights pills */}
              {hotel.highlights && hotel.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {hotel.highlights.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + destination)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>View on Map</span>
                </a>

                <a
                  href={`https://www.google.com/search?q=book+${encodeURIComponent(hotel.name + ' ' + destination)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
                >
                  <span>Book Room</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
