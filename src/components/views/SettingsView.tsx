import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Laptop,
  Bell,
  Volume2,
  Vibrate,
  Watch,
  Cloud,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Shield,
  Smartphone,
  Play,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playSound, SOUND_LABELS, SoundType } from '../../utils/audio';
import { requestNotificationPermission, dispatchBrowserNotification } from '../../utils/notifications';
import { PWAInstallButton } from '../PWAInstallButton';

interface SettingsViewProps {
  onOpenWearablesModal: () => void;
  onOpenCloudSyncModal: () => void;
  onOpenWaterSettings: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenWearablesModal,
  onOpenCloudSyncModal,
  onOpenWaterSettings,
}) => {
  const {
    appSettings,
    updateAppSettings,
    waterSettings,
    wearables,
    cloudSync,
    exportDataJson,
    exportDataCsv,
  } = useApp();

  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const handleTestNotification = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      dispatchBrowserNotification('AquaMind Notification Test', {
        body: 'Time to drink water! Notifications are working perfectly.',
        icon: '/pwa-192x192.png',
      });
      playSound('crystal_chime', appSettings.volume);
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    }
  };

  const connectedWearablesCount = wearables.filter((w) => w.connected).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-droplet-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-cyan-500" />
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Appearance, alert tones, wearable devices, and cloud sync
        </p>
      </div>

      {/* 1. Appearance & Theme */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Theme & Display
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Select your preferred light or dark visual aesthetic
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'Auto (System)', icon: Laptop },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = appSettings.theme === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => updateAppSettings({ theme: mode.id as any })}
                className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Accent Color Customizer */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            App Accent Color
          </label>
          <div className="flex items-center gap-2.5">
            {[
              { id: 'cyan', color: '#06b6d4', name: 'Aqua Cyan' },
              { id: 'blue', color: '#0284c7', name: 'Ocean Blue' },
              { id: 'emerald', color: '#10b981', name: 'Fresh Mint' },
              { id: 'indigo', color: '#6366f1', name: 'Deep Indigo' },
              { id: 'coral', color: '#f43f5e', name: 'Coral Rose' },
            ].map((acc) => (
              <button
                key={acc.id}
                onClick={() => updateAppSettings({ accentColor: acc.id as any })}
                title={acc.name}
                className={`w-8 h-8 rounded-full transition-transform active:scale-90 ${
                  appSettings.accentColor === acc.id
                    ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: acc.color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Notifications & Sounds */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Notification & Sound Alerts
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Customize chime audio tones and browser notification permissions
        </p>

        <div className="space-y-4">
          {/* Notification Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  Push / Browser Notifications
                </h4>
                <p className="text-[11px] text-slate-500">
                  Allow AquaMind to pop reminder banners when due
                </p>
              </div>
            </div>

            <button
              onClick={() => updateAppSettings({ notificationsEnabled: !appSettings.notificationsEnabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                appSettings.notificationsEnabled ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  appSettings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  Audio Sound Effects
                </h4>
                <p className="text-[11px] text-slate-500">
                  Synthesized water splashes, crystal chimes, and goal fanfares
                </p>
              </div>
            </div>

            <button
              onClick={() => updateAppSettings({ soundEnabled: !appSettings.soundEnabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                appSettings.soundEnabled ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  appSettings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Volume Slider */}
          {appSettings.soundEnabled && (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Alert Volume</span>
                <span className="tabular-nums">{Math.round(appSettings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={appSettings.volume}
                onChange={(e) => updateAppSettings({ volume: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
            </div>
          )}

          {/* Test Sound & Notification Trigger */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleTestNotification}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Test Notification & Tone
            </button>

            {testNotificationSent && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Notification dispatched!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Integrations Bento: Wearables & Cloud Sync */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Wearables Hub Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Watch className="w-4 h-4" />
              Wearable Integrations
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Smart Health Trackers
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Connect Apple Health, Google Health Connect, Fitbit, Garmin, or Samsung Health to automate hydration logging.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {connectedWearablesCount} device{connectedWearablesCount === 1 ? '' : 's'} linked
            </span>
            <button
              onClick={onOpenWearablesModal}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all"
            >
              Manage Devices
            </button>
          </div>
        </div>

        {/* Cloud Sync & Backup Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Cloud className="w-4 h-4" />
              Data & Synchronization
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Multi-Device Cloud Backup
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Offline travel storage with sync passkey ({cloudSync.syncCode}). Export full JSON or CSV spreadsheets.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Synced
            </span>
            <button
              onClick={onOpenCloudSyncModal}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold transition-all"
            >
              Cloud & Exports
            </button>
          </div>
        </div>
      </div>

      {/* 4. App Info & PWA Status */}
      <div className="rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 text-xs text-slate-600 dark:text-slate-400 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">
              AquaMind Progressive Web App
            </h4>
            <p className="text-[11px] text-slate-500">
              Version 1.0.0 · Offline-Ready · Built for Desktop & Mobile
            </p>
          </div>
          <PWAInstallButton />
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
          <span>© 2026 AquaMind. Drink Water. Remember Everything.</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-medium">
            Privacy First — All data stored locally on your device
          </span>
        </div>
      </div>
    </div>
  );
};
