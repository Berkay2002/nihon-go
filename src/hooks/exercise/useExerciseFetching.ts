
import { useEffect } from "react";
import contentService from "@/services/contentService";
import { toast } from "sonner";

/**
 * Hook for fetching exercises
 */
export const useExerciseFetching = (
  lessonId: string | undefined,
  setExercises: (exercises: any[]) => void,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void
) => {
  useEffect(() => {
    if (!lessonId) {
      console.log("No lessonId provided to useExerciseFetching");
      setError("No lesson ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchExercises = async () => {
      try {
        console.log(`Fetching exercises for lesson: ${lessonId}`);
        setIsLoading(true);
        
        const exercisesData = await contentService.getExercisesByLesson(lessonId);
        console.log(`Fetched ${exercisesData.length} exercises`, exercisesData);
        
        if (exercisesData.length === 0) {
          console.log("No exercises found for this lesson");
          setError("No exercises found for this lesson.");
          setIsLoading(false);
          return;
        }
        
        // Initialize available words for arrange sentence exercises
        const processedExercises = exercisesData.map(exercise => {
          if (exercise.type === "arrange_sentence" && exercise.options) {
            return {
              ...exercise,
              words: Array.isArray(exercise.options) ? exercise.options : 
                     typeof exercise.options === 'object' && exercise.options.words ? exercise.options.words : 
                     exercise.words || []
            };
          }
          return exercise;
        });
        
        setExercises(processedExercises);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching exercises:", error);
        toast.error("Failed to load exercises");
        setError("Failed to load exercises. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [lessonId, setExercises, setIsLoading, setError]);
};
