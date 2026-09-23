import React, { useState, useRef } from 'react';
import {
  X,
  Cloud,
  CloudUpload,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    cloudSync,
    triggerCloudSync,
    exportDataJson,
    exportDataCsv,
    importDataJson,
    resetAllData,
    offlineQueueCount,
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await triggerCloudSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cloudSync.syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Invalid backup JSON format.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Cloud Sync & Data Backup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cross-device synchronization & secure offline storage
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

        {importStatus && (
          <div className="mt-4 p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs font-semibold text-cyan-800 dark:text-cyan-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-500" />
            {importStatus}
          </div>
        )}

        {/* Cloud Sync Status Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-cyan-50/70 to-sky-50/30 dark:from-slate-800/80 dark:to-slate-800/40 border border-cyan-100 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
                Cross-Device Cloud Sync
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Your hydration entries, reminder schedules, and preferences are automatically preserved.
              </p>
            </div>

            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-cyan-100/80 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Last Synced:{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {cloudSync.lastSync
                  ? new Date(cloudSync.lastSync).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : 'Just now'}
              </strong>
            </span>

            {offlineQueueCount > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {offlineQueueCount} offline logs queued for sync
              </span>
            )}
          </div>
        </div>

        {/* Sync Passkey for Multi-Device Linking */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-500" />
              Device Sync Passkey
            </span>
            <button
              onClick={handleCopyCode}
              className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1 hover:underline"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-base font-mono font-bold tracking-wider text-slate-800 dark:text-slate-100">
              {cloudSync.syncCode}
            </span>
            <span className="text-[11px] text-slate-400">
              Use this key to sync phone & laptop
            </span>
          </div>
        </div>

        {/* Export & Backup */}
        <div className="mt-5 space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Data Portability & File Backup
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportDataJson}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-500" />
              Export JSON Backup
            </button>

            <button
              onClick={exportDataCsv}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              Export CSV Spreadsheet
            </button>
          </div>

          <div className="pt-1">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Upload className="w-4 h-4 text-cyan-500" />
              Restore Data from JSON Backup
            </button>
          </div>
        </div>

        {/* Danger Zone: Reset Data */}
        <div className="mt-6 pt-4 border-t border-rose-100 dark:border-rose-950/40">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Reset All Reminders & Water Progress
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-2">
              <p className="text-xs text-rose-800 dark:text-rose-300 font-semibold">
                Are you sure? This erases all reminders, hydration logs, and settings.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetAllData();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
