'use client';

import { useAutoReminder } from '../hooks/useAutoReminder';
import { useTimeTrackerStore } from '../store/timeTrackerStore';

export default function ReminderPrompt() {
  const { showPrompt, activeActivityName, handleYes } = useAutoReminder();
  const { toggleEditMode } = useTimeTrackerStore(); // Using this to trigger focus to grid effectively

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95">
        <h3 className="text-lg font-bold text-center mb-2">Still doing {activeActivityName}?</h3>
        <p className="text-gray-500 text-center text-sm mb-6">
          Just checking in. Keep going or switch tasks?
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleYes}
            className="py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Yes
          </button>
          <button
            onClick={() => {
              handleYes(); // Dismiss prompt logic first
              // Then maybe highlight grid? 
              // For now just dismiss allows user to interact with grid immediately.
            }}
            className="py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Switch
          </button>
        </div>
      </div>
    </div>
  );
}
