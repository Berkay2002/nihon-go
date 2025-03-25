
export interface LessonData {
  id: string;
  title: string;
  description: string;
  unitId: string;
  unitName?: string;
  xpReward: number;
  completedAt?: string;
  isCompleted?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  unit_id: string;
  order_index: number;
  estimated_time: string;
  xp_reward: number;
  created_at: string;
  updated_at: string;
  is_locked: boolean;
}

export interface VocabularyItem {
  id: string;
  japanese: string;
  english: string;
  romaji: string;
  hiragana: string;
  example_sentence?: string;
  category: string;
  difficulty: number;
}
