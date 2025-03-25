
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

export interface SrsItem {
  id: string;
  user_id: string;
  vocabulary_id: string;
  interval: number; // in days
  ease_factor: number;
  next_review_date: string;
  last_review_date: string | null;
  review_count: number;
  learning_stage: 'new' | 'learning' | 'review' | 'graduated';
}

export interface ReviewResult {
  vocabularyId: string;
  wasCorrect: boolean;
  difficulty: number; // 1-5 where 5 is most difficult
}
