import React from 'react';
import { Sparkles, Compass, MapPin, ExternalLink, Clock, Lightbulb } from 'lucide-react';
import { HiddenGem } from '../types';

interface HiddenGemsProps {
  hiddenGems: HiddenGem[];
  destination: string;
}

export const HiddenGems: React.FC<HiddenGemsProps> = ({ hiddenGems, destination }) => {
  return (
    <div className="p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Off-the-Beaten-Path Hidden Gems
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Local secrets and crowd-free spots in {destination}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {hiddenGems.map((gem, idx) => (
          <div
            key={gem.id ? `gem-${gem.id}-${idx}` : `gem-${idx}`}
            className="p-4 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {gem.title}
                </h4>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
                  {gem.category}
                </span>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${gem.lat || 0},${gem.lng || 0}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
              >
                Map
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
              {gem.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2.5 border-t border-slate-200/50 dark:border-slate-700/50">
              {gem.bestTimeToVisit && (
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span><strong>Best Time:</strong> {gem.bestTimeToVisit}</span>
                </div>
              )}
              {gem.localTip && (
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span><strong>Local Tip:</strong> {gem.localTip}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
