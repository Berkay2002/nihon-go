
import { baseService } from "./baseService";

export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: string;
  xp_reward: number;
  created_at?: string;
  updated_at?: string;
}

const lessonsService = {
  getLessonsByUnit: async (unitId: string): Promise<Lesson[]> => {
    const { data, error } = await baseService.client
      .from('lessons')
      .select('*')
      .eq('unit_id', unitId)
      .order('order_index');
    
    if (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
    
    return data || [];
  },
  
  getLesson: async (lessonId: string): Promise<Lesson> => {
    const { data, error } = await baseService.client
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Lesson not found');
    }
    
    return data;
  }
};

export default lessonsService;
