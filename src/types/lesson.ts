export interface LessonData {
  id: string;
  title: string;
  unitId: string;
  unitName: string;
  xpReward: number;
  completedAt?: string;
  isCompleted?: boolean;
} 