
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
import { toast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isGuest, profile } = useAuth();
  const { getUserStreakData, getUserProgressData } = useUserProgress();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    // Set a loading timeout to prevent infinite loading
    const loadingTimeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Loading took too long. Please refresh the page.");
        toast.error("Loading data failed", {
          description: "Please refresh the page or try again later.",
        });
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(loadingTimeoutId);
  }, [loading]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (authLoading) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch streak and progress data with timeout safety
        const fetchPromises = [
          Promise.race([
            getUserStreakData(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Streak data fetch timeout")), 5000)
            )
          ]),
          Promise.race([
            getUserProgressData(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Progress data fetch timeout")), 5000)
            )
          ])
        ];
        
        const [streakData, progressData] = await Promise.all(fetchPromises);
        
        // Process user data based on auth status
        const processedData = await processUserData(user, isGuest, streakData, progressData);
        setUserData(processedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please try again.");
        setLoading(false);
        
        // Show fallback data for better UX
        if (isGuest) {
          setUserData({
            streak: 1,
            level: 1,
            xp: 15,
            totalXp: 15,
            dailyGoal: 50,
            recentLessons: [],
            nextLesson: {
              id: "demo-lesson-1",
              title: "Introduction to Japanese",
              unitName: "Basics",
              xp_reward: 10
            }
          });
        }
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
      nextLesson: {
        id: "demo-lesson-1",
        title: "Introduction to Japanese",
        unitName: "Basics",
        xp_reward: 10
      } // Fallback lesson to prevent empty states
    };
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <HomeHeader 
        username={profile?.username || user?.user_metadata?.username || "Friend"} 
        isGuest={isGuest} 
      />

      {loading ? (
        <div className="py-8">
          <LoadingSpinner />
          <p className="text-center text-muted-foreground mt-4">Loading your progress...</p>
        </div>
      ) : error ? (
        <Card className="my-8 border-red-200">
          <CardContent className="pt-6 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
            <p className="text-center text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} className="bg-nihongo-blue hover:bg-nihongo-blue/90">
              Refresh
            </Button>
          </CardContent>
        </Card>
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
