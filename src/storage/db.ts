import Dexie, { Table } from 'dexie';

export interface Activity {
  id: string;
  name: string;
  emoji: string;
  color: string;
  order: number;
}

export interface Session {
  id: string;
  activityId: string;
  startTime: number;
  endTime: number | null;
}

export class TimeBoardDatabase extends Dexie {
  activities!: Table<Activity, string>;
  sessions!: Table<Session, string>;

  constructor() {
    super('TimeBoardDB');
    this.version(1).stores({
      activities: 'id, order',
      sessions: 'id, activityId, startTime'
    });
  }
}

export const db = new TimeBoardDatabase();
