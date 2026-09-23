import React from 'react';
import { Droplet, Sun, Moon, Bell, Watch, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { requestNotificationPermission } from '../utils/notifications';

interface TopHeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenWearablesModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenWearablesModal,
}) => {
  const { appSettings, updateAppSettings, wearables } = useApp();

  const connectedWearablesCount = wearables.filter((w) => w.connected).length;

  const toggleTheme = () => {
    const nextTheme = appSettings.theme === 'dark' ? 'light' : 'dark';
    updateAppSettings({ theme: nextTheme });
  };

  const handleToggleNotifications = async () => {
    if (!appSettings.notificationsEnabled) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        updateAppSettings({ notificationsEnabled: true });
      }
    } else {
      updateAppSettings({ notificationsEnabled: false });
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Zone 1: Brand Wordmark (Single text element with icon) */}
      <button
        onClick={() => onSelectTab('dashboard')}
        className="flex items-center gap-2 group text-left focus:outline-none"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20 group-hover:scale-105 transition-transform">
          <Droplet className="w-4 h-4 fill-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Aqua<span className="text-cyan-600 dark:text-cyan-400">Mind</span>
        </span>
      </button>

      {/* Zone 2: Navigation Links (Desktop) */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
            currentTab === 'dashboard'
              ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
              : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('reminders')}
          className={`transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
            currentTab === 'reminders'
              ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
              : ''
          }`}
        >
          Reminders
        </button>
        <button
          onClick={() => onSelectTab('water')}
          className={`transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
            currentTab === 'water'
              ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
              : ''
          }`}
        >
          Water Tracker
        </button>
        <button
          onClick={() => onSelectTab('statistics')}
          className={`transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
            currentTab === 'statistics'
              ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
              : ''
          }`}
        >
          Statistics
        </button>
        <button
          onClick={() => onSelectTab('settings')}
          className={`transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
            currentTab === 'settings'
              ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
              : ''
          }`}
        >
          Settings
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Wearables Quick Indicator */}
        <button
          onClick={onOpenWearablesModal}
          className={`relative p-2 rounded-xl transition-colors ${
            connectedWearablesCount > 0
              ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
          title="Wearables & Smart Health Trackers"
        >
          <Watch className="w-4 h-4 sm:w-5 sm:h-5" />
          {connectedWearablesCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          )}
        </button>

        {/* Notifications Toggle */}
        <button
          onClick={handleToggleNotifications}
          className={`p-2 rounded-xl transition-colors ${
            appSettings.notificationsEnabled
              ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
          title={appSettings.notificationsEnabled ? 'Notifications Active' : 'Enable Notifications'}
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          title="Toggle Light / Dark Theme"
        >
          {appSettings.theme === 'dark' ? (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        {/* PWA Install */}
        <PWAInstallButton compact />

        {/* Primary Action: Add Reminder Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Reminder</span>
        </button>
      </div>
    </header>
  );
};
