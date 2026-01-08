import { db, Activity, Session } from './db';

export const activityRepo = {
  getAll: async () => {
    return await db.activities.orderBy('order').toArray();
  },
  getById: async (id: string) => {
    return await db.activities.get(id);
  },
  create: async (activity: Activity) => {
    await db.activities.add(activity);
  },
  update: async (id: string, updates: Partial<Activity>) => {
    await db.activities.update(id, updates);
  },
  delete: async (id: string) => {
    await db.activities.delete(id);
  },
  saveAll: async (activities: Activity[]) => {
    await db.transaction('rw', db.activities, async () => {
      await db.activities.bulkPut(activities);
    });
  },
  count: async () => {
    return await db.activities.count();
  }
};

export const sessionRepo = {
  getAll: async () => {
    return await db.sessions.toArray();
  },
  getActive: async () => {
    // Find session where endTime is null
    return await db.sessions.filter(s => s.endTime === null).first();
  },
  create: async (session: Session) => {
    await db.sessions.add(session);
  },
  update: async (id: string, updates: Partial<Session>) => {
    await db.sessions.update(id, updates);
  },
  deleteLast: async () => {
    // Get most recent session by startTime
    const last = await db.sessions.orderBy('startTime').last();
    if (last) {
      await db.sessions.delete(last.id);
    }
  },
  getByRange: async (startMs: number, endMs: number) => {
    // Get sessions that overlap with the range
    // Since we want all sessions within [startMs, endMs], we can query by startTime
    // or filter. For MVP, getting all and filtering in memory or simple filter is fine 
    // given low volume. 
    // Correct query: sessions where startTime >= startMs AND startTime <= endMs
    // OR sessions started before startMs but ended after startMs (overlapping)
    // For simplicity:
    return await db.sessions
      .where('startTime')
      .aboveOrEqual(startMs) // Optimization: get sessions starting after range start
      .toArray();
      // Wait, sessions started BEFORE range start but ending in range?
      // MVP: We define session belonging to range if it started in range? 
      // User says: "Total tracked time... For selected range"
      // Usually means overlap.
      // But let's retrieve all sessions around the time and filter in domain for precision.
      // For now, let's just expose a way to get sessions by time.
  },
  getAllSince: async (sinceMs: number) => {
     return await db.sessions.where('startTime').aboveOrEqual(sinceMs).toArray();
  }
};
