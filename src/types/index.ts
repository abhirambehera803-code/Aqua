import { SoundType } from '../utils/audio';

export type RepeatType = 'once' | 'daily' | 'weekly' | 'weekdays' | 'weekends' | 'custom';
export type PriorityType = 'low' | 'medium' | 'high';
export type AccentColor = 'cyan' | 'blue' | 'emerald' | 'indigo' | 'coral';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  repeat: RepeatType;
  customDays?: number[]; // 0 = Sun, 1 = Mon, etc.
  sound: SoundType;
  icon: string; // emoji or icon key
  color: string; // hex or tailwind token
  categoryId: string;
  priority: PriorityType;
  isCompleted: boolean;
  isPaused: boolean;
  snoozedUntil?: string | null; // ISO timestamp
  completedAt?: string | null; // ISO timestamp
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface WaterLog {
  id: string;
  amountMl: number;
  timestamp: string; // ISO
  date: string; // YYYY-MM-DD
  source: 'manual' | 'reminder' | 'wearable';
  deviceName?: string;
}

export interface WaterSettings {
  dailyGoalMl: number;
  containerPresets: number[]; // e.g. [150, 250, 500, 750]
  reminderEnabled: boolean;
  reminderIntervalMinutes: number; // 30, 60, 90, 120
  startTime: string; // "08:00"
  endTime: string; // "22:00"
  sound: SoundType;
  autoLogWearable: boolean;
}

export type WearableProvider = 'apple_health' | 'health_connect' | 'fitbit' | 'garmin' | 'whoop' | 'samsung';

export interface WearableDevice {
  id: string;
  name: string;
  provider: WearableProvider;
  connected: boolean;
  batteryPercent: number;
  lastSyncTimestamp?: string;
  autoSync: boolean;
  importedMlToday: number;
}

export interface CloudSyncState {
  enabled: boolean;
  lastSync?: string;
  syncCode: string;
  status: 'synced' | 'pending' | 'offline' | 'syncing';
}

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  accentColor: AccentColor;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  volume: number;
}

export interface ActiveNotificationToast {
  id: string;
  title: string;
  body: string;
  icon?: string;
  reminderId?: string;
  isWaterReminder?: boolean;
  amountMl?: number;
}
