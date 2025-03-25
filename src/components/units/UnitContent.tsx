
import React from "react";
import { NavigateFunction } from "react-router-dom";
import { UnitInfo } from "./UnitInfo";
import { LessonsList } from "./LessonsList";
import { UnitWithProgress, LessonWithProgress } from "@/hooks/useUnitsData";
import { useAuth } from "@/hooks/useAuth";
import contentService from "@/services/contentService";
import learningAlgorithmService from "@/services/learningAlgorithmService";
import { toast } from "sonner";

interface UnitContentProps {
  currentUnit: UnitWithProgress | undefined;
  lessons: LessonWithProgress[];
  loading: boolean;
  error: string | null;
  navigate: NavigateFunction;
}

export const UnitContent: React.FC<UnitContentProps> = ({
  currentUnit,
  lessons,
  loading,
  error,
  navigate
}) => {
  const { user } = useAuth();
  
  if (!currentUnit) return null;

  const handleLessonClick = async (lesson: LessonWithProgress) => {
    if (lesson.is_locked) {
      toast.error("This lesson is locked. Complete previous lessons first.");
      return;
    }
    
    // If user is authenticated, add the lesson's vocabulary to the SRS system
    if (user) {
      try {
        // Get vocabulary for this lesson
        console.log(`Getting vocabulary for lesson ${lesson.id}`);
        const vocabulary = await contentService.getVocabularyByLesson(lesson.id);
        console.log(`Adding ${vocabulary.length} vocabulary items from lesson ${lesson.id} to SRS`);
        
        // Add each vocabulary item to the SRS system
        let addedCount = 0;
        for (const vocabItem of vocabulary) {
          const added = await learningAlgorithmService.addVocabularyToSrs(user.id, vocabItem.id);
          if (added) addedCount++;
        }
        
        if (vocabulary.length > 0) {
          toast.success(`Added ${addedCount} vocabulary items to review system`, {
            duration: 3000,
          });
        }
      } catch (error) {
        console.error("Failed to add vocabulary to SRS:", error);
        toast.error("Failed to add vocabulary to review system");
      }
    }
    
    navigate(`/app/lesson/${lesson.id}`);
  };

  return (
    <section className="mb-8">
      <UnitInfo unit={currentUnit} />
      
      <LessonsList 
        lessons={lessons}
        loading={loading && !lessons.length}
        error={error}
        navigate={navigate}
        handleLessonClick={handleLessonClick}
      />
    </section>
  );
};
