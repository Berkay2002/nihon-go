
import { Vocabulary } from '../contentService';

// Review item represents a vocabulary item due for review
export interface ReviewItem {
  item: Vocabulary;
  dueDate: Date;
  difficulty: number; // 1-5 where 5 is most difficult
  interval: number; // in days
}

// Review session contains a collection of items for review
export interface ReviewSession {
  items: ReviewItem[];
  userId: string;
  sessionDate: Date;
}
