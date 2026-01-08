import Dexie, { Table } from 'dexie';

export interface Activity {
  id: string;
  name: string;
  emoji: string;
  color: string;
  order: number;
  category?: string; // Feature D
}

export interface Session {
  id: string;
  activityId: string;
  startTime: number;
  endTime: number | null;
}

// Feature A
export interface Settings {
  id: string; // 'config'
  autoReminder: boolean;
  reminderDuration: number; // in ms
}

export class TimeBoardDatabase extends Dexie {
  activities!: Table<Activity, string>;
  sessions!: Table<Session, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('TimeBoardDB');
    this.version(1).stores({
      activities: 'id, order',
      sessions: 'id, activityId, startTime'
    });
    
    // Version 2: Add settings and category
    this.version(2).stores({
      activities: 'id, order, category',
      sessions: 'id, activityId, startTime',
      settings: 'id'
    });
  }
}

export const db = new TimeBoardDatabase();
