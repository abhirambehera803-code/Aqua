import React, { useState } from 'react';
import { Droplet, Plus, RotateCcw, Settings2, Sparkles, Flame, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface WaterTrackerProps {
  onOpenWaterSettings: () => void;
  compact?: boolean;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({ onOpenWaterSettings, compact = false }) => {
  const {
    todayWaterTotal,
    todayProgressPercent,
    waterSettings,
    addWaterLog,
    undoLastWaterLog,
    waterStreakDays,
    isGoalReached,
  } = useApp();

  const [customAmount, setCustomAmount] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [splashActive, setSplashActive] = useState(false);

  const handleQuickAdd = (amount: number) => {
    // Trigger droplet falling effect
    setSplashActive(true);
    addWaterLog(amount, 'manual');
    setTimeout(() => setSplashActive(false), 800);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (!isNaN(val) && val > 0) {
      handleQuickAdd(val);
      setCustomAmount('');
      setShowCustomInput(false);
    }
  };

  // Water level height percentage clamp
  const fillPercentage = Math.min(100, Math.max(0, todayProgressPercent));

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-white to-sky-50/50 dark:from-slate-900 dark:to-slate-900/90 border border-sky-100 dark:border-slate-800 p-5 sm:p-7 shadow-sm transition-all overflow-hidden">
      {/* Background ambient water shimmer */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hydration Tracker
            </h2>
            {isGoalReached && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Goal Met!
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every sip powers focus & energy
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak count */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-xs font-semibold"
            title={`${waterStreakDays} consecutive days hitting target!`}
          >
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            <span>{waterStreakDays}d Streak</span>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenWaterSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Hydration & Interval Settings"
          >
            <Settings2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Centerpiece: Animated Tumbler / Wave Cylinder */}
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 my-4">
        {/* Tumbler Container */}
        <div className="relative w-40 h-56 sm:w-44 sm:h-60 rounded-3xl bg-slate-100 dark:bg-slate-800/80 p-2 border-2 border-sky-200/60 dark:border-sky-800/40 shadow-inner flex flex-col justify-end overflow-hidden group">
          {/* Glass Rim highlight */}
          <div className="absolute top-2 left-4 right-4 h-1 rounded-full bg-white/60 dark:bg-white/20 z-20" />

          {/* Droplet splash animation indicator when logged */}
          {splashActive && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-droplet-in">
              <div className="w-16 h-16 rounded-full bg-cyan-400/30 flex items-center justify-center">
                <Droplet className="w-10 h-10 text-cyan-500 fill-cyan-400 animate-bounce" />
              </div>
            </div>
          )}

          {/* Floating Rising Bubbles */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            <span className="absolute bottom-2 left-6 w-2.5 h-2.5 rounded-full bg-white/60 animate-bubble-1" />
            <span className="absolute bottom-4 right-8 w-2 h-2 rounded-full bg-white/50 animate-bubble-2" />
            <span className="absolute bottom-6 left-12 w-1.5 h-1.5 rounded-full bg-white/70 animate-bubble-3" />
            <span className="absolute bottom-3 right-5 w-3 h-3 rounded-full bg-white/40 animate-bubble-4" />
          </div>

          {/* Water Body with Animated Sine Waves */}
          <div
            className="relative w-full rounded-b-2xl bg-gradient-to-t from-cyan-600 via-sky-500 to-cyan-400 transition-all duration-700 ease-out"
            style={{ height: `${fillPercentage}%`, minHeight: fillPercentage > 0 ? '16px' : '0px' }}
          >
            {/* Wave layer 1 */}
            <div className="absolute -top-3 left-0 w-[200%] h-4 overflow-hidden pointer-events-none">
              <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="w-full h-full text-cyan-400 fill-current animate-wave-slow opacity-80"
              >
                <path d="M0,0 C150,90 350,-40 500,30 C650,90 900,-30 1200,20 L1200,120 L0,120 Z" />
              </svg>
            </div>

            {/* Wave layer 2 */}
            <div className="absolute -top-2 left-0 w-[200%] h-4 overflow-hidden pointer-events-none">
              <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="w-full h-full text-sky-300 fill-current animate-wave-medium opacity-60"
              >
                <path d="M0,20 C300,80 450,-20 700,50 C950,110 1100,0 1200,30 L1200,120 L0,120 Z" />
              </svg>
            </div>
          </div>

          {/* Digital Percentage overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm tabular-nums">
              {fillPercentage}%
            </span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              {todayWaterTotal} / {waterSettings.dailyGoalMl} ml
            </span>
          </div>
        </div>

        {/* Info & Metrics Breakdown */}
        <div className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-sky-50/70 dark:bg-slate-800/60 border border-sky-100/80 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Consumed</span>
              <div className="text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-400 tabular-nums mt-0.5">
                {todayWaterTotal} <span className="text-xs font-normal text-slate-500">ml</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50/70 dark:bg-slate-800/60 border border-sky-100/80 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Daily Target</span>
              <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
                {waterSettings.dailyGoalMl} <span className="text-xs font-normal text-slate-500">ml</span>
              </div>
            </div>
          </div>

          {/* Remaining amount message */}
          <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>
              {isGoalReached
                ? '🎉 Fantastic! You achieved today’s hydration goal!'
                : `${Math.max(0, waterSettings.dailyGoalMl - todayWaterTotal)} ml remaining to complete goal`}
            </span>
            {todayWaterTotal > 0 && (
              <button
                onClick={undoLastWaterLog}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
                title="Undo last logged drink"
              >
                <RotateCcw className="w-3 h-3" />
                Undo
              </button>
            )}
          </div>

          {/* Quick Log Presets */}
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Quick Log Intake:
            </div>
            <div className="grid grid-cols-4 gap-2">
              {waterSettings.containerPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleQuickAdd(preset)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-sky-100/80 hover:bg-sky-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-sky-900 dark:text-sky-200 font-semibold text-xs active:scale-95 transition-all shadow-xs"
                >
                  <Droplet className="w-3.5 h-3.5 text-cyan-500 mb-1 fill-cyan-400/50" />
                  <span>+{preset}ml</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Form Toggle */}
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add custom ml amount
            </button>
          ) : (
            <form onSubmit={handleAddCustom} className="flex items-center gap-2 mt-2">
              <input
                type="number"
                min="10"
                max="3000"
                step="10"
                placeholder="Amount (ml)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                autoFocus
                className="flex-1 px-3 py-1.5 rounded-xl border border-sky-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-500 active:scale-95 transition-all"
              >
                Log
              </button>
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
