
export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  accuracy: number;
  xp_earned: number;
  last_attempted_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  daily_xp: number;
  total_xp: number;
  level: number;
  daily_goal: number;
}

export interface ExerciseResult {
  lessonId: string;
  exerciseId: string;
  isCorrect: boolean;
  userAnswer: string;
  timeSpent: number; // Added to match what's being sent
  xpEarned: number;
}

export interface ExerciseResponse {
  exercise_id: string;
  is_correct: boolean;
  question: string;
  correct_answer: string;
  user_answer: string;
  exercise_type: string;
}

export interface LessonScorecard {
  lessonId: string;
  totalExercises: number;
  correctExercises: number;
  accuracy: number;
  xpEarned: number;
  responses: ExerciseResponse[];
}
