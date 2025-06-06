
import { baseService } from "./baseService";
import { ExerciseType } from "@/types/exercises"; 

export interface Exercise {
  id: string;
  lesson_id: string;
  type: "multiple_choice" | "translation" | "text_input" | "arrange_sentence" | "matching" | "fill_in_blank";
  question: string;
  options: any;
  correct_answer: string;
  japanese?: string;
  romaji?: string;
  xp_reward: number;
  order_index: number;
  created_at?: string;
  updated_at?: string;
  words?: string[]; // For arrange_sentence exercises
  matching_pairs?: Array<{hiragana: string, romaji: string}>;
  audio_url?: string;
  image_url?: string;
}

// Cache for exercise data to avoid redundant fetches
const exercisesCache = new Map<string, {data: Exercise[], timestamp: number}>();
const CACHE_EXPIRY = 60000; // 1 minute cache expiry

// Helper function to map database Exercise to ExerciseType
const mapToExerciseType = (exercise: Exercise): ExerciseType => {
  const exerciseType: ExerciseType = {
    id: exercise.id,
    lesson_id: exercise.lesson_id,
    type: exercise.type,
    question: exercise.question,
    options: exercise.options,
    correct_answer: exercise.correct_answer,
    xp_reward: exercise.xp_reward,
    japanese: exercise.japanese || "",
    romaji: exercise.romaji || "",
    order_index: exercise.order_index,
    words: exercise.words || [],
    matching_pairs: exercise.matching_pairs,
    audio_url: exercise.audio_url,
    image_url: exercise.image_url
  };
  
  return exerciseType;
};

const exercisesService = {
  getExercisesByLesson: async (lessonId: string): Promise<ExerciseType[]> => {
    try {
      console.log(`Fetching exercises for lesson: ${lessonId}`);
      
      // Check cache first
      const cachedData = exercisesCache.get(lessonId);
      const now = Date.now();
      if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRY)) {
        console.log(`Using cached exercises for lesson: ${lessonId}`);
        return cachedData.data.map(mapToExerciseType);
      }
      
      // Try with retry logic
      const data = await baseService.retryWithBackoff(async () => {
        const { data, error } = await baseService.executeWithTimeout(
          () => baseService.client
            .from('exercises')
            .select('*')
            .eq('lesson_id', lessonId)
            .order('order_index'),
          8000,
          "Exercises fetch timeout"
        );
        
        if (error) {
          console.error('Error fetching exercises:', error);
          throw error;
        }
        
        return data || [];
      }, 3); // 3 retries
      
      console.log(`Successfully fetched ${data?.length || 0} exercises for lesson ${lessonId}`);
      
      // Update cache
      exercisesCache.set(lessonId, {data, timestamp: now});
      
      // Map to ExerciseType and return
      return data.map(mapToExerciseType);
    } catch (error) {
      console.error(`Error in getExercisesByLesson for lesson ${lessonId}:`, error);
      // Check if we have cached data even if expired
      const cachedData = exercisesCache.get(lessonId);
      if (cachedData) {
        console.log(`Using expired cached data for lesson ${lessonId} due to error`);
        return cachedData.data.map(mapToExerciseType);
      }
      // Return empty array on error to prevent app from crashing
      return [];
    }
  },
  
  clearCache: () => {
    exercisesCache.clear();
  }
};

export default exercisesService;
