import React, { useState } from 'react';
import { X, Watch, RefreshCw, CheckCircle2, Battery, Zap, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface WearablesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WearablesModal: React.FC<WearablesModalProps> = ({ isOpen, onClose }) => {
  const { wearables, toggleConnectWearable, syncWearable, syncAllWearables } = useApp();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncAllLoading, setSyncAllLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncSingle = async (id: string, name: string) => {
    setSyncingId(id);
    setFeedbackMsg(null);
    try {
      const ml = await syncWearable(id);
      if (ml > 0) {
        setFeedbackMsg(`Synced with ${name}: Imported ${ml}ml hydration data!`);
      } else {
        setFeedbackMsg(`Synced with ${name}: Already up to date.`);
      }
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncAllLoading(true);
    setFeedbackMsg(null);
    try {
      await syncAllWearables();
      setFeedbackMsg('All connected wearable devices synchronized successfully.');
    } finally {
      setSyncAllLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Watch className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Wearable & Health Sync
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automate water logging and health reminder sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedbackMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex items-center gap-2 text-xs text-cyan-800 dark:text-cyan-300 animate-droplet-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Connected Devices
          </span>
          <button
            onClick={handleSyncAll}
            disabled={syncAllLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncAllLoading ? 'animate-spin' : ''}`} />
            Sync All Devices
          </button>
        </div>

        {/* Wearables List */}
        <div className="mt-3 space-y-3">
          {wearables.map((device) => {
            const isSyncing = syncingId === device.id;
            return (
              <div
                key={device.id}
                className={`p-4 rounded-2xl border transition-all ${
                  device.connected
                    ? 'border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/20 dark:bg-cyan-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        device.connected
                          ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Watch className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {device.name}
                        </h4>
                        {device.connected && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Connected
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Battery className="w-3 h-3 text-slate-400" />
                          {device.batteryPercent}%
                        </span>
                        {device.lastSyncTimestamp && (
                          <>
                            <span>·</span>
                            <span>
                              Synced{' '}
                              {new Date(device.lastSyncTimestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {device.connected && (
                      <button
                        onClick={() => handleSyncSingle(device.id, device.name)}
                        disabled={isSyncing}
                        className="p-2 rounded-xl text-slate-500 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        title="Sync now"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-500' : ''}`} />
                      </button>
                    )}

                    <button
                      onClick={() => toggleConnectWearable(device.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        device.connected
                          ? 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                      }`}
                    >
                      {device.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>

                {device.connected && device.importedMlToday > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-cyan-100/60 dark:border-cyan-900/40 flex items-center justify-between text-[11px] text-cyan-800 dark:text-cyan-300">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-cyan-500" />
                      Auto-imported today:
                    </span>
                    <span className="font-bold tabular-nums">+{device.importedMlToday} ml</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Explanatory note */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
          <span>
            Connected health devices automatically sync workout hydration, water intake detected by smart bottles, and sedentary break prompts. Works offline during outdoor exercise.
          </span>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-semibold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
