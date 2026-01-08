'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="text-gray-400 mb-4">Choose a page:</div>
      <Link 
        href="/track"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <span>⏱️</span> Track
      </Link>
      <Link 
        href="/stats"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <span>📊</span> Stats
      </Link>
    </div>
  );
}
