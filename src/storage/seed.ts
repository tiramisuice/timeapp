import { activityRepo } from './repos';
import { Activity } from './db';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_ACTIVITIES: Omit<Activity, 'id'>[] = [
  { name: 'Work/Code', emoji: '👨‍💻', color: 'bg-blue-500', order: 1 },
  { name: 'Investment', emoji: '📈', color: 'bg-green-500', order: 2 },
  { name: 'Workout', emoji: '🏋️', color: 'bg-orange-500', order: 3 },
  { name: 'Traffic', emoji: '🚗', color: 'bg-gray-500', order: 4 },
  { name: 'GF', emoji: '❤️', color: 'bg-pink-500', order: 5 },
  { name: 'Chilling', emoji: '😌', color: 'bg-purple-500', order: 6 },
  { name: 'Gaming', emoji: '🎮', color: 'bg-indigo-500', order: 7 },
  { name: 'Scrolling', emoji: '📱', color: 'bg-yellow-500', order: 8 },
  { name: 'Eating', emoji: '🍽', color: 'bg-red-500', order: 9 },
  { name: 'Housework', emoji: '🧹', color: 'bg-teal-500', order: 10 },
];

export async function seedActivities() {
  const count = await activityRepo.count();
  if (count === 0) {
    for (const act of DEFAULT_ACTIVITIES) {
      await activityRepo.create({
        ...act,
        id: uuidv4()
      });
    }
    console.log('Seeded default activities');
  }
}
