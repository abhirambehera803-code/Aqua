import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Droplet,
  Flame,
  Sparkles,
  Watch,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WaterTracker } from '../WaterTracker';
import { ReminderCard } from '../ReminderCard';
import { Reminder } from '../../types';

interface DashboardViewProps {
  onOpenAddModal: () => void;
  onOpenWaterSettings: () => void;
  onOpenWearablesModal: () => void;
  onSelectTab: (tab: string) => void;
  onEditReminder: (reminder: Reminder) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddModal,
  onOpenWaterSettings,
  onOpenWearablesModal,
  onSelectTab,
  onEditReminder,
}) => {
  const {
    reminders,
    todayWaterTotal,
    waterSettings,
    todayProgressPercent,
    wearables,
    waterStreakDays,
  } = useApp();

  // Live Clock & Date
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Today's Date String
  const dateFormatted = useMemo(() => {
    return currentTime.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, [currentTime]);

  const timeFormatted = useMemo(() => {
    return currentTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [currentTime]);

  // Greeting
  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, [currentTime]);

  // Active connected wearables
  const connectedWearable = wearables.find((w) => w.connected);

  // Today's Reminders
  const todayDateStr = currentTime.toISOString().split('T')[0];
  const currentHours = String(currentTime.getHours()).padStart(2, '0');
  const currentMins = String(currentTime.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMins}`;

  // Filter today's reminders
  const todaysReminders = useMemo(() => {
    const dayOfWeek = currentTime.getDay();
    return reminders.filter((r) => {
      if (r.repeat === 'once') return r.date === todayDateStr;
      if (r.repeat === 'daily') return true;
      if (r.repeat === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
      if (r.repeat === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
      if (r.repeat === 'weekly') return r.date === todayDateStr;
      if (r.repeat === 'custom') return r.customDays?.includes(dayOfWeek);
      return true;
    });
  }, [reminders, todayDateStr, currentTime]);

  const completedToday = todaysReminders.filter((r) => r.isCompleted);
  const pendingToday = todaysReminders.filter((r) => !r.isCompleted && !r.isPaused);

  // Next upcoming reminder
  const nextReminder = useMemo(() => {
    const futurePending = pendingToday.filter((r) => r.time >= currentTimeStr);
    if (futurePending.length > 0) {
      return futurePending.sort((a, b) => a.time.localeCompare(b.time))[0];
    }
    // If no future pending today, show first pending or null
    return pendingToday[0] || null;
  }, [pendingToday, currentTimeStr]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-droplet-in">
      {/* Smart Dashboard Greeting & Live Clock Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-cyan-600 via-sky-600 to-sky-700 text-white p-6 sm:p-8 shadow-md overflow-hidden">
        {/* Decorative Wave Shapes */}
        <div className="absolute -right-8 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-12 w-48 h-48 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-200 text-xs sm:text-sm font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateFormatted}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono tabular-nums">{timeFormatted}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              {greeting}, Hydration Champion!
            </h1>

            <p className="text-xs sm:text-sm text-cyan-100/90 mt-1 max-w-xl">
              AquaMind keeps you energized with mindful hydration prompts and timely daily task reminders.
            </p>
          </div>

          {/* Quick Actions in Greeting */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-cyan-700 hover:bg-cyan-50 active:scale-95 text-xs sm:text-sm font-bold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Reminder
            </button>

            {connectedWearable && (
              <button
                onClick={onOpenWearablesModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-colors"
                title="Wearable active"
              >
                <Watch className="w-3.5 h-3.5" />
                <span>{connectedWearable.name}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Flagship Hydration Tracker Card */}
      <WaterTracker onOpenWaterSettings={onOpenWaterSettings} />

      {/* Smart Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Next Upcoming Reminder */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Next Upcoming
            </span>
            <Clock className="w-4 h-4 text-cyan-500" />
          </div>

          {nextReminder ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono tabular-nums">
                  {nextReminder.time}
                </span>
                <span className="text-xs text-slate-500">
                  {nextReminder.time >= currentTimeStr ? 'Today' : 'Overdue'}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1 truncate">
                {nextReminder.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {nextReminder.description || `Category: ${nextReminder.categoryId}`}
              </p>
            </div>
          ) : (
            <div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                All done for now!
              </div>
              <p className="text-xs text-slate-500 mt-1">
                No pending tasks for today. Tap Add Reminder to schedule new habits.
              </p>
            </div>
          )}
        </div>

        {/* Today's Completed Reminders */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Today's Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {completedToday.length}
            </span>
            <span className="text-xs text-slate-500">
              of {todaysReminders.length} scheduled
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="mt-3 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${
                  todaysReminders.length > 0
                    ? Math.round((completedToday.length / todaysReminders.length) * 100)
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {todaysReminders.length > 0
              ? `${Math.round((completedToday.length / todaysReminders.length) * 100)}% completion rate today`
              : 'Add reminders to start tracking'}
          </div>
        </div>

        {/* Pending Reminders & Streak */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Pending Tasks
            </span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {pendingToday.length}
            </span>
            <span className="text-xs text-slate-500">tasks awaiting action</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Consistency Streak:</span>
            <span className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-current" />
              {waterStreakDays} Days
            </span>
          </div>

          <button
            onClick={() => onSelectTab('reminders')}
            className="mt-3 text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
          >
            Manage all reminders
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Today's Schedule Feed */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Today's Schedule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {todaysReminders.length} items planned for today
            </p>
          </div>

          <button
            onClick={() => onSelectTab('reminders')}
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            View My Reminders
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todaysReminders.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No reminders scheduled for today
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Stay ahead of your routine! Add hydration checks, study blocks, exercise or medicine reminders.
            </p>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-500 transition-colors"
            >
              Add Your First Reminder
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysReminders.map((rem) => (
              <ReminderCard key={rem.id} reminder={rem} onEdit={onEditReminder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
