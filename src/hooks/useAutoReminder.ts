'use client';

import { useEffect, useState, useRef } from 'react';
import { useTimeTrackerStore } from '../store/timeTrackerStore';

export function useAutoReminder() {
  const { activeSession, settings, activities } = useTimeTrackerStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const lastPromptTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!settings.autoReminder || !activeSession) {
      setShowPrompt(false);
      return;
    }

    const checkDuration = () => {
      const elapsed = Date.now() - activeSession.startTime;
      
      // If duration exceeded AND we haven't prompted recently (e.g. within last minute to be safe, 
      // or specifically since the threshold was crossed).
      // Logic: If elapsed > reminderDuration AND (elapsed - reminderDuration) > lastDismissedDuration? 
      // User requirement: "dismiss and remind again after the same duration".
      // This implies: prompt at 1x duration, 2x duration, etc. OR just "snooze".
      // Simplified: If prompt dismissed, set lastPromptTime to now. 
      // If (now - lastPromptTime) >= reminderDuration, prompt again.
      // Initial check: if (now - startTime) >= reminderDuration AND (now - lastPromptTime) >= reminderDuration.
      
      // Better logic for "Still doing X?":
      // If we haven't prompted for this session yet: check total duration.
      // If we have prompted: check duration since last prompt.
      
      const timeSinceLastPrompt = Date.now() - (lastPromptTimeRef.current || activeSession.startTime);
      
      if (timeSinceLastPrompt >= settings.reminderDuration && !showPrompt) {
        setShowPrompt(true);
      }
    };

    const interval = setInterval(checkDuration, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [activeSession, settings, showPrompt]);

  // Reset ref when session changes
  useEffect(() => {
    lastPromptTimeRef.current = 0;
    setShowPrompt(false);
  }, [activeSession?.id]);

  const handleYes = () => {
    lastPromptTimeRef.current = Date.now();
    setShowPrompt(false);
  };

  const activeActivityName = activities.find(a => a.id === activeSession?.activityId)?.name;

  return { showPrompt, activeActivityName, handleYes };
}
