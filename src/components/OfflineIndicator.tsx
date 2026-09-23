import React from 'react';
import { WifiOff, Plane } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useApp } from '../context/AppContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { offlineQueueCount } = useApp();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-500/95 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-white shadow-lg border border-amber-400/40">
      <div className="flex items-center gap-1.5">
        <WifiOff className="w-3.5 h-3.5" />
        <Plane className="w-3.5 h-3.5" />
      </div>
      <span>
        Travel Mode Active — Hydration & reminders save offline
        {offlineQueueCount > 0 ? ` (${offlineQueueCount} queued)` : ''}
      </span>
    </div>
  );
};
