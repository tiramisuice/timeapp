'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/track');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-400">Redirecting...</div>
    </div>
  );
}
