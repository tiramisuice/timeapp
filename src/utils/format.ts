export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  
  if (minutes > 0) {
    // If we have > 0 minutes, show minutes and maybe seconds if strictly needed, 
    // but plan says "1h 23m" or "45m" or "12s"
    // So if > 0 minutes, just show minutes? 
    // "45m"
    return `${minutes}m`;
  }
  
  return `${seconds}s`;
};

export const formatDurationDetailed = (ms: number): string => {
  // Option for HH:MM:SS if needed
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
