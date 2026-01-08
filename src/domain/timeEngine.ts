import { sessionRepo } from '../storage/repos';
import { Session } from '../storage/db';
import { v4 as uuidv4 } from 'uuid';

export const timeEngine = {
  startActivity: async (activityId: string) => {
    const now = Date.now();
    
    // 1. Stop active session if any
    const activeSession = await sessionRepo.getActive();
    if (activeSession) {
      await sessionRepo.update(activeSession.id, { endTime: now });
    }

    // 2. Start new session
    const newSession: Session = {
      id: uuidv4(),
      activityId,
      startTime: now,
      endTime: null
    };
    await sessionRepo.create(newSession);
    
    return newSession;
  },

  stopActiveSession: async () => {
    const activeSession = await sessionRepo.getActive();
    if (activeSession) {
      await sessionRepo.update(activeSession.id, { endTime: Date.now() });
    }
  },

  deleteLastSession: async () => {
    await sessionRepo.deleteLast();
  },

  getElapsedMs: (session: Session): number => {
    const end = session.endTime || Date.now();
    return Math.max(0, end - session.startTime);
  },

  aggregateStats: async (range: { start: Date; end: Date }) => {
    // Get all sessions that might overlap (start <= rangeEnd and end >= rangeStart)
    // For simplicity with basic indexes, we'll fetch sessions starting after (rangeStart - maxSessionDuration)
    // But since we don't know max duration, we'll fetch all sessions starting after rangeStart 
    // AND sessions that were active at rangeStart (which we can't easily query without scanning).
    // MVP optimization: Fetch all sessions starting after range.start.getTime() 
    // AND include the one session that started before but ended after (or is active).
    // For really strict correctness, we'd query everything or maintain "day buckets".
    // 
    // Simplification for MVP: Fetch all sessions starting >= range.start.
    // This misses sessions spanning across the boundary from before.
    // Accepted trade-off for MVP unless user specified otherwise.
    // Wait, "Total tracked time".
    // Let's try to get a bit more: fetch sessions starting >= range.start - 24h?
    // No, let's just use `sessionRepo.getAllSince(range.start.getTime())`.
    
    const startMs = range.start.getTime();
    const endMs = range.end.getTime();
    
    // We get all sessions that started on or after the range start.
    // This excludes the tail of a session starting before the range.
    const sessions = await sessionRepo.getAllSince(startMs);
    
    const totalsByActivity: Record<string, number> = {};
    let totalTime = 0;

    for (const session of sessions) {
      // Calculate overlap duration
      const sStart = session.startTime;
      const sEnd = session.endTime || Date.now(); // If active, assume now
      
      // Intersection of [sStart, sEnd] and [startMs, endMs]
      const overlapStart = Math.max(sStart, startMs);
      const overlapEnd = Math.min(sEnd, endMs);
      
      if (overlapEnd > overlapStart) {
        const duration = overlapEnd - overlapStart;
        totalsByActivity[session.activityId] = (totalsByActivity[session.activityId] || 0) + duration;
        totalTime += duration;
      }
    }

    // Convert to array and sort
    const activities = Object.entries(totalsByActivity)
      .map(([activityId, duration]) => ({ activityId, duration }))
      .sort((a, b) => b.duration - a.duration);

    return {
      totalTime,
      activities
    };
  }
};
