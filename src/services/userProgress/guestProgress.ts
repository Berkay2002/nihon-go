
import { UserProgress, UserStreak } from './types';

// Fake data for guest mode
export const guestProgressService = {
  getUserProgress: async (): Promise<UserProgress[]> => {
    return [];
  },
  
  getUserStreak: async (): Promise<UserStreak> => {
    return {
      id: 'guest-streak',
      user_id: 'guest',
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: new Date().toISOString(),
      daily_goal: 50,
      daily_xp: 15,
      total_xp: 15,
      level: 1
    };
  },
  
  // These functions don't actually save anything in guest mode
  updateLessonProgress: async (): Promise<void> => {},
  submitExerciseResult: async (): Promise<void> => {},
  updateUserStreak: async (): Promise<UserStreak | null> => {
    return {
      id: 'guest-streak',
      user_id: 'guest',
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: new Date().toISOString(),
      daily_goal: 50,
      daily_xp: 15,
      total_xp: 15,
      level: 1
    };
  }
};
