'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTimeTrackerStore } from '../store/timeTrackerStore';

export default function BottomNav() {
  const pathname = usePathname();
  const { deleteLastSession } = useTimeTrackerStore();

  const handleUndo = () => {
    if (confirm('Delete last session?')) {
      deleteLastSession();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] pt-2 px-6 flex justify-around items-center min-h-[64px] z-50">
      <Link 
        href="/track"
        className={`flex flex-col items-center gap-1 ${pathname === '/track' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <span className="text-xl">⏱️</span>
        <span className="text-xs font-medium">Track</span>
      </Link>
      
      <button 
        onClick={handleUndo}
        className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
      >
        <span className="text-xl">↩️</span>
        <span className="text-xs font-medium">Undo</span>
      </button>
      
      <Link 
        href="/stats"
        className={`flex flex-col items-center gap-1 ${pathname === '/stats' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <span className="text-xl">📊</span>
        <span className="text-xs font-medium">Stats</span>
      </Link>
    </nav>
  );
}
