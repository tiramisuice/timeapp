'use client';

import { useEffect, useState } from 'react';
import { formatDuration } from '../utils/format';

interface TimerDisplayProps {
  startTime: number;
}

export default function TimerDisplay({ startTime }: TimerDisplayProps) {
  const [elapsed, setElapsed] = useState(Date.now() - startTime);

  useEffect(() => {
    // Update immediately
    setElapsed(Math.max(0, Date.now() - startTime));

    const interval = setInterval(() => {
      setElapsed(Math.max(0, Date.now() - startTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <span className="font-mono text-sm font-medium animate-pulse">
      {formatDuration(elapsed)}
    </span>
  );
}
