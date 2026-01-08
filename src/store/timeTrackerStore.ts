import { create } from 'zustand';
import { Activity, Session } from '../storage/db';
import { activityRepo, sessionRepo } from '../storage/repos';
import { timeEngine } from '../domain/timeEngine';
import { seedActivities } from '../storage/seed';
import { v4 as uuidv4 } from 'uuid';

interface StatsData {
  totalTime: number;
  activities: { activityId: string; duration: number }[];
}

interface TimeTrackerState {
  activities: Activity[];
  activeSession: Session | null;
  isLoading: boolean;
  isEditMode: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  selectActivity: (activityId: string) => Promise<void>;
  deleteLastSession: () => Promise<void>;
  toggleEditMode: () => void;
  
  // Edit Actions
  reorderActivities: (activities: Activity[]) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'order'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  // For Stats
  statsData: StatsData | null;
  loadStats: (range: { start: Date; end: Date }) => Promise<void>;
}

export const useTimeTrackerStore = create<TimeTrackerState>((set, get) => ({
  activities: [],
  activeSession: null,
  isLoading: true,
  isEditMode: false,
  statsData: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      // Seed if needed
      await seedActivities();
      
      // Load activities
      const activities = await activityRepo.getAll();
      
      // Load active session
      const activeSession = await sessionRepo.getActive();
      
      set({ 
        activities, 
        activeSession: activeSession || null,
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
      order: activities.length + 1
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
