
export interface ExerciseType {
  id: string;
  lesson_id: string;
  type: "multiple_choice" | "translation" | "text_input" | "arrange_sentence" | "matching" | "fill_in_blank";
  question: string;
  options: any;
  correct_answer: string;
  japanese?: string | null;
  romaji?: string | null;
  xp_reward: number;
  order_index: number;
  created_at?: string;
  updated_at?: string;
  audio_url?: string;
  image_url?: string;
  words?: string[]; // For arrange_sentence exercises
  // For matching exercises
  matching_pairs?: Array<{hiragana: string, romaji: string}>;
}

export interface ExerciseResult {
  lessonId: string;
  exerciseId: string;
  isCorrect: boolean;
  userAnswer: string;
  timeSpent: number; // Added to match what's used in useExerciseSession.ts
  xpEarned: number;
}
