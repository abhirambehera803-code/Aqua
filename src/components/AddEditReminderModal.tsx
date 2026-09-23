import React, { useState, useEffect } from 'react';
import { X, Play, Clock, Calendar, Plus, Sparkles } from 'lucide-react';
import { Reminder, RepeatType, PriorityType } from '../types';
import { useApp } from '../context/AppContext';
import { playSound, SOUND_LABELS, SoundType } from '../utils/audio';

interface AddEditReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminderToEdit?: Reminder | null;
}

const EMOJI_OPTIONS = ['💧', '📚', '🏃‍♂️', '🌙', '🥗', '☕', '💼', '🌱', '💊', '🧘‍♀️', '🍎', '💻', '🚶‍♂️', '📝', '🎯'];
const COLOR_OPTIONS = ['#0ea5e9', '#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444', '#14b8a6', '#64748b'];

export const AddEditReminderModal: React.FC<AddEditReminderModalProps> = ({
  isOpen,
  onClose,
  reminderToEdit,
}) => {
  const { addReminder, updateReminder, categories, addCategory } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [repeat, setRepeat] = useState<RepeatType>('daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [sound, setSound] = useState<SoundType>('water_ripple');
  const [icon, setIcon] = useState('💧');
  const [color, setColor] = useState('#0ea5e9');
  const [categoryId, setCategoryId] = useState('water');
  const [priority, setPriority] = useState<PriorityType>('medium');

  // New Category inline toggle
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('✨');

  useEffect(() => {
    if (reminderToEdit) {
      setTitle(reminderToEdit.title);
      setDescription(reminderToEdit.description || '');
      setDate(reminderToEdit.date);
      setTime(reminderToEdit.time);
      setRepeat(reminderToEdit.repeat);
      setCustomDays(reminderToEdit.customDays || [1, 2, 3, 4, 5]);
      setSound(reminderToEdit.sound);
      setIcon(reminderToEdit.icon);
      setColor(reminderToEdit.color);
      setCategoryId(reminderToEdit.categoryId);
      setPriority(reminderToEdit.priority);
    } else {
      // Defaults for new reminder
      const todayStr = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setDate(todayStr);
      setTime('09:30');
      setRepeat('daily');
      setCustomDays([1, 2, 3, 4, 5]);
      setSound('water_ripple');
      setIcon('💧');
      setColor('#0ea5e9');
      setCategoryId('water');
      setPriority('medium');
    }
  }, [reminderToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (reminderToEdit) {
      updateReminder(reminderToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        time,
        repeat,
        customDays: repeat === 'custom' ? customDays : undefined,
        sound,
        icon,
        color,
        categoryId,
        priority,
      });
    } else {
      addReminder({
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        time,
        repeat,
        customDays: repeat === 'custom' ? customDays : undefined,
        sound,
        icon,
        color,
        categoryId,
        priority,
      });
    }
    onClose();
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const catId = 'cat-' + Date.now();
    addCategory({
      name: newCatName.trim(),
      icon: newCatIcon,
      color: color,
    });
    setCategoryId(catId);
    setNewCatName('');
    setIsCreatingCategory(false);
  };

  const toggleDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {reminderToEdit ? 'Edit Reminder' : 'Create New Reminder'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hydration, study, exercise, meds, or custom habits
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-cyan-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Drink 300ml Water, Afternoon Stretch, Study Session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Grab chilled bottle from the fridge & stand up"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                Time
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 tabular-nums"
              />
            </div>
          </div>

          {/* Repeat Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Repeat Schedule
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { id: 'once', label: 'Once' },
                { id: 'daily', label: 'Daily' },
                { id: 'weekdays', label: 'Weekdays' },
                { id: 'weekends', label: 'Weekends' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'custom', label: 'Custom' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRepeat(opt.id as RepeatType)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    repeat === opt.id
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom Day of week buttons */}
            {repeat === 'custom' && (
              <div className="mt-2 flex items-center justify-between gap-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                {dayNames.map((dName, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      customDays.includes(idx)
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {dName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                New Category
              </button>
            </div>

            {isCreatingCategory && (
              <div className="mb-2 p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Meditation)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-cyan-300 dark:border-cyan-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Emoji"
                  value={newCatIcon}
                  maxLength={2}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-12 px-1 text-center py-1 text-xs rounded-lg border border-cyan-300 dark:border-cyan-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-2.5 py-1 text-xs bg-cyan-600 text-white rounded-lg font-medium"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(cat.id);
                    setIcon(cat.icon);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
                    categoryId === cat.id
                      ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Tone Selector with Audio Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notification Tone (Web Audio)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(SOUND_LABELS) as SoundType[]).map((snd) => (
                <div
                  key={snd}
                  onClick={() => setSound(snd)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                    sound === snd
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs font-semibold truncate">{SOUND_LABELS[snd].name}</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSound(snd);
                      playSound(snd);
                    }}
                    className="p-1 rounded-lg bg-slate-200/80 dark:bg-slate-700 hover:bg-cyan-600 hover:text-white transition-colors"
                    title="Preview sound"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Icon & Color Customization */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Emoji Icon
              </label>
              <div className="flex items-center gap-1.5 flex-wrap max-h-20 overflow-y-auto p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-transform active:scale-95 ${
                      icon === em
                        ? 'bg-cyan-600 text-white scale-110 shadow-xs'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Theme Color
              </label>
              <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {COLOR_OPTIONS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColor(hex)}
                    style={{ backgroundColor: hex }}
                    className={`w-6 h-6 rounded-full transition-all active:scale-90 ${
                      color === hex
                        ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low', label: 'Low', color: 'text-slate-600' },
                { id: 'medium', label: 'Medium', color: 'text-amber-600' },
                { id: 'high', label: 'High', color: 'text-rose-600' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id as PriorityType)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    priority === p.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
            >
              {reminderToEdit ? 'Save Changes' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
