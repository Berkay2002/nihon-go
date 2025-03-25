
import { baseService } from "./baseService";

export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: string;
  xp_reward: number;
  is_locked?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Cache for lesson data to avoid redundant fetches
const lessonsCache = new Map<string, {data: Lesson[], timestamp: number}>();
const CACHE_EXPIRY = 60000; // 1 minute cache expiry

const lessonsService = {
  getLessonsByUnit: async (unitId: string): Promise<Lesson[]> => {
    try {
      console.log(`Fetching lessons for unit: ${unitId}`);
      
      // Check cache first
      const cachedData = lessonsCache.get(unitId);
      const now = Date.now();
      if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRY)) {
        console.log(`Using cached lessons for unit: ${unitId}`);
        return cachedData.data;
      }
      
      // Try with retry logic
      const data = await baseService.retryWithBackoff(async () => {
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
        
        // Make sure every lesson has is_locked property
        return (data || []).map(lesson => ({
          ...lesson,
          is_locked: lesson.is_locked ?? false
        }));
      }, 3); // 3 retries
      
      console.log(`Successfully fetched ${data?.length || 0} lessons for unit ${unitId}`);
      
      // Update cache
      lessonsCache.set(unitId, {data, timestamp: now});
      
      // Return empty array instead of null to prevent downstream errors
      return data;
    } catch (error) {
      console.error(`Error in getLessonsByUnit for unit ${unitId}:`, error);
      // Check if we have cached data even if expired
      const cachedData = lessonsCache.get(unitId);
      if (cachedData) {
        console.log(`Using expired cached data for unit ${unitId} due to error`);
        return cachedData.data;
      }
      // Return empty array on error to prevent app from crashing
      return [];
    }
  },
  
  getLesson: async (lessonId: string): Promise<Lesson> => {
    try {
      console.log(`Fetching lesson with ID: ${lessonId}`);
      
      // Try with retry logic
      const data = await baseService.retryWithBackoff(async () => {
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
        
        // Ensure is_locked is set
        return {
          ...data,
          is_locked: data.is_locked ?? false
        };
      }, 2); // 2 retries
      
      console.log(`Successfully fetched lesson: ${data.title}`);
      return data;
    } catch (error) {
      console.error(`Error in getLesson for ID ${lessonId}:`, error);
      throw error;
    }
  },
  
  // Clear cache when needed (e.g. after updates)
  clearCache: () => {
    lessonsCache.clear();
  }
};

export default lessonsService;
