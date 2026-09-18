import React from 'react';
import { Utensils, MapPin, ExternalLink, DollarSign, Tag } from 'lucide-react';
import { FoodRecommendation } from '../types';

interface FoodGuideProps {
  recommendations: FoodRecommendation[];
  destination: string;
}

export const FoodGuide: React.FC<FoodGuideProps> = ({ recommendations, destination }) => {
  return (
    <div className="p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
          <Utensils className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Culinary & Food Recommendations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Must-try local dishes and top eateries in {destination}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {recommendations.map((food, idx) => (
          <div
            key={food.id ? `food-${food.id}-${idx}` : `food-${idx}`}
            className="p-4 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50 flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-500/50 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {food.name}
                </h4>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/50 shrink-0">
                  {food.priceRange}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
                <span>{food.cuisine}</span>
                <span>•</span>
                <span className="capitalize">{food.type}</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                {food.description}
              </p>
            </div>

            <div>
              {/* Dietary Tags */}
              {food.dietaryTags && food.dietaryTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {food.dietaryTags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Location & Map Link */}
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span className="truncate">{food.locationName}</span>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${food.lat || 0},${food.lng || 0}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:underline shrink-0 text-[11px]"
                >
                  Map View
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
