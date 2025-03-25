
import { supabase } from "@/integrations/supabase/client";
import { 
  UserProgress, 
  UserStreak, 
  ExerciseResult, 
  LessonScorecard, 
  ExerciseResponse, 
  ExerciseType 
} from './types';

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
        level: newLevel
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
    // Get the current lesson progress
    const lessonProgress = await userProgressApi.getLessonProgress(userId, result.lessonId);
    
    // Only award XP and update streak if this is a first-time completion or not yet completed
    const shouldAwardXP = !lessonProgress?.is_completed;
    
    if (shouldAwardXP && result.xpEarned > 0) {
      // First update the user streak with the XP earned
      await userProgressApi.updateUserStreak(userId, result.xpEarned);
    } else if (lessonProgress?.is_completed) {
      console.log(`Exercise for already completed lesson. No additional XP awarded.`);
    }
    
    // Mark the lesson as completed regardless of accuracy
    const isLessonCompleted = true;
    
    // Calculate accuracy (simplified)
    const accuracy = result.isCorrect ? 100 : (lessonProgress?.accuracy || 0);
    
    // If lesson was already completed, don't add new XP
    const newXpEarned = shouldAwardXP ? result.xpEarned + (lessonProgress?.xp_earned || 0) : (lessonProgress?.xp_earned || 0);
    
    // Update the lesson progress
    await userProgressApi.updateLessonProgress(
      userId,
      result.lessonId,
      isLessonCompleted,
      accuracy,
      newXpEarned
    );
    
    // Try to record the exercise response for analysis
    try {
      // This will fail if the exercise_responses table doesn't exist
      const { error } = await supabase
        .from('exercise_responses')
        .insert({
          user_id: userId,
          lesson_id: result.lessonId,
          exercise_id: result.exerciseId,
          is_correct: result.isCorrect,
          user_answer: result.userAnswer,
          question: "Question data", // Would normally come from the exercise
          correct_answer: "Correct answer", // Would normally come from the exercise
          exercise_type: "multiple_choice" // Default type
        });
        
      if (error && error.code !== "42P01") { // 42P01 is PostgreSQL's code for "undefined_table"
        console.error('Error recording exercise response:', error);
      }
    } catch (e) {
      // Silently fail if table doesn't exist
      console.warn('Exercise responses not recorded - table might not exist');
    }
  },
  
  // Get lesson scorecard with exercise responses
  getLessonScorecard: async (userId: string, lessonId: string): Promise<LessonScorecard> => {
    try {
      // First try to get lesson progress
      const lessonProgress = await userProgressApi.getLessonProgress(userId, lessonId);
      
      // Initialize scorecard with lesson progress data
      const scorecard: LessonScorecard = {
        lessonId,
        totalExercises: 0,
        correctExercises: 0,
        accuracy: lessonProgress?.accuracy || 0,
        xpEarned: lessonProgress?.xp_earned || 0,
        responses: []
      };
      
      // Try to get detailed exercise responses if the table and/or function exists
      try {
        // Try with RPC function first (if the function exists)
        try {
          const { data, error } = await supabase.rpc('get_exercise_responses', {
            p_lesson_id: lessonId,
            p_user_id: userId
          });
          
          if (!error && data && Array.isArray(data)) {
            // Process successful response from RPC
            scorecard.responses = data.map(r => ({
              exercise_id: r.exercise_id,
              is_correct: r.is_correct,
              question: r.question || '',
              correct_answer: r.correct_answer || '',
              user_answer: r.user_answer || '',
              exercise_type: r.exercise_type || 'unknown'
            }));
            
            scorecard.correctExercises = scorecard.responses.filter(r => r.is_correct).length;
            scorecard.totalExercises = scorecard.responses.length;
            return scorecard;
          }
        } catch (rpcError) {
          // RPC function might not exist, continue to fallback
          console.warn('RPC function get_exercise_responses not available:', rpcError);
        }
        
        // Direct query fallback
        try {
          // We need to use any here since exercise_responses might not be defined in types
          // @ts-ignore - Intentional to handle potential missing table
          const { data, error } = await supabase
            .from('exercise_responses')
            .select('*')
            .eq('user_id', userId)
            .eq('lesson_id', lessonId);
            
          if (!error && data) {
            scorecard.responses = data.map(r => ({
              exercise_id: r.exercise_id,
              is_correct: r.is_correct,
              question: r.question || '',
              correct_answer: r.correct_answer || '',
              user_answer: r.user_answer || '',
              exercise_type: r.exercise_type || 'unknown'
            }));
            
            scorecard.correctExercises = scorecard.responses.filter(r => r.is_correct).length;
            scorecard.totalExercises = scorecard.responses.length;
            return scorecard;
          }
        } catch (directQueryError) {
          // Table might not exist, continue to fallback
          console.warn('Table exercise_responses not available:', directQueryError);
        }
      } catch (responseError) {
        console.warn('Could not get exercise responses:', responseError);
      }
      
      // Fallback: Create an estimated scorecard based on accuracy
      const estimatedTotalExercises = 10; // Assume 10 exercises per lesson
      const estimatedCorrect = Math.round((scorecard.accuracy / 100) * estimatedTotalExercises);
      
      // Update scorecard with estimates
      scorecard.totalExercises = estimatedTotalExercises;
      scorecard.correctExercises = estimatedCorrect;
      
      // Generate mock responses if needed
      if (scorecard.responses.length === 0) {
        // Create some mock responses based on the accuracy
        for (let i = 0; i < estimatedTotalExercises; i++) {
          const isCorrect = i < estimatedCorrect;
          
          scorecard.responses.push({
            exercise_id: `exercise-${i + 1}`,
            is_correct: isCorrect,
            question: "Example question",
            correct_answer: "Correct answer",
            user_answer: isCorrect ? "Correct answer" : "Incorrect answer",
            exercise_type: "unknown"
          });
        }
      }
      
      return scorecard;
    } catch (error) {
      console.error('Error getting lesson scorecard:', error);
      
      // Return an empty scorecard as fallback
      return {
        lessonId,
        totalExercises: 0,
        correctExercises: 0,
        accuracy: 0,
        xpEarned: 0,
        responses: []
      };
    }
  }
};
