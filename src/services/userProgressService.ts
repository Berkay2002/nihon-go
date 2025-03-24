
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  accuracy: number;
  xp_earned: number;
  last_attempted_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  daily_goal: number;
  daily_xp: number;
  total_xp: number;
  level: number;
}

export interface ExerciseResult {
  lessonId: string;
  exerciseId: string;
  isCorrect: boolean;
  userAnswer: string;
  timeSpent: number; // in seconds
  xpEarned: number;
}

// Fake data for guest mode
const guestProgressService = {
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

const userProgressService = {
  // Get user progress for all lessons
  getUserProgress: async (userId: string): Promise<UserProgress[]> => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
    
    return data || [];
  },
  
  // Get user progress for a specific lesson
  getLessonProgress: async (userId: string, lessonId: string): Promise<UserProgress | null> => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching lesson progress:', error);
      throw error;
    }
    
    return data;
  },
  
  // Update or create user progress for a lesson
  updateLessonProgress: async (
    userId: string,
    lessonId: string,
    isCompleted: boolean,
    accuracy: number,
    xpEarned: number
  ): Promise<void> => {
    const existingProgress = await userProgressService.getLessonProgress(userId, lessonId);
    
    if (existingProgress) {
      // Update existing progress
      const { error } = await supabase
        .from('user_progress')
        .update({
          is_completed: isCompleted,
          accuracy: accuracy,
          xp_earned: Math.max(existingProgress.xp_earned, xpEarned), // Keep the highest XP earned
          last_attempted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id);
      
      if (error) {
        console.error('Error updating lesson progress:', error);
        throw error;
      }
    } else {
      // Create new progress record
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          is_completed: isCompleted,
          accuracy: accuracy,
          xp_earned: xpEarned,
          last_attempted_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating lesson progress:', error);
        throw error;
      }
    }
  },
  
  // Get user streak information
  getUserStreak: async (userId: string): Promise<UserStreak | null> => {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user streak:', error);
      throw error;
    }
    
    return data;
  },
  
  // Update user streak
  updateUserStreak: async (
    userId: string,
    dailyXpToAdd: number,
    extendStreak: boolean = true
  ): Promise<UserStreak | null> => {
    const currentStreak = await userProgressService.getUserStreak(userId);
    
    if (!currentStreak) {
      console.error('No streak record found for user');
      return null;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const lastActivityDate = new Date(currentStreak.last_activity_date).toISOString().split('T')[0];
    const isToday = lastActivityDate === today;
    
    // Calculate new streak value
    let newCurrentStreak = currentStreak.current_streak;
    let newDailyXp = currentStreak.daily_xp;
    
    if (isToday) {
      // User already active today, just add XP
      newDailyXp += dailyXpToAdd;
    } else {
      // New day activity
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];
      
      if (lastActivityDate === yesterdayDate && extendStreak) {
        // User was active yesterday, extend streak
        newCurrentStreak += 1;
      } else if (extendStreak) {
        // User missed a day, reset streak to 1
        newCurrentStreak = 1;
      }
      
      // Reset daily XP for new day
      newDailyXp = dailyXpToAdd;
    }
    
    // Calculate new level (simple formula: level up every 100 XP)
    const newTotalXp = currentStreak.total_xp + dailyXpToAdd;
    const newLevel = Math.floor(newTotalXp / 100) + 1;
    
    // Update the streak record
    const { data, error } = await supabase
      .from('user_streaks')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: Math.max(currentStreak.longest_streak, newCurrentStreak),
        last_activity_date: today,
        daily_xp: newDailyXp,
        total_xp: newTotalXp,
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentStreak.id)
      .select('*')
      .maybeSingle();
    
    if (error) {
      console.error('Error updating user streak:', error);
      throw error;
    }
    
    return data;
  },
  
  // Submit exercise results
  submitExerciseResult: async (
    userId: string,
    result: ExerciseResult
  ): Promise<void> => {
    // First update the user streak with the XP earned
    await userProgressService.updateUserStreak(userId, result.xpEarned);
    
    // Get the current lesson progress
    const lessonProgress = await userProgressService.getLessonProgress(userId, result.lessonId);
    
    // Get all exercises for this lesson to calculate completion
    const { data: lessonExercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id')
      .eq('lesson_id', result.lessonId);
    
    if (exercisesError) {
      console.error('Error fetching lesson exercises:', exercisesError);
      throw exercisesError;
    }
    
    // Get all completed exercise results for this lesson
    const { data: completedExercises, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', result.lessonId)
      .maybeSingle();
    
    if (progressError && progressError.code !== 'PGRST116') { // PGRST116 is "No rows returned"
      console.error('Error fetching completed exercises:', progressError);
      throw progressError;
    }
    
    // Calculate if the lesson is completed
    const totalExercises = lessonExercises?.length || 0;
    const completedCount = completedExercises ? 1 : 0; // Simplified for now
    const isLessonCompleted = completedCount >= totalExercises;
    
    // Calculate accuracy (simplified)
    const accuracy = result.isCorrect ? 100 : (lessonProgress?.accuracy || 0);
    
    // Update the lesson progress
    await userProgressService.updateLessonProgress(
      userId,
      result.lessonId,
      isLessonCompleted,
      accuracy,
      result.xpEarned + (lessonProgress?.xp_earned || 0)
    );
  },
};

// Hook for accessing progress in components
export const useUserProgress = () => {
  const { user, isLoading, isGuest } = useAuth();
  
  const getUserProgressData = async () => {
    if (isLoading) return null;
    
    if (isGuest) {
      // Return mock data for guest users
      return await guestProgressService.getUserProgress();
    }
    
    if (!user) return null;
    
    try {
      return await userProgressService.getUserProgress(user.id);
    } catch (error) {
      console.error('Error in useUserProgress:', error);
      return null;
    }
  };
  
  const getUserStreakData = async () => {
    if (isLoading) return null;
    
    if (isGuest) {
      // Return mock streak data for guest users
      return await guestProgressService.getUserStreak();
    }
    
    if (!user) return null;
    
    try {
      return await userProgressService.getUserStreak(user.id);
    } catch (error) {
      console.error('Error in useUserProgress:', error);
      return null;
    }
  };
  
  // Choose between real or mock services based on guest mode
  const service = isGuest ? guestProgressService : userProgressService;
  
  return {
    getUserProgressData,
    getUserStreakData,
    updateLessonProgress: user && !isGuest ? 
      (lessonId: string, isCompleted: boolean, accuracy: number, xpEarned: number) => 
        service.updateLessonProgress(user.id, lessonId, isCompleted, accuracy, xpEarned) : 
      () => Promise.resolve(),
    submitExerciseResult: user && !isGuest ?
      (result: ExerciseResult) => service.submitExerciseResult(user.id, result) :
      () => Promise.resolve(),
    updateUserStreak: user && !isGuest ?
      (dailyXpToAdd: number, extendStreak: boolean = true) => 
        service.updateUserStreak(user.id, dailyXpToAdd, extendStreak) :
      (dailyXpToAdd: number) => Promise.resolve(null)
  };
};

export default userProgressService;
