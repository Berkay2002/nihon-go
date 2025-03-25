
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/services/userProgressService";
import { LoadingState } from "@/components/home/LoadingState";
import { ErrorState } from "@/components/home/ErrorState";
import { HomeContent } from "@/components/home/HomeContent";
import contentService from "@/services/contentService";

const Home = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [longLoading, setLongLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    streak: 0,
    level: 1,
    xp: 0,
    totalXp: 0,
    dailyGoal: 50,
    recentLessons: [],
    nextLesson: null
  });

  const { getUserStreakData, getUserProgressData } = useUserProgress();

  useEffect(() => {
    // Increased timeout for long loading indicator from 3000ms to 5000ms
    const longLoadingTimeout = setTimeout(() => {
      if (loading) {
        setLongLoading(true);
      }
    }, 5000);

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
        setLoading(false);
        return;
      }

      // Get user streak data
      const streakData = await getUserStreakData();
      
      // Get user progress data for lessons
      const progressData = await getUserProgressData();
      
      // Continue with data processing even if some data is missing
      let units = [];
      try {
        units = await contentService.getUnits();
      } catch (error) {
        console.error("Error fetching units:", error);
        units = [];
      }
      
      const lessons = [];
      
      for (const unit of units) {
        try {
          const unitLessons = await contentService.getLessonsByUnit(unit.id);
          for (const lesson of unitLessons) {
            lessons.push({
              ...lesson,
              unitName: unit.name
            });
          }
        } catch (error) {
          console.error(`Error fetching lessons for unit ${unit.id}:`, error);
          // Continue with other units
        }
      }
      
      // Process data only if we have lessons
      if (lessons.length > 0) {
        // Sort lessons by order_index and unit order_index
        lessons.sort((a, b) => {
          const unitA = units.find(u => u.id === a.unit_id);
          const unitB = units.find(u => u.id === b.unit_id);
          
          if (!unitA || !unitB) return 0;
          
          if (unitA.order_index !== unitB.order_index) {
            return unitA.order_index - unitB.order_index;
          }
          
          return a.order_index - b.order_index;
        });
        
        // Find recent lessons (completed ones)
        const recentLessons = [];
        
        for (const progress of progressData) {
          const lesson = lessons.find(l => l.id === progress.lesson_id);
          if (lesson && progress.is_completed) {
            recentLessons.push({
              id: lesson.id,
              title: lesson.title,
              unitName: lesson.unitName,
              isCompleted: progress.is_completed,
              accuracy: progress.accuracy,
              xpEarned: progress.xp_earned
            });
          }
        }
        
        // Sort recent lessons by last attempted date (most recent first)
        recentLessons.sort((a, b) => {
          const progressA = progressData.find(p => p.lesson_id === a.id);
          const progressB = progressData.find(p => p.lesson_id === b.id);
          
          if (!progressA || !progressB) return 0;
          
          return new Date(progressB.last_attempted_at || 0).getTime() - 
                new Date(progressA.last_attempted_at || 0).getTime();
        });
        
        // Limit to 5 recent lessons
        const limitedRecentLessons = recentLessons.slice(0, 5);
        
        // Find next lesson (first incomplete lesson)
        let nextLesson = null;
        
        for (const lesson of lessons) {
          const progress = progressData.find(p => p.lesson_id === lesson.id);
          
          // If lesson not started or not completed, this is the next lesson
          if (!progress || !progress.is_completed) {
            const unit = units.find(u => u.id === lesson.unit_id);
            
            if (unit) {
              nextLesson = {
                id: lesson.id,
                title: lesson.title,
                unitName: unit.name,
                xp_reward: lesson.xp_reward
              };
              
              break;
            }
          }
        }
        
        setUserData({
          streak: streakData.current_streak,
          level: streakData.level,
          xp: streakData.daily_xp,
          totalXp: streakData.total_xp,
          dailyGoal: streakData.daily_goal,
          recentLessons: limitedRecentLessons,
          nextLesson
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      // Don't show the error to the user, instead show the dashboard with default data
      setUserData({
        streak: 1,
        level: 1,
        xp: 0,
        totalXp: 0,
        dailyGoal: 50,
        recentLessons: [],
        nextLesson: null
      });
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <LoadingState
        username={profile?.username || user?.email?.split('@')[0] || "User"}
        retry={loadUserData}
        longLoading={longLoading}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        username={profile?.username || user?.email?.split('@')[0] || "User"}
        error={error}
        handleRefresh={handleRefresh}
      />
    );
  }

  return (
    <HomeContent
      username={profile?.username || user?.email?.split('@')[0] || "User"}
      userData={userData}
      navigate={navigate}
    />
  );
};

export default Home;
