import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NotificationToastsContainer } from './components/NotificationToast';
import { AddEditReminderModal } from './components/AddEditReminderModal';
import { WaterSettingsModal } from './components/WaterSettingsModal';
import { WearablesModal } from './components/WearablesModal';
import { CloudSyncModal } from './components/CloudSyncModal';

import { DashboardView } from './components/views/DashboardView';
import { RemindersView } from './components/views/RemindersView';
import { WaterView } from './components/views/WaterView';
import { StatisticsView } from './components/views/StatisticsView';
import { SettingsView } from './components/views/SettingsView';
import { Reminder } from './types';

const MainAppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Modals state
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [reminderToEdit, setReminderToEdit] = useState<Reminder | null>(null);
  const [isWaterSettingsOpen, setIsWaterSettingsOpen] = useState(false);
  const [isWearablesOpen, setIsWearablesOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);

  const handleEditReminder = (reminder: Reminder) => {
    setReminderToEdit(reminder);
    setIsAddReminderOpen(true);
  };

  const handleOpenAddReminder = () => {
    setReminderToEdit(null);
    setIsAddReminderOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-cyan-500/20 selection:text-cyan-700 dark:selection:text-cyan-300">
      {/* Splash Screen (shows for 1.4s then smoothly transitions) */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Persistent Top Header (Compliant with Top Bar 3-Zone Contract) */}
      <TopHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={handleOpenAddReminder}
        onOpenWearablesModal={() => setIsWearablesOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {currentTab === 'dashboard' && (
          <DashboardView
            onOpenAddModal={handleOpenAddReminder}
            onOpenWaterSettings={() => setIsWaterSettingsOpen(true)}
            onOpenWearablesModal={() => setIsWearablesOpen(true)}
            onSelectTab={setCurrentTab}
            onEditReminder={handleEditReminder}
          />
        )}

        {currentTab === 'reminders' && (
          <RemindersView
            onOpenAddModal={handleOpenAddReminder}
            onEditReminder={handleEditReminder}
          />
        )}

        {currentTab === 'water' && (
          <WaterView
            onOpenWaterSettings={() => setIsWaterSettingsOpen(true)}
            onOpenWearablesModal={() => setIsWearablesOpen(true)}
          />
        )}

        {currentTab === 'statistics' && <StatisticsView />}

        {currentTab === 'settings' && (
          <SettingsView
            onOpenWearablesModal={() => setIsWearablesOpen(true)}
            onOpenCloudSyncModal={() => setIsCloudSyncOpen(true)}
            onOpenWaterSettings={() => setIsWaterSettingsOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Offline Travel Status Banner */}
      <OfflineIndicator />

      {/* Floating Active Notification Alerts & Snooze Toasts */}
      <NotificationToastsContainer />

      {/* Modals */}
      <AddEditReminderModal
        isOpen={isAddReminderOpen}
        onClose={() => {
          setIsAddReminderOpen(false);
          setReminderToEdit(null);
        }}
        reminderToEdit={reminderToEdit}
      />

      <WaterSettingsModal
        isOpen={isWaterSettingsOpen}
        onClose={() => setIsWaterSettingsOpen(false)}
      />

      <WearablesModal
        isOpen={isWearablesOpen}
        onClose={() => setIsWearablesOpen(false)}
      />

      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
