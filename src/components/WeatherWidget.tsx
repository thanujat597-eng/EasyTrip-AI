import React from 'react';
import { Sun, Cloud, CloudSun, CloudRain, Wind, Snowflake, AlertCircle, Shirt } from 'lucide-react';
import { WeatherDay } from '../types';

interface WeatherWidgetProps {
  forecast: WeatherDay[];
  destination: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ forecast, destination }) => {
  const getWeatherIcon = (condition: string, iconName: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) return <Sun className="w-6 h-6 text-amber-500 animate-pulse-slow" />;
    if (cond.includes('rain') || cond.includes('shower')) return <CloudRain className="w-6 h-6 text-sky-500" />;
    if (cond.includes('snow')) return <Snowflake className="w-6 h-6 text-cyan-400" />;
    if (cond.includes('wind')) return <Wind className="w-6 h-6 text-slate-400" />;
    if (cond.includes('cloud')) return <CloudSun className="w-6 h-6 text-amber-400" />;
    return <Sun className="w-6 h-6 text-amber-500" />;
  };

  return (
    <div className="p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Weather Outlook & Tips
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {destination} multi-day climate guide
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {forecast.map((day, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {day.dayName} {day.date ? `(${day.date})` : ''}
                </span>
                {getWeatherIcon(day.condition, day.iconName)}
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {day.tempHighC}°C
                </span>
                <span className="text-xs font-medium text-slate-400">
                  / {day.tempLowC}°C
                </span>
              </div>

              <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mb-2">
                {day.condition}
              </p>
            </div>

            {day.advice && (
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                <Shirt className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>{day.advice}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
