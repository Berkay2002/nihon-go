import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/services/userProgressService";
import { 
  HomeHeader, 
  StatsSection, 
  ContinueLearningSection, 
  RecentLessonsSection, 
  GuestPromotion 
} from "@/components/home";
import { GuestMessage } from "@/components/shared/GuestMessage";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const Home = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isGuest, profile } = useAuth();
  const { getUserStreakData, getUserProgressData } = useUserProgress();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    streak: 0,
    level: 1,
    xp: 0,
    totalXp: 0,
    dailyGoal: 50,
    recentLessons: [],
    nextLesson: null
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (authLoading) return;
      
      try {
        setLoading(true);
        
        // Fetch streak and progress data
        const [streakData, progressData] = await Promise.all([
          getUserStreakData(),
          getUserProgressData()
        ]);
        
        // Process user data based on auth status
        const processedData = await processUserData(user, isGuest, streakData, progressData);
        setUserData(processedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, authLoading, getUserStreakData, getUserProgressData, isGuest]);

  const processUserData = async (user, isGuest, streakData, progressData) => {
    // This function would process the raw data into the structured userData format
    // Moved to a separate function to keep the component cleaner
    
    // For the refactoring demo, we'll just return either mocked guest data or the fetched data
    if (isGuest) {
      return {
        streak: 1,
        level: 1,
        xp: 15,
        totalXp: 15,
        dailyGoal: 50,
        recentLessons: [
          {
            id: "demo-lesson-1",
            title: "Introduction to Hiragana",
            unitName: "Basics",
            isCompleted: false,
            accuracy: 0,
            xpEarned: 0
          }
        ],
        nextLesson: {
          id: "demo-lesson-1",
          title: "Introduction to Japanese",
          unitName: "Basics",
          xp_reward: 10
        }
      };
    }
    
    // For authenticated users, use the actual data
    return {
      streak: streakData?.current_streak || 0,
      level: streakData?.level || 1,
      xp: streakData?.daily_xp || 0,
      totalXp: streakData?.total_xp || 0,
      dailyGoal: streakData?.daily_goal || 50,
      // These would be processed from progressData and contentService
      recentLessons: [], // In a real implementation, this would be filled with actual data
      nextLesson: null // In a real implementation, this would be determined based on progress
    };
  };

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <HomeHeader 
        username={profile?.username || user?.user_metadata?.username || "Friend"} 
        isGuest={isGuest} 
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {isGuest && <GuestMessage navigate={navigate} />}
          
          <StatsSection 
            streak={userData.streak} 
            level={userData.level} 
            totalXp={userData.totalXp}
            xp={userData.xp}
            dailyGoal={userData.dailyGoal}
          />

          <ContinueLearningSection 
            nextLesson={userData.nextLesson} 
            navigate={navigate} 
          />
          
          {userData.recentLessons.length > 0 && (
            <RecentLessonsSection 
              recentLessons={userData.recentLessons} 
              isGuest={isGuest}
              navigate={navigate} 
            />
          )}

          {isGuest && <GuestPromotion navigate={navigate} />}
        </>
      )}
    </div>
  );
};

export default Home;
