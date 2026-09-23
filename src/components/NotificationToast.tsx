import React from 'react';
import { Droplet, Check, Clock, X, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationToastsContainer: React.FC = () => {
  const { activeToasts, dismissToast, snoozeReminder, toggleCompleteReminder, addWaterLog } = useApp();

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none">
      {activeToasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto w-full rounded-2xl bg-white dark:bg-slate-900 border border-cyan-500/30 p-4 shadow-xl shadow-cyan-950/10 backdrop-blur-md animate-droplet-in"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-lg shrink-0">
              {toast.icon || <Bell className="w-5 h-5 text-cyan-500" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {toast.title}
                </h4>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                {toast.body}
              </p>

              {/* Actions row */}
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                {toast.isWaterReminder && (
                  <button
                    onClick={() => {
                      addWaterLog(250, 'reminder', toast.title);
                      if (toast.reminderId) toggleCompleteReminder(toast.reminderId);
                      dismissToast(toast.id);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
                  >
                    <Droplet className="w-3.5 h-3.5" />
                    Drank 250ml
                  </button>
                )}

                {toast.reminderId && (
                  <>
                    <button
                      onClick={() => {
                        toggleCompleteReminder(toast.reminderId!);
                        dismissToast(toast.id);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Completed
                    </button>

                    <button
                      onClick={() => snoozeReminder(toast.reminderId!, 10)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                    >
                      <Clock className="w-3 h-3" />
                      Snooze 10m
                    </button>
                  </>
                )}

                <button
                  onClick={() => dismissToast(toast.id)}
                  className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
