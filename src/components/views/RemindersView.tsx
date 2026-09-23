import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Tag,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReminderCard } from '../ReminderCard';
import { Reminder } from '../../types';

interface RemindersViewProps {
  onOpenAddModal: () => void;
  onEditReminder: (reminder: Reminder) => void;
}

type TabFilter = 'all' | 'active' | 'paused' | 'completed';
type SortOption = 'time' | 'priority' | 'category';

export const RemindersView: React.FC<RemindersViewProps> = ({
  onOpenAddModal,
  onEditReminder,
}) => {
  const { reminders, categories } = useApp();

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('time');

  // Filtered & Sorted Reminders
  const filteredReminders = useMemo(() => {
    return reminders
      .filter((r) => {
        // Tab Filter
        if (activeTab === 'active' && (r.isCompleted || r.isPaused)) return false;
        if (activeTab === 'paused' && !r.isPaused) return false;
        if (activeTab === 'completed' && !r.isCompleted) return false;

        // Category Filter
        if (selectedCategory !== 'all' && r.categoryId !== selectedCategory) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchDesc = r.description?.toLowerCase().includes(q);
          const cat = categories.find((c) => c.id === r.categoryId);
          const matchCat = cat?.name.toLowerCase().includes(q);
          return matchTitle || matchDesc || matchCat;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'time') {
          return a.time.localeCompare(b.time);
        }
        if (sortBy === 'priority') {
          const priorityWeights = { high: 3, medium: 2, low: 1 };
          return priorityWeights[b.priority] - priorityWeights[a.priority];
        }
        if (sortBy === 'category') {
          return a.categoryId.localeCompare(b.categoryId);
        }
        return 0;
      });
  }, [reminders, activeTab, selectedCategory, searchQuery, sortBy, categories]);

  const counts = useMemo(() => {
    return {
      all: reminders.length,
      active: reminders.filter((r) => !r.isCompleted && !r.isPaused).length,
      paused: reminders.filter((r) => r.isPaused).length,
      completed: reminders.filter((r) => r.isCompleted).length,
    };
  }, [reminders]);

  return (
    <div className="space-y-6 animate-droplet-in">
      {/* Title & Primary Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your daily tasks, hydration intervals, focus blocks, and health habits
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Reminder
        </button>
      </div>

      {/* Search & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search reminders by title, note, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-xs"
          />
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-xs cursor-pointer"
          >
            <option value="time">Time (Earliest first)</option>
            <option value="priority">Priority (High to Low)</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Status Segmented Control (Interactive Filter Buttons per design guidelines) */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl max-w-fit overflow-x-auto">
        {[
          { id: 'all', label: 'All', count: counts.all },
          { id: 'active', label: 'Active', count: counts.active },
          { id: 'paused', label: 'Paused', count: counts.paused },
          { id: 'completed', label: 'Completed', count: counts.completed },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabFilter)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border ${
            selectedCategory === 'all'
              ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 border ${
              selectedCategory === cat.id
                ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Reminders Feed */}
      {filteredReminders.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <CheckSquare className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No reminders found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {searchQuery
              ? `No reminders match "${searchQuery}". Try clearing search filters.`
              : 'No reminders in this tab yet. Tap below to create your schedule.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs sm:text-sm font-semibold hover:bg-cyan-500 transition-colors"
          >
            Create New Reminder
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map((rem) => (
            <ReminderCard key={rem.id} reminder={rem} onEdit={onEditReminder} />
          ))}
        </div>
      )}
    </div>
  );
};
