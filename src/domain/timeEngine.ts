import { sessionRepo, activityRepo } from '../storage/repos';
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

  clearTodaySessions: async () => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Delete all sessions starting today
    await sessionRepo.deleteSince(startOfDay.getTime());
    
    const active = await sessionRepo.getActive();
    if (active) {
      if (active.startTime < startOfDay.getTime()) {
         await sessionRepo.update(active.id, { endTime: startOfDay.getTime() });
         const stillActive = await sessionRepo.getActive();
         if (stillActive) {
            await sessionRepo.deleteLast();
         }
      }
    }
  },

  getElapsedMs: (session: Session): number => {
    const end = session.endTime || Date.now();
    return Math.max(0, end - session.startTime);
  },

  aggregateStats: async (range: { start: Date; end: Date }) => {
    const startMs = range.start.getTime();
    const endMs = range.end.getTime();
    
    // We get all sessions that started on or after the range start.
    const sessions = await sessionRepo.getAllSince(startMs);
    
    const totalsByActivity: Record<string, number> = {};
    const totalsByCategory: Record<string, number> = {};
    let totalTime = 0;

    // Need activities for category mapping
    const activitiesList = await activityRepo.getAll();
    const categoryMap = activitiesList.reduce((acc, a) => {
      acc[a.id] = a.category || 'Other';
      return acc;
    }, {} as Record<string, string>);

    for (const session of sessions) {
      // Calculate overlap duration
      const sStart = session.startTime;
      const sEnd = session.endTime || Date.now();
      
      const overlapStart = Math.max(sStart, startMs);
      const overlapEnd = Math.min(sEnd, endMs);
      
      if (overlapEnd > overlapStart) {
        const duration = overlapEnd - overlapStart;
        totalsByActivity[session.activityId] = (totalsByActivity[session.activityId] || 0) + duration;
        
        const cat = categoryMap[session.activityId] || 'Other';
        totalsByCategory[cat] = (totalsByCategory[cat] || 0) + duration;
        
        totalTime += duration;
      }
    }

    // Convert to array and sort
    const activities = Object.entries(totalsByActivity)
      .map(([activityId, duration]) => ({ activityId, duration }))
      .sort((a, b) => b.duration - a.duration);

    const categories = Object.entries(totalsByCategory)
      .map(([category, duration]) => ({ category, duration }))
      .sort((a, b) => b.duration - a.duration);

    return {
      totalTime,
      activities,
      categories,
      sessions: sessions.sort((a, b) => b.startTime - a.startTime)
    };
  },

  getTodayComparison: async () => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); // current time

    // Stats for today
    const todayStats = await timeEngine.aggregateStats({ start: todayStart, end: todayEnd });
    
    // Get top 3 activities by duration
    const topActivities = todayStats.activities.slice(0, 3);
    
    if (topActivities.length === 0) return null;

    // Calculate 7D avg for these
    // 7D range: (Today - 6 days) to Now. Actually "last 7 calendar days including today".
    // So Start = Today - 6 days (at 00:00). End = Now.
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    
    const sevenDayStats = await timeEngine.aggregateStats({ start: sevenDaysAgo, end: todayEnd });
    
    const comparisons = topActivities.map(item => {
      const sevenDayTotal = sevenDayStats.activities.find(a => a.activityId === item.activityId)?.duration || 0;
      // Average per day over 7 days
      // Should we count "days with activity" or just divide by 7? 
      // "7D avg" usually means total / 7.
      const dailyAvg = sevenDayTotal / 7;
      
      return {
        activityId: item.activityId,
        todayDuration: item.duration,
        avgDuration: dailyAvg,
        diff: item.duration - dailyAvg
      };
    });

    return comparisons;
  }
};
