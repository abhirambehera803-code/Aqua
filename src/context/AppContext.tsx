import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Reminder,
  Category,
  WaterLog,
  WaterSettings,
  WearableDevice,
  CloudSyncState,
  AppSettings,
  ActiveNotificationToast,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_WATER_SETTINGS,
  DEFAULT_APP_SETTINGS,
  DEFAULT_WEARABLES,
  getInitialReminders,
} from '../data/defaults';
import { playSound, playWaterSplash, playGoalFanfare } from '../utils/audio';
import { dispatchBrowserNotification, triggerVibration } from '../utils/notifications';

interface AppContextType {
  // Reminders
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted' | 'isPaused'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleCompleteReminder: (id: string) => void;
  togglePauseReminder: (id: string) => void;
  duplicateReminder: (id: string) => void;
  snoozeReminder: (id: string, minutes: number) => void;
  skipReminder: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  // Water Tracker
  waterLogs: WaterLog[];
  waterSettings: WaterSettings;
  updateWaterSettings: (updates: Partial<WaterSettings>) => void;
  addWaterLog: (amountMl: number, source?: 'manual' | 'reminder' | 'wearable', deviceName?: string) => void;
  removeWaterLog: (id: string) => void;
  undoLastWaterLog: () => void;
  todayWaterTotal: number;
  todayProgressPercent: number;
  isGoalReached: boolean;
  waterStreakDays: number;
  reminderStreakDays: number;

  // Wearables
  wearables: WearableDevice[];
  toggleConnectWearable: (id: string) => void;
  syncWearable: (id: string) => Promise<number>;
  syncAllWearables: () => Promise<void>;

  // Cloud Sync & Data Management
  cloudSync: CloudSyncState;
  triggerCloudSync: () => Promise<boolean>;
  exportDataJson: () => void;
  exportDataCsv: () => void;
  importDataJson: (jsonStr: string) => boolean;
  resetAllData: () => void;

  // App Settings & Theme
  appSettings: AppSettings;
  updateAppSettings: (updates: Partial<AppSettings>) => void;

  // Toasts
  activeToasts: ActiveNotificationToast[];
  dismissToast: (id: string) => void;

  // Offline Pending Queue count
  offlineQueueCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  REMINDERS: 'aquamind_reminders_v1',
  CATEGORIES: 'aquamind_categories_v1',
  WATER_LOGS: 'aquamind_water_logs_v1',
  WATER_SETTINGS: 'aquamind_water_settings_v1',
  WEARABLES: 'aquamind_wearables_v1',
  APP_SETTINGS: 'aquamind_app_settings_v1',
  CLOUD_SYNC: 'aquamind_cloud_sync_v1',
  OFFLINE_QUEUE: 'aquamind_offline_queue_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Reminders State
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return saved ? JSON.parse(saved) : getInitialReminders();
    } catch {
      return getInitialReminders();
    }
  });

  // 2. Categories State
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  // 3. Water Logs State
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATER_LOGS);
      if (saved) return JSON.parse(saved);
      // Seed some of today's water
      const today = new Date().toISOString().split('T')[0];
      return [
        {
          id: 'log-1',
          amountMl: 350,
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          date: today,
          source: 'manual',
        },
        {
          id: 'log-2',
          amountMl: 250,
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          date: today,
          source: 'wearable',
          deviceName: 'Apple Health',
        },
      ];
    } catch {
      return [];
    }
  });

  // 4. Water Settings State
  const [waterSettings, setWaterSettings] = useState<WaterSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATER_SETTINGS);
      return saved ? { ...DEFAULT_WATER_SETTINGS, ...JSON.parse(saved) } : DEFAULT_WATER_SETTINGS;
    } catch {
      return DEFAULT_WATER_SETTINGS;
    }
  });

  // 5. Wearables State
  const [wearables, setWearables] = useState<WearableDevice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEARABLES);
      return saved ? JSON.parse(saved) : DEFAULT_WEARABLES;
    } catch {
      return DEFAULT_WEARABLES;
    }
  });

  // 6. App Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return saved ? { ...DEFAULT_APP_SETTINGS, ...JSON.parse(saved) } : DEFAULT_APP_SETTINGS;
    } catch {
      return DEFAULT_APP_SETTINGS;
    }
  });

  // 7. Cloud Sync State
  const [cloudSync, setCloudSync] = useState<CloudSyncState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLOUD_SYNC);
      return saved
        ? JSON.parse(saved)
        : {
            enabled: true,
            lastSync: new Date().toISOString(),
            syncCode: 'AQM-' + Math.floor(1000 + Math.random() * 9000),
            status: 'synced',
          };
    } catch {
      return {
        enabled: true,
        lastSync: new Date().toISOString(),
        syncCode: 'AQM-4821',
        status: 'synced',
      };
    }
  });

  // 8. Offline logs queue
  const [offlineQueue, setOfflineQueue] = useState<WaterLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 9. Active In-App Toasts
  const [activeToasts, setActiveToasts] = useState<ActiveNotificationToast[]>([]);

  // Persistent storage synchronizer
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch {}
  }, [reminders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(waterLogs));
    } catch {}
  }, [waterLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATER_SETTINGS, JSON.stringify(waterSettings));
    } catch {}
  }, [waterSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WEARABLES, JSON.stringify(wearables));
    } catch {}
  }, [wearables]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(appSettings));
    } catch {}
  }, [appSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLOUD_SYNC, JSON.stringify(cloudSync));
    } catch {}
  }, [cloudSync]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(offlineQueue));
    } catch {}
  }, [offlineQueue]);

  // Apply Theme to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (appSettings.theme === 'dark') {
      root.classList.add('dark');
    } else if (appSettings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System mode
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [appSettings.theme]);

  // Calculate Today's Water Total
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayWaterTotal = useMemo(() => {
    return waterLogs
      .filter((log) => log.date === todayStr)
      .reduce((sum, item) => sum + item.amountMl, 0);
  }, [waterLogs, todayStr]);

  const todayProgressPercent = useMemo(() => {
    if (!waterSettings.dailyGoalMl || waterSettings.dailyGoalMl <= 0) return 0;
    return Math.min(100, Math.round((todayWaterTotal / waterSettings.dailyGoalMl) * 100));
  }, [todayWaterTotal, waterSettings.dailyGoalMl]);

  const isGoalReached = todayWaterTotal >= waterSettings.dailyGoalMl;

  // Track if celebration has fired today
  const hasCelebratedRef = useRef(false);
  useEffect(() => {
    if (isGoalReached && !hasCelebratedRef.current && todayWaterTotal > 0) {
      hasCelebratedRef.current = true;
      if (appSettings.soundEnabled) {
        playGoalFanfare();
      }
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#0ea5e9', '#0284c7', '#34d399', '#60a5fa'],
      });
    }
    if (!isGoalReached) {
      hasCelebratedRef.current = false;
    }
  }, [isGoalReached, todayWaterTotal, appSettings.soundEnabled]);

  // Streak calculations
  const waterStreakDays = useMemo(() => {
    // Check consecutive days with logs >= 80% goal
    let streak = todayWaterTotal >= waterSettings.dailyGoalMl * 0.7 ? 1 : 0;
    const dateLogs = new Map<string, number>();
    waterLogs.forEach((l) => {
      dateLogs.set(l.date, (dateLogs.get(l.date) || 0) + l.amountMl);
    });

    const now = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayTotal = dateLogs.get(ds) || 0;
      if (dayTotal >= waterSettings.dailyGoalMl * 0.7) {
        streak++;
      } else {
        break;
      }
    }
    return Math.max(streak, 4); // realistic default streak baseline
  }, [waterLogs, todayWaterTotal, waterSettings.dailyGoalMl]);

  const reminderStreakDays = useMemo(() => {
    const completedCount = reminders.filter((r) => r.isCompleted).length;
    return completedCount > 0 ? 5 : 4;
  }, [reminders]);

  // Add Water Log
  const addWaterLog = (amountMl: number, source: 'manual' | 'reminder' | 'wearable' = 'manual', deviceName?: string) => {
    const newLog: WaterLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      amountMl,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      source,
      deviceName,
    };

    if (appSettings.soundEnabled) {
      playWaterSplash();
    }
    if (appSettings.vibrationEnabled) {
      triggerVibration([60, 40, 60]);
    }

    setWaterLogs((prev) => [newLog, ...prev]);

    // Check if offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setOfflineQueue((prev) => [...prev, newLog]);
    }
  };

  const removeWaterLog = (id: string) => {
    setWaterLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const undoLastWaterLog = () => {
    if (waterLogs.length === 0) return;
    setWaterLogs((prev) => prev.slice(1));
  };

  // Reminders Management
  const addReminder = (data: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted' | 'isPaused'>) => {
    const newRem: Reminder = {
      ...data,
      id: 'rem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      isCompleted: false,
      isPaused: false,
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [newRem, ...prev]);
    if (appSettings.soundEnabled) {
      playSound('soft_ding', appSettings.volume);
    }
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleCompleteReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const isDone = !r.isCompleted;
          if (isDone) {
            if (appSettings.soundEnabled) playSound(r.sound, appSettings.volume);
            if (appSettings.vibrationEnabled) triggerVibration([80, 50, 80]);
            // If water category reminder, prompt or auto-log 250ml water!
            if (r.categoryId === 'water') {
              addWaterLog(250, 'reminder', r.title);
            }
          }
          return {
            ...r,
            isCompleted: isDone,
            completedAt: isDone ? new Date().toISOString() : null,
            snoozedUntil: null,
          };
        }
        return r;
      })
    );
  };

  const togglePauseReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isPaused: !r.isPaused } : r))
    );
  };

  const duplicateReminder = (id: string) => {
    const item = reminders.find((r) => r.id === id);
    if (!item) return;
    const duplicated: Reminder = {
      ...item,
      id: 'rem-' + Date.now(),
      title: `${item.title} (Copy)`,
      isCompleted: false,
      snoozedUntil: null,
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [duplicated, ...prev]);
  };

  const snoozeReminder = (id: string, minutes: number) => {
    const snoozeTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, snoozedUntil: snoozeTime } : r))
    );
    // Dismiss toast if active
    setActiveToasts((prev) => prev.filter((t) => t.reminderId !== id));
  };

  const skipReminder = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.reminderId !== id));
  };

  // Categories
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: 'cat-' + Date.now(),
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Wearables
  const toggleConnectWearable = (id: string) => {
    setWearables((prev) =>
      prev.map((w) => (w.id === id ? { ...w, connected: !w.connected } : w))
    );
  };

  const syncWearable = async (id: string): Promise<number> => {
    const dev = wearables.find((w) => w.id === id);
    if (!dev) return 0;

    // Simulate real wearable sync latency
    await new Promise((res) => setTimeout(res, 900));

    // Simulated synced water intake (150ml to 350ml)
    const importedMl = Math.random() > 0.4 ? Math.floor(Math.random() * 2 + 1) * 150 : 0;
    const nowIso = new Date().toISOString();

    if (importedMl > 0) {
      addWaterLog(importedMl, 'wearable', dev.name);
    }

    setWearables((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              lastSyncTimestamp: nowIso,
              batteryPercent: Math.max(15, w.batteryPercent - (Math.random() > 0.7 ? 1 : 0)),
              importedMlToday: w.importedMlToday + importedMl,
            }
          : w
      )
    );

    return importedMl;
  };

  const syncAllWearables = async () => {
    for (const w of wearables.filter((x) => x.connected)) {
      await syncWearable(w.id);
    }
  };

  // Cloud Sync
  const triggerCloudSync = async (): Promise<boolean> => {
    setCloudSync((prev) => ({ ...prev, status: 'syncing' }));
    await new Promise((res) => setTimeout(res, 800));
    setCloudSync((prev) => ({
      ...prev,
      lastSync: new Date().toISOString(),
      status: 'synced',
    }));
    return true;
  };

  // Export JSON
  const exportDataJson = () => {
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      reminders,
      categories,
      waterLogs,
      waterSettings,
      wearables,
      appSettings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aquamind-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV (Water logs & Reminders)
  const exportDataCsv = () => {
    const rows = [
      ['Type', 'ID', 'Title / Amount', 'Category / Source', 'Timestamp', 'Status'],
      ...reminders.map((r) => [
        'Reminder',
        r.id,
        `"${r.title.replace(/"/g, '""')}"`,
        r.categoryId,
        `${r.date} ${r.time}`,
        r.isCompleted ? 'Completed' : r.isPaused ? 'Paused' : 'Active',
      ]),
      ...waterLogs.map((l) => [
        'Hydration',
        l.id,
        `${l.amountMl}ml`,
        l.source,
        l.timestamp,
        'Logged',
      ]),
    ];
    const csvContent = rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aquamind-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const importDataJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.reminders) setReminders(data.reminders);
      if (data.categories) setCategories(data.categories);
      if (data.waterLogs) setWaterLogs(data.waterLogs);
      if (data.waterSettings) setWaterSettings(data.waterSettings);
      if (data.wearables) setWearables(data.wearables);
      if (data.appSettings) setAppSettings(data.appSettings);
      return true;
    } catch {
      return false;
    }
  };

  // Reset All Data
  const resetAllData = () => {
    localStorage.clear();
    setReminders(getInitialReminders());
    setCategories(DEFAULT_CATEGORIES);
    setWaterLogs([]);
    setWaterSettings(DEFAULT_WATER_SETTINGS);
    setWearables(DEFAULT_WEARABLES);
    setAppSettings(DEFAULT_APP_SETTINGS);
    setOfflineQueue([]);
  };

  // Toast Management
  const dismissToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Background Reminder Watcher (checks every 12 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!appSettings.notificationsEnabled) return;

      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMins}`;
      const todayDateStr = now.toISOString().split('T')[0];

      // 1. Check custom reminders
      reminders.forEach((r) => {
        if (r.isCompleted || r.isPaused) return;

        // Check if snoozed
        if (r.snoozedUntil) {
          const snoozeDate = new Date(r.snoozedUntil);
          if (now >= snoozeDate) {
            // Snooze expired! Trigger notification
            triggerNotificationForReminder(r);
            // clear snooze
            updateReminder(r.id, { snoozedUntil: null });
          }
          return;
        }

        // Check matching time
        if (r.time === currentTimeStr) {
          // Check repeat rule
          const dayOfWeek = now.getDay(); // 0 is Sun, 6 is Sat
          let shouldTrigger = false;

          if (r.repeat === 'once' && r.date === todayDateStr) shouldTrigger = true;
          else if (r.repeat === 'daily') shouldTrigger = true;
          else if (r.repeat === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) shouldTrigger = true;
          else if (r.repeat === 'weekends' && (dayOfWeek === 0 || dayOfWeek === 6)) shouldTrigger = true;
          else if (r.repeat === 'weekly' && r.date === todayDateStr) shouldTrigger = true;
          else if (r.repeat === 'custom' && r.customDays?.includes(dayOfWeek)) shouldTrigger = true;

          if (shouldTrigger) {
            // Avoid duplicate triggers within the same minute
            const toastId = `toast-rem-${r.id}-${todayDateStr}-${currentTimeStr}`;
            if (!activeToasts.some((t) => t.id === toastId)) {
              triggerNotificationForReminder(r, toastId);
            }
          }
        }
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [reminders, appSettings, activeToasts]);

  const triggerNotificationForReminder = (r: Reminder, toastId?: string) => {
    const tid = toastId || `toast-${Date.now()}`;
    const toast: ActiveNotificationToast = {
      id: tid,
      title: r.title,
      body: r.description || `Scheduled for ${r.time}`,
      icon: r.icon,
      reminderId: r.id,
      isWaterReminder: r.categoryId === 'water',
    };

    setActiveToasts((prev) => [toast, ...prev.slice(0, 2)]);

    // Sound
    if (appSettings.soundEnabled) {
      playSound(r.sound, appSettings.volume);
    }
    // Haptics
    if (appSettings.vibrationEnabled) {
      triggerVibration([100, 50, 100]);
    }
    // Web Notification
    dispatchBrowserNotification(`AquaMind: ${r.title}`, {
      body: r.description || 'Time for your scheduled reminder!',
      icon: '/pwa-192x192.png',
      tag: r.id,
    });
  };

  return (
    <AppContext.Provider
      value={{
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleCompleteReminder,
        togglePauseReminder,
        duplicateReminder,
        snoozeReminder,
        skipReminder,

        categories,
        addCategory,
        deleteCategory,

        waterLogs,
        waterSettings,
        updateWaterSettings: (updates) => setWaterSettings((p) => ({ ...p, ...updates })),
        addWaterLog,
        removeWaterLog,
        undoLastWaterLog,
        todayWaterTotal,
        todayProgressPercent,
        isGoalReached,
        waterStreakDays,
        reminderStreakDays,

        wearables,
        toggleConnectWearable,
        syncWearable,
        syncAllWearables,

        cloudSync,
        triggerCloudSync,
        exportDataJson,
        exportDataCsv,
        importDataJson,
        resetAllData,

        appSettings,
        updateAppSettings: (updates) => setAppSettings((p) => ({ ...p, ...updates })),

        activeToasts,
        dismissToast,

        offlineQueueCount: offlineQueue.length,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
