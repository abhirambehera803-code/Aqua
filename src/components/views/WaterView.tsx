import React, { useState } from 'react';
import {
  Droplet,
  Settings2,
  Clock,
  Trash2,
  Sparkles,
  Flame,
  Watch,
  Plus,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WaterTracker } from '../WaterTracker';

interface WaterViewProps {
  onOpenWaterSettings: () => void;
  onOpenWearablesModal: () => void;
}

export const WaterView: React.FC<WaterViewProps> = ({
  onOpenWaterSettings,
  onOpenWearablesModal,
}) => {
  const {
    waterLogs,
    removeWaterLog,
    todayWaterTotal,
    waterSettings,
    todayProgressPercent,
    wearables,
    waterStreakDays,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = waterLogs.filter((l) => l.date === todayStr);

  const connectedWearables = wearables.filter((w) => w.connected);

  // Group today's logs by hour for hourly breakdown
  const hourlyData = [
    { hour: '8 AM', range: [8, 10] },
    { hour: '11 AM', range: [11, 13] },
    { hour: '2 PM', range: [14, 16] },
    { hour: '5 PM', range: [17, 19] },
    { hour: '8 PM', range: [20, 22] },
  ].map((slot) => {
    const totalInSlot = todayLogs
      .filter((l) => {
        const h = new Date(l.timestamp).getHours();
        return h >= slot.range[0] && h <= slot.range[1];
      })
      .reduce((sum, item) => sum + item.amountMl, 0);
    return { ...slot, total: totalInSlot };
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-droplet-in">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Droplet className="w-7 h-7 text-cyan-500 fill-cyan-400" />
            Hydration Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time fluid tracking, customized intervals, and wearable sync
          </p>
        </div>

        <div className="flex items-center gap-2">
          {connectedWearables.length > 0 && (
            <button
              onClick={onOpenWearablesModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 text-xs font-semibold hover:bg-cyan-100 transition-colors"
            >
              <Watch className="w-3.5 h-3.5" />
              <span>{connectedWearables[0].name} Connected</span>
            </button>
          )}

          <button
            onClick={onOpenWaterSettings}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-all"
          >
            <Settings2 className="w-4 h-4" />
            Schedule & Goals
          </button>
        </div>
      </div>

      {/* Flagship Tracker */}
      <WaterTracker onOpenWaterSettings={onOpenWaterSettings} />

      {/* Hourly Intake Distribution */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Today's Hourly Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Spacing water consumption evenly keeps cognition and energy high
            </p>
          </div>
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono tabular-nums">
            {todayWaterTotal} ml today
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-4 pt-4">
          {hourlyData.map((slot) => {
            const barHeight = Math.min(100, Math.round((slot.total / 800) * 100));
            return (
              <div key={slot.hour} className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300 tabular-nums">
                  {slot.total > 0 ? `${slot.total}ml` : '—'}
                </span>
                <div className="w-full h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 flex flex-col justify-end">
                  <div
                    className="w-full rounded-xl bg-gradient-to-t from-cyan-600 to-sky-400 transition-all duration-500"
                    style={{ height: `${barHeight}%`, minHeight: slot.total > 0 ? '8px' : '0px' }}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {slot.hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hydration Insights & Science Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-50 to-cyan-50/40 dark:from-slate-800/80 dark:to-slate-800/40 border border-sky-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            Mindful Hydration Rule
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Drink Before You Feel Thirst
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            By the time thirst signals reach your brain, your body is already ~1.5% dehydrated, which can reduce reaction time and working memory. Keep small glasses frequent.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-sky-50/40 dark:from-slate-800/80 dark:to-slate-800/40 border border-indigo-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4" />
            Consistent Habit Streak
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {waterStreakDays} Consecutive Days Logged
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            Maintaining a regular drinking rhythm prevents evening head tension and improves deep REM sleep cycles.
          </p>
        </div>
      </div>

      {/* Drink History Log Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Today's Logged Sips & Glasses
          </h3>
          <span className="text-xs text-slate-500">
            {todayLogs.length} entries
          </span>
        </div>

        {todayLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No water logged yet today. Use the quick presets above to record your first glass!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {todayLogs.map((log) => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <div key={log.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                      <Droplet className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                        +{log.amountMl} ml
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {log.source === 'wearable' ? (
                          <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                            Synced from {log.deviceName || 'Wearable'}
                          </span>
                        ) : log.source === 'reminder' ? (
                          <span>Prompt: {log.deviceName || 'Scheduled alert'}</span>
                        ) : (
                          <span>Manual quick entry</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono tabular-nums">
                      {timeStr}
                    </span>
                    <button
                      onClick={() => removeWaterLog(log.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
