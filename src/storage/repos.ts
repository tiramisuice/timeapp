import { db, Activity, Session, Settings } from './db';

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
  deleteSince: async (sinceMs: number) => {
    const sessions = await db.sessions.where('startTime').aboveOrEqual(sinceMs).toArray();
    await db.sessions.bulkDelete(sessions.map(s => s.id));
  },
  getByRange: async (startMs: number, endMs: number) => {
    return await db.sessions
      .where('startTime')
      .aboveOrEqual(startMs) 
      .toArray();
  },
  getAllSince: async (sinceMs: number) => {
     return await db.sessions.where('startTime').aboveOrEqual(sinceMs).toArray();
  }
};

// Feature A
const DEFAULT_SETTINGS: Settings = {
  id: 'config',
  autoReminder: false,
  reminderDuration: 60 * 60 * 1000 // 1 hour default
};

export const settingsRepo = {
  get: async () => {
    const settings = await db.settings.get('config');
    return settings || DEFAULT_SETTINGS;
  },
  save: async (settings: Partial<Settings>) => {
    const current = await settingsRepo.get();
    await db.settings.put({ ...current, ...settings, id: 'config' });
  }
};
