'use client';

import { useState } from 'react';
import { useTimeTrackerStore } from '../store/timeTrackerStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DURATION_OPTIONS = [
  { label: '30m', value: 30 * 60 * 1000 },
  { label: '1h', value: 60 * 60 * 1000 },
  { label: '2h', value: 2 * 60 * 60 * 1000 },
  { label: '3h', value: 3 * 60 * 60 * 1000 },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings, clearTodayData } = useTimeTrackerStore();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom-10 fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Clear Data */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Data Management</h3>
            <button
              onClick={() => {
                if (confirm('Are you sure? This will delete all tracked sessions for TODAY.')) {
                  clearTodayData();
                  onClose();
                }
              }}
              className="w-full py-3 px-4 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <span>🗑️</span> Clear Today&apos;s Data
            </button>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Auto Reminder */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Auto Reminder</h3>
              <button
                onClick={() => updateSettings({ autoReminder: !settings.autoReminder })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.autoReminder ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.autoReminder ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>

            <div className={`space-y-2 transition-opacity ${settings.autoReminder ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <p className="text-xs text-gray-500 mb-3">Remind me if active for:</p>
              <div className="grid grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => updateSettings({ reminderDuration: option.value })}
                    className={`py-2 text-sm font-medium rounded-lg border transition-all ${
                      settings.reminderDuration === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
