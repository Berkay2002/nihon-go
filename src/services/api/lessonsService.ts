
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

// Define a DB lesson type to match what comes from the database
interface DBLesson {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: string;
  xp_reward: number;
  is_locked?: boolean;
  created_at: string;
  updated_at: string;
}

// Cache for lesson data to avoid redundant fetches
const lessonsCache = new Map<string, {data: Lesson[], timestamp: number}>();
const CACHE_EXPIRY = 60000; // 1 minute cache expiry

const lessonsService = {
  getLessons: async (): Promise<Lesson[]> => {
    try {
      const { data, error } = await baseService.client
        .from('lessons')
        .select('*')
        .order('order_index');
      
      if (error) {
        console.error('Error fetching lessons:', error);
        throw error;
      }
      
      // Cast the data to the DBLesson type and then add the is_locked property with a default value
      return ((data || []) as DBLesson[]).map(lesson => ({
        ...lesson,
        is_locked: lesson.is_locked ?? false
      }));
    } catch (error) {
      console.error('Error in getLessons:', error);
      return [];
    }
  },
  
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
        
        // Cast the data to the DBLesson type and then add the is_locked property with a default value
        return ((data || []) as DBLesson[]).map(lesson => ({
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
  
  getLesson: async (lessonId: string): Promise<Lesson | null> => {
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
          return null;
        }
        
        // Cast to DBLesson before adding is_locked property
        const dbLesson = data as DBLesson;
        // Ensure is_locked is set
        return {
          ...dbLesson,
          is_locked: dbLesson.is_locked ?? false
        };
      }, 2); // 2 retries
      
      if (data) {
        console.log(`Successfully fetched lesson: ${data.title}`);
      }
      return data;
    } catch (error) {
      console.error(`Error in getLesson for ID ${lessonId}:`, error);
      return null;
    }
  },
  
  // Clear cache when needed (e.g. after updates)
  clearCache: () => {
    lessonsCache.clear();
  }
};

export default lessonsService;
