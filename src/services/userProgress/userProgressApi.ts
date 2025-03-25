import { supabase } from "@/integrations/supabase/client";
import { UserProgress, UserStreak, ExerciseResult } from './types';

export const userProgressApi = {
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
    const existingProgress = await userProgressApi.getLessonProgress(userId, lessonId);
    
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
    const currentStreak = await userProgressApi.getUserStreak(userId);
    
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
    await userProgressApi.updateUserStreak(userId, result.xpEarned);
    
    // Get the current lesson progress
    const lessonProgress = await userProgressApi.getLessonProgress(userId, result.lessonId);
    
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
    
    // Mark the lesson as completed regardless of accuracy
    // This ensures that even with partial scores like 9/12, the lesson is still considered completed
    const isLessonCompleted = true;
    
    // Calculate accuracy (simplified)
    const accuracy = result.isCorrect ? 100 : (lessonProgress?.accuracy || 0);
    
    // Update the lesson progress
    await userProgressApi.updateLessonProgress(
      userId,
      result.lessonId,
      isLessonCompleted,
      accuracy,
      result.xpEarned + (lessonProgress?.xp_earned || 0)
    );
  },
};
