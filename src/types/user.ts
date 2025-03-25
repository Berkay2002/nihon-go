export interface UserLessonData {
  id: string;
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  xpReward: number;
  type?: "standard" | "review" | "boss" | "treasure";
}

export interface UserUnitData {
  id: string;
  title: string;
  progress: number;
  lessons: UserLessonData[];
}

export interface UserProgressData {
  units: UserUnitData[];
}

export interface UserProgress {
  lesson_id: string;
  is_completed: boolean;
  completion_percentage?: number;
  last_attempted_at?: string;
  accuracy?: number;
} 