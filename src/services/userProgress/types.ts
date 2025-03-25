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

export interface ExerciseResponse {
  id: string;
  user_id: string;
  lesson_id: string;
  exercise_id: string;
  exercise_type: ExerciseType;
  question: string;
  correct_answer: string;
  user_answer: string;
  is_correct: boolean;
  created_at: string;
}

export type ExerciseType = 'select' | 'listen' | 'translate' | 'match' | 'arrange';

export interface LessonScorecard {
  totalExercises: number;
  correctExercises: number;
  accuracy: number;
  xpEarned: number;
  responses: ExerciseResponse[];
}
