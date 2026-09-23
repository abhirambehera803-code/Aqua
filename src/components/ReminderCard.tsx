import React, { useState } from 'react';
import {
  Check,
  Clock,
  MoreVertical,
  Repeat,
  Pause,
  Play,
  Copy,
  Trash2,
  Edit2,
  Volume2,
} from 'lucide-react';
import { Reminder } from '../types';
import { useApp } from '../context/AppContext';
import { SOUND_LABELS } from '../utils/audio';

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onEdit }) => {
  const {
    toggleCompleteReminder,
    togglePauseReminder,
    duplicateReminder,
    deleteReminder,
    snoozeReminder,
    categories,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState(false);

  const category = categories.find((c) => c.id === reminder.categoryId) || {
    name: 'General',
    icon: '📌',
    color: '#0ea5e9',
  };

  const getRepeatLabel = (repeat: Reminder['repeat']) => {
    switch (repeat) {
      case 'daily':
        return 'Every day';
      case 'weekdays':
        return 'Mon – Fri';
      case 'weekends':
        return 'Sat & Sun';
      case 'weekly':
        return 'Weekly';
      case 'custom':
        return 'Custom';
      case 'once':
      default:
        return 'Once';
    }
  };

  return (
    <div
      className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 ${
        reminder.isCompleted
          ? 'border-emerald-200/80 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10'
          : reminder.isPaused
          ? 'border-slate-200 dark:border-slate-800 opacity-60'
          : 'border-slate-200/90 dark:border-slate-800/80 hover:border-cyan-300 dark:hover:border-cyan-800 shadow-xs'
      }`}
    >
      <div className="p-4 sm:p-5 flex items-start gap-3.5">
        {/* Checkmark Button */}
        <button
          onClick={() => toggleCompleteReminder(reminder.id)}
          className={`mt-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-90 ${
            reminder.isCompleted
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
              : 'border-2 border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 bg-transparent'
          }`}
          title={reminder.isCompleted ? 'Mark pending' : 'Mark completed'}
        >
          {reminder.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3
              className={`text-sm sm:text-base font-semibold truncate ${
                reminder.isCompleted
                  ? 'text-slate-400 dark:text-slate-500 line-through'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {reminder.title}
            </h3>
            {reminder.isPaused && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium shrink-0">
                (Paused)
              </span>
            )}
          </div>

          {reminder.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {reminder.description}
            </p>
          )}

          {/* Clean Unboxed Metadata with · separator (Zero-Pill Compliance) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
            {/* Category */}
            <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              <span>{reminder.icon || category.icon}</span>
              <span>{category.name}</span>
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>

            {/* Time */}
            <span className="inline-flex items-center gap-1 font-semibold text-cyan-600 dark:text-cyan-400 tabular-nums">
              <Clock className="w-3 h-3" />
              <span>{reminder.time}</span>
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>

            {/* Repeat */}
            <span className="inline-flex items-center gap-1">
              <Repeat className="w-3 h-3" />
              <span>{getRepeatLabel(reminder.repeat)}</span>
            </span>

            {/* Sound label */}
            <span aria-hidden="true" className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Volume2 className="w-2.5 h-2.5" />
              <span>{SOUND_LABELS[reminder.sound]?.name}</span>
            </span>

            {/* Snoozed Notice */}
            {reminder.snoozedUntil && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Snoozed until {new Date(reminder.snoozedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls & More Menu */}
        <div className="relative shrink-0 flex items-center gap-1">
          {/* Quick Snooze Button (if active & not completed) */}
          {!reminder.isCompleted && !reminder.isPaused && (
            <div className="relative">
              <button
                onClick={() => setSnoozeMenuOpen(!snoozeMenuOpen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Snooze reminder"
              >
                <Clock className="w-4 h-4" />
              </button>

              {snoozeMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-30 w-32 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-xs text-slate-700 dark:text-slate-200">
                  <button
                    onClick={() => {
                      snoozeReminder(reminder.id, 5);
                      setSnoozeMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    +5 minutes
                  </button>
                  <button
                    onClick={() => {
                      snoozeReminder(reminder.id, 15);
                      setSnoozeMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    +15 minutes
                  </button>
                  <button
                    onClick={() => {
                      snoozeReminder(reminder.id, 60);
                      setSnoozeMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    +1 hour
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Edit */}
          <button
            onClick={() => onEdit(reminder)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Reminder"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* More Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 w-36 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-xs text-slate-700 dark:text-slate-200">
                <button
                  onClick={() => {
                    togglePauseReminder(reminder.id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                >
                  {reminder.isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-500" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-500" />
                      Pause
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    duplicateReminder(reminder.id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-500" />
                  Duplicate
                </button>

                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                <button
                  onClick={() => {
                    deleteReminder(reminder.id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
