import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/services/userProgressService";
import { LoadingState } from "@/components/home/LoadingState";
import { ErrorState } from "@/components/home/ErrorState";
import { HomeContent } from "@/components/home/HomeContent";
import contentService from "@/services/contentService";
import { UserProgressData } from "@/types/user";
import { LessonData } from "@/types/lesson";

const Home = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [longLoading, setLongLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgressData>({ units: [] });
  const [recentLessons, setRecentLessons] = useState<LessonData[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  const { getUserStreakData, getUserProgressData } = useUserProgress();

  useEffect(() => {
    const longLoadingTimeout = setTimeout(() => {
      if (loading) {
        setLongLoading(true);
      }
    }, 3000);

    loadUserData();

    return () => {
      clearTimeout(longLoadingTimeout);
    };
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      // Get user streak data
      const streakData = await getUserStreakData();
      
      // Get user progress data for lessons
      const progressData = await getUserProgressData();
      
      // Get all units and lessons
      const units = await contentService.getUnits();
      
      // Transform the data into the format needed by our components
      const transformedUnits = [];
      
      for (const unit of units) {
        const unitLessons = await contentService.getLessonsByUnit(unit.id);
        
        // Calculate unit progress
        const totalLessons = unitLessons.length;
        let completedLessons = 0;
        let foundCurrentLesson = false;
        
        const transformedLessons = unitLessons.map((lesson, index) => {
          const progress = progressData.find(p => p.lesson_id === lesson.id);
          const isCompleted = progress?.is_completed || false;
          let isCurrent = false;
          
          // The first incomplete lesson should be marked as current
          if (!isCompleted && !foundCurrentLesson) {
            isCurrent = true;
            foundCurrentLesson = true;
          }
          
          // A lesson is locked if:
          // 1. It's not completed AND
          // 2. Either it's not the first lesson (index > 0) AND the previous lesson is not completed
          const isLocked = !isCompleted && index > 0 && 
            (unitLessons[index - 1] && 
             !progressData.find(p => 
               p.lesson_id === unitLessons[index - 1].id && p.is_completed
             ));
          
          if (isCompleted) {
            completedLessons++;
          }
          
          // Determine lesson type (standard, review, boss, treasure)
          let type = "standard";
          if (index % 5 === 4) type = "boss"; // Every 5th lesson is a boss
          else if (index % 5 === 3) type = "treasure"; // Every 4th lesson is a treasure chest
          else if (index % 3 === 2) type = "review"; // Every 3rd lesson is a review
          
          return {
            id: lesson.id,
            title: lesson.title,
            isCompleted,
            isCurrent,
            isLocked,
            xpReward: lesson.xp_reward || 10,
            type
          };
        });
        
        const unitProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        
        transformedUnits.push({
          id: unit.id,
          title: unit.name,
          progress: unitProgress,
          lessons: transformedLessons
        });
      }
      
      // Sort units by order_index
      transformedUnits.sort((a, b) => {
        const unitA = units.find(u => u.id === a.id);
        const unitB = units.find(u => u.id === b.id);
        return unitA.order_index - unitB.order_index;
      });
      
      // Find recent lessons (completed ones)
      const recentLessonsList = [];
      
      for (const progress of progressData) {
        // Find the lesson and its unit
        let lesson = null;
        let unit = null;
        
        for (const u of units) {
          const unitLessons = await contentService.getLessonsByUnit(u.id);
          const foundLesson = unitLessons.find(l => l.id === progress.lesson_id);
          
          if (foundLesson) {
            lesson = foundLesson;
            unit = u;
            break;
          }
        }
        
        if (lesson && unit && progress.is_completed) {
          recentLessonsList.push({
            id: lesson.id,
            title: lesson.title,
            unitId: unit.id,
            unitName: unit.name,
            xpReward: lesson.xp_reward,
            completedAt: progress.last_attempted_at,
            isCompleted: true
          });
        }
      }
      
      // Sort recent lessons by last attempted date (most recent first)
      recentLessonsList.sort((a, b) => {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      });
      
      // Limit to 5 recent lessons
      const limitedRecentLessons = recentLessonsList.slice(0, 5);
      
      setUserProgress({ units: transformedUnits });
      setRecentLessons(limitedRecentLessons);
      setStreak(streakData.current_streak);
      setTotalXp(streakData.total_xp);
      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("Failed to load your progress. Please try again.");
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSelectUnit = (unitId: string) => {
    navigate(`/units/${unitId}`);
  };

  const handleSelectLesson = (lessonId: string) => {
    navigate(`/lessons/${lessonId}`);
  };

  if (loading) {
    return (
      <LoadingState
        username={profile?.username || user?.email.split('@')[0] || "User"}
        retry={loadUserData}
        longLoading={longLoading}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        username={profile?.username || user?.email.split('@')[0] || "User"}
        error={error}
        handleRefresh={handleRefresh}
      />
    );
  }

  return (
    <HomeContent
      userProgress={userProgress}
      recentLessons={recentLessons}
      streak={streak}
      totalXp={totalXp}
      onSelectUnit={handleSelectUnit}
      onSelectLesson={handleSelectLesson}
    />
  );
};

export default Home;
