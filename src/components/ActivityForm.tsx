'use client';

import { useState } from 'react';
import { Activity } from '../storage/db';

interface ActivityFormProps {
  initialData?: Activity;
  onSubmit: (data: Omit<Activity, 'id' | 'order'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-gray-500', 
  'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-yellow-500', 
  'bg-red-500', 'bg-teal-500', 'bg-cyan-500', 'bg-lime-500'
];

const SUGGESTED_EMOJIS = ['👨‍💻', '📈', '🏋️', '🚗', '❤️', '😌', '🎮', '📱', '🍽', '🧹', '📚', '🏃', '💤', '🎓', '🎨', '🎵'];

export default function ActivityForm({ initialData, onSubmit, onCancel, onDelete }: ActivityFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [emoji, setEmoji] = useState(initialData?.emoji || '⏱️');
  const [color, setColor] = useState(initialData?.color || 'bg-blue-500');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, emoji, color });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom-10 fade-in">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? 'Edit Activity' : 'New Activity'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Emoji</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <input 
                type="text" 
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                className="w-12 h-12 text-center text-2xl border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {SUGGESTED_EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`flex-shrink-0 w-12 h-12 text-2xl rounded-lg border ${emoji === e ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-transparent'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Activity Name"
              autoFocus
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-gray-900' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {onDelete && (
              <button 
                type="button" 
                onClick={() => {
                  if(confirm('Delete this activity?')) onDelete();
                }}
                className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg"
              >
                Delete
              </button>
            )}
            <div className="flex-1"></div>
            <button 
              type="button" 
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
