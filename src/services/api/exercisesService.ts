
import { baseService } from "./baseService";

export interface Exercise {
  id: string;
  lesson_id: string;
  type: string;
  question: string;
  options: any;
  correct_answer: string;
  japanese?: string | null;
  romaji?: string | null;
  xp_reward: number;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

const exercisesService = {
  getExercisesByLesson: async (lessonId: string): Promise<Exercise[]> => {
    const { data, error } = await baseService.client
      .from('exercises')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index');
    
    if (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
    
    return data || [];
  }
};

export default exercisesService;
