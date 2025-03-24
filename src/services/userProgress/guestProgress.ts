import { UserProgress, UserStreak } from './types';

// Reliable fake data for guest mode that always returns consistent data
export const guestProgressService = {
  getUserProgress: async (): Promise<UserProgress[]> => {
    // Always return a non-null array
    return [
      {
        id: 'guest-progress-1',
        user_id: 'guest',
        lesson_id: 'demo-lesson-1',
        is_completed: false,
        accuracy: 0,
        xp_earned: 0,
        last_attempted_at: new Date().toISOString()
      }
    ];
  },
  
  getUserStreak: async (): Promise<UserStreak> => {
    // Always return a valid streak object
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
  // But they should still resolve properly
  updateLessonProgress: async (
    userId: string,
    lessonId: string,
    isCompleted: boolean,
    accuracy: number,
    xpEarned: number
  ): Promise<void> => {
    // Simulate a successful update
    console.log(
      `[GUEST MODE] Updated lesson progress: ${userId}, ${lessonId}, completed: ${isCompleted}, accuracy: ${accuracy}, xp: ${xpEarned}`
    );
    return Promise.resolve();
  },
  
  submitExerciseResult: async (
    userId: string,
    result: any
  ): Promise<void> => {
    // Simulate a successful submission
    console.log(`[GUEST MODE] Submitted exercise result for: ${userId}`, result);
    return Promise.resolve();
  },
  
  updateUserStreak: async (
    userId: string,
    dailyXpToAdd: number,
    extendStreak: boolean = true
  ): Promise<UserStreak> => {
    // Simulate updating streak and return the updated data
    console.log(`[GUEST MODE] Updated streak for: ${userId}, added XP: ${dailyXpToAdd}, extend: ${extendStreak}`);
    return {
      id: 'guest-streak',
      user_id: 'guest',
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: new Date().toISOString(),
      daily_goal: 50,
      daily_xp: 15 + dailyXpToAdd,
      total_xp: 15 + dailyXpToAdd,
      level: 1
    };
  }
};