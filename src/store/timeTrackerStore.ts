import { create } from 'zustand';
import { Activity, Session, Settings } from '../storage/db';
import { activityRepo, sessionRepo, settingsRepo } from '../storage/repos';
import { timeEngine } from '../domain/timeEngine';
import { seedActivities } from '../storage/seed';
import { v4 as uuidv4 } from 'uuid';

interface StatsData {
  totalTime: number;
  activities: { activityId: string; duration: number }[];
  sessions: Session[];
}

interface TimeTrackerState {
  activities: Activity[];
  activeSession: Session | null;
  settings: Settings;
  isLoading: boolean;
  isEditMode: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  selectActivity: (activityId: string) => Promise<void>;
  deleteLastSession: () => Promise<void>;
  toggleEditMode: () => void;
  
  // Settings Actions
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  clearTodayData: () => Promise<void>;

  // Edit Actions
  reorderActivities: (activities: Activity[]) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'order'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  // For Stats
  statsData: StatsData | null;
  loadStats: (range: { start: Date; end: Date }) => Promise<void>;
}

const CATEGORY_MAPPING: Record<string, string> = {
  'Work/Code': 'Output',
  'Investment': 'Output',
  'Workout': 'Health',
  'GF': 'Social',
  'Housework': 'Life',
  'Eating': 'Life',
  'Traffic': 'Life',
  'Chilling': 'Passive',
  'Gaming': 'Passive',
  'Scrolling': 'Passive',
};

export const useTimeTrackerStore = create<TimeTrackerState>((set, get) => ({
  activities: [],
  activeSession: null,
  settings: { id: 'config', autoReminder: false, reminderDuration: 60 * 60 * 1000 },
  isLoading: true,
  isEditMode: false,
  statsData: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      // Seed if needed
      await seedActivities();
      
      // Load activities
      let activities = await activityRepo.getAll();
      
      // Migration: Backfill categories
      const updates = [];
      for (const activity of activities) {
        if (!activity.category) {
          const category = CATEGORY_MAPPING[activity.name] || 'Other';
          updates.push(activityRepo.update(activity.id, { category }));
          activity.category = category;
        }
      }
      if (updates.length > 0) {
        await Promise.all(updates);
      }
      
      // Load active session
      const activeSession = await sessionRepo.getActive();

      // Load settings
      const settings = await settingsRepo.get();
      
      set({ 
        activities, 
        activeSession: activeSession || null,
        settings,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ isLoading: false });
    }
  },

  selectActivity: async (activityId: string) => {
    const { activeSession, isEditMode } = get();
    
    // In edit mode, selection logic is handled by UI (opening modal), not tracking
    if (isEditMode) return;

    // If user taps the currently active activity: do nothing
    if (activeSession?.activityId === activityId) return;

    try {
      const newSession = await timeEngine.startActivity(activityId);
      set({ activeSession: newSession });
    } catch (error) {
      console.error('Failed to select activity:', error);
    }
  },

  deleteLastSession: async () => {
    try {
      await timeEngine.deleteLastSession();
      // Re-fetch active session as we might have deleted it
      const active = await sessionRepo.getActive();
      set({ activeSession: active || null });
    } catch (error) {
      console.error('Failed to delete last session:', error);
    }
  },

  toggleEditMode: () => {
    set((state) => ({ isEditMode: !state.isEditMode }));
  },

  updateSettings: async (newSettings) => {
    const { settings } = get();
    const updated = { ...settings, ...newSettings };
    
    set({ settings: updated }); // Optimistic
    try {
      await settingsRepo.save(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  clearTodayData: async () => {
    try {
      await timeEngine.clearTodaySessions();
      set({ activeSession: null }); // Since clearTodaySessions handles stopping active if needed
    } catch (error) {
      console.error('Failed to clear today data:', error);
    }
  },

  reorderActivities: async (activities: Activity[]) => {
    // Optimistic update
    set({ activities });
    
    // Update order in objects
    const updatedActivities = activities.map((a, index) => ({ ...a, order: index + 1 }));
    set({ activities: updatedActivities });

    try {
      await activityRepo.saveAll(updatedActivities);
    } catch (error) {
      console.error('Failed to reorder activities:', error);
      // Revert on error? For now just log
    }
  },

  addActivity: async (data) => {
    const { activities } = get();
    const newActivity: Activity = {
      ...data,
      id: uuidv4(),
      order: activities.length + 1,
      category: data.category || 'Other'
    };
    
    try {
      await activityRepo.create(newActivity);
      set({ activities: [...activities, newActivity] });
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  },

  updateActivity: async (id, updates) => {
    const { activities } = get();
    
    try {
      await activityRepo.update(id, updates);
      set({
        activities: activities.map(a => a.id === id ? { ...a, ...updates } : a)
      });
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  },

  deleteActivity: async (id) => {
    const { activities } = get();
    try {
      await activityRepo.delete(id);
      set({
        activities: activities.filter(a => a.id !== id)
      });
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  },

  loadStats: async (range) => {
    try {
      const stats = await timeEngine.aggregateStats(range);
      set({ statsData: stats });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }
}));
