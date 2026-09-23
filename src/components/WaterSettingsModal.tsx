import React, { useState } from 'react';
import { X, Droplet, Clock, Volume2, Play, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SOUND_LABELS, SoundType, playSound } from '../utils/audio';

interface WaterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaterSettingsModal: React.FC<WaterSettingsModalProps> = ({ isOpen, onClose }) => {
  const { waterSettings, updateWaterSettings } = useApp();

  const [goal, setGoal] = useState<number>(waterSettings.dailyGoalMl);
  const [interval, setInterval] = useState<number>(waterSettings.reminderIntervalMinutes);
  const [startTime, setStartTime] = useState<string>(waterSettings.startTime);
  const [endTime, setEndTime] = useState<string>(waterSettings.endTime);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(waterSettings.reminderEnabled);
  const [sound, setSound] = useState<SoundType>(waterSettings.sound);
  const [presets, setPresets] = useState<number[]>(waterSettings.containerPresets);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWaterSettings({
      dailyGoalMl: goal,
      reminderIntervalMinutes: interval,
      startTime,
      endTime,
      reminderEnabled,
      sound,
      containerPresets: presets,
    });
    onClose();
  };

  const handlePresetChange = (index: number, val: number) => {
    const updated = [...presets];
    updated[index] = val;
    setPresets(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Hydration Schedule & Goals
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Daily Goal */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Daily Goal (ml)
              </label>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                {goal} ml ({Math.round(goal / 250)} glasses)
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="5000"
              step="100"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>1000 ml</span>
              <span>2500 ml (Standard)</span>
              <span>5000 ml</span>
            </div>
          </div>

          {/* Reminder Toggle */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-white">
                Recurring Water Reminders
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Receive prompts during your active daytime hours
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                reminderEnabled ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  reminderEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reminder Interval */}
          {reminderEnabled && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                Reminder Interval
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '30 min', val: 30 },
                  { label: '1 hour', val: 60 },
                  { label: '90 min', val: 90 },
                  { label: '2 hours', val: 120 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setInterval(item.val)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      interval === item.val
                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Schedule (Start & End Time) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Day Starts (First Sip)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Day Ends (Sleep Time)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
              Water Notification Chime
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['water_ripple', 'crystal_chime', 'zen_bell'] as SoundType[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSound(s);
                    playSound(s);
                  }}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                    sound === s
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="truncate">{SOUND_LABELS[s].name}</span>
                  <Play className="w-3 h-3 fill-current ml-1 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom Container Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Quick Log Button Sizes (ml)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((val, idx) => (
                <input
                  key={idx}
                  type="number"
                  min="50"
                  max="1500"
                  step="50"
                  value={val}
                  onChange={(e) => handlePresetChange(idx, Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-center text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
