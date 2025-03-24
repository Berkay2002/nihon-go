
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
    try {
      const { data, error } = await baseService.executeWithTimeout(
        () => baseService.client
          .from('lessons')
          .select('*')
          .eq('unit_id', unitId)
          .order('order_index'),
        5000,
        "Lessons fetch timeout"
      );
      
      if (error) {
        console.error('Error fetching lessons:', error);
        throw error;
      }
      
      // Return empty array instead of null to prevent downstream errors
      return data || [];
    } catch (error) {
      console.error('Error in getLessonsByUnit:', error);
      // Return empty array on error to prevent app from crashing
      return [];
    }
  },
  
  getLesson: async (lessonId: string): Promise<Lesson> => {
    try {
      const { data, error } = await baseService.executeWithTimeout(
        () => baseService.client
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .maybeSingle(),
        5000,
        "Lesson fetch timeout"
      );
      
      if (error) {
        console.error('Error fetching lesson:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Lesson not found');
      }
      
      return data;
    } catch (error) {
      console.error('Error in getLesson:', error);
      throw error;
    }
  }
};

export default lessonsService;
