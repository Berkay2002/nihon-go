
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
      console.log(`Fetching lessons for unit: ${unitId}`);
      const { data, error } = await baseService.executeWithTimeout(
        () => baseService.client
          .from('lessons')
          .select('*')
          .eq('unit_id', unitId)
          .order('order_index'),
        8000, // Increased timeout to 8 seconds
        "Lessons fetch timeout"
      );
      
      if (error) {
        console.error('Error fetching lessons:', error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} lessons for unit ${unitId}`);
      
      // Return empty array instead of null to prevent downstream errors
      return data || [];
    } catch (error) {
      console.error(`Error in getLessonsByUnit for unit ${unitId}:`, error);
      // Return empty array on error to prevent app from crashing
      return [];
    }
  },
  
  getLesson: async (lessonId: string): Promise<Lesson> => {
    try {
      console.log(`Fetching lesson with ID: ${lessonId}`);
      const { data, error } = await baseService.executeWithTimeout(
        () => baseService.client
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .maybeSingle(),
        8000, // Increased timeout to 8 seconds
        "Lesson fetch timeout"
      );
      
      if (error) {
        console.error(`Error fetching lesson ${lessonId}:`, error);
        throw error;
      }
      
      if (!data) {
        console.error(`Lesson not found with ID: ${lessonId}`);
        throw new Error('Lesson not found');
      }
      
      console.log(`Successfully fetched lesson: ${data.title}`);
      return data;
    } catch (error) {
      console.error(`Error in getLesson for ID ${lessonId}:`, error);
      throw error;
    }
  }
};

export default lessonsService;
