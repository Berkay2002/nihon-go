export interface ExerciseType {
  id: string;
  lesson_id: string;
  type: string;
  question: string;
  options: string[];
  correct_answer: string;
  japanese?: string | null;
  romaji?: string | null;
  xp_reward: number;
  order_index: number;
  created_at?: string;
  updated_at?: string;
  audio_url?: string;
  image_url?: string;
}

export interface ExerciseResult {
  lessonId: string;
  exerciseId: string;
  isCorrect: boolean;
  userAnswer: string;
  timeSpent: number;
  xpEarned: number;
}
