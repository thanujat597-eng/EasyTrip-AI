import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ExternalLink, Compass, Utensils, Sparkles, Navigation } from 'lucide-react';

interface MapPoint {
  id: string;
  title: string;
  category: 'activity' | 'food' | 'hidden-gem' | 'sightseeing';
  lat: number;
  lng: number;
  description?: string;
  locationName?: string;
}

interface InteractiveMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  points: MapPoint[];
  selectedPointId?: string;
  onSelectPoint?: (point: MapPoint) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center,
  zoom = 13,
  points,
  selectedPointId,
  onSelectPoint
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    }

    return () => {
      // Map instance preserved
    };
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => (m as L.Marker).remove());
    markersRef.current = {};

    const filteredPoints = filter === 'all' 
      ? points 
      : points.filter(p => p.category === filter);

    if (filteredPoints.length === 0) return;

    const bounds = L.latLngBounds([]);

    filteredPoints.forEach((pt) => {
      if (!pt.lat || !pt.lng) return;

      bounds.extend([pt.lat, pt.lng]);

      // Choose marker color
      let color = '#3b82f6'; // sky blue
      if (pt.category === 'food') color = '#f59e0b'; // amber
      if (pt.category === 'hidden-gem') color = '#10b981'; // emerald

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const popupHtml = `
        <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: ${color}; margin-bottom: 2px;">
            ${pt.category}
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 4px;">
            ${pt.title}
          </div>
          ${pt.locationName ? `<div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">📍 ${pt.locationName}</div>` : ''}
          ${pt.description ? `<div style="font-size: 11px; color: #334155; margin-bottom: 8px;">${pt.description}</div>` : ''}
          <a 
            href="https://www.google.com/maps/search/?api=1&query=${pt.lat},${pt.lng}" 
            target="_blank" 
            rel="noopener noreferrer"
            style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: bold; color: #2563eb; text-decoration: none;"
          >
            Open in Google Maps ↗
          </a>
        </div>
      `;

      const marker = L.marker([pt.lat, pt.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectPoint) onSelectPoint(pt);
      });

      markersRef.current[pt.id] = marker;
    });

    if (filteredPoints.length > 1 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, filter, onSelectPoint]);

  useEffect(() => {
    if (selectedPointId && markersRef.current[selectedPointId]) {
      const marker = markersRef.current[selectedPointId];
      marker.openPopup();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo(marker.getLatLng());
      }
    }
  }, [selectedPointId]);

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-lg">
      
      {/* Category Filter Controls Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-1.5 p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-md text-xs font-semibold">
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Pins ({points.length})
        </button>
        <button
          onClick={() => setFilter('activity')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
            filter === 'activity'
              ? 'bg-sky-500 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Activities
        </button>
        <button
          onClick={() => setFilter('food')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
            filter === 'food'
              ? 'bg-amber-500 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          Food
        </button>
        <button
          onClick={() => setFilter('hidden-gem')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
            filter === 'hidden-gem'
              ? 'bg-emerald-500 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Hidden Gems
        </button>
      </div>

      {/* External Map Badge */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Navigation className="w-3.5 h-3.5 text-sky-500" />
        Google Maps Full View
        <ExternalLink className="w-3 h-3" />
      </a>

      {/* Container Element for Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
