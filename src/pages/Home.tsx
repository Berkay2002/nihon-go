
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
import { UserStreak } from "@/services/userProgress/types";

const Home = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isGuest, profile } = useAuth();
  const { getUserStreakData, getUserProgressData } = useUserProgress();
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

  // Set a loading timeout to show a message first, then show an error if it takes too long
  useEffect(() => {
    let shortTimeoutId: number | null = null;
    let longTimeoutId: number | null = null;

    if (loading && !error) {
      // First timeout - show "taking longer than expected" message after 5 seconds
      shortTimeoutId = window.setTimeout(() => {
        setLongLoading(true);
        toast.info("Loading is taking longer than expected", {
          description: "Please be patient or refresh the page if this continues.",
        });
      }, 5000); 
      
      // Second timeout - treat as an error after 15 seconds total
      longTimeoutId = window.setTimeout(() => {
        setLoading(false);
        setError("Loading took too long. Please refresh the page.");
        toast.error("Loading data failed", {
          description: "Please refresh the page or try again later.",
        });
        
        // Provide fallback data for better UX
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
      }, 15000);
    }
    
    return () => {
      if (shortTimeoutId) window.clearTimeout(shortTimeoutId);
      if (longTimeoutId) window.clearTimeout(longTimeoutId);
    };
  }, [loading, error, isGuest]);

  useEffect(() => {
    const fetchUserData = async () => {
      // Don't fetch if auth is still loading
      if (authLoading) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Create safer timeout promises
        const createTimeoutPromise = (ms: number, name: string) => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`${name} timeout after ${ms}ms`)), ms)
          );
        
        // Fetch streak and progress data with timeout safety
        const streakPromise = isGuest 
          ? getUserStreakData() 
          : Promise.race([
              getUserStreakData(),
              createTimeoutPromise(8000, "Streak data fetch")
            ]);
            
        const progressPromise = isGuest
          ? getUserProgressData()
          : Promise.race([
              getUserProgressData(),
              createTimeoutPromise(8000, "Progress data fetch")
            ]);
        
        // Use Promise.allSettled to ensure we get a response even if one fails
        const results = await Promise.allSettled([streakPromise, progressPromise]);
        
        // Process the results with proper type checking
        const streakResult = results[0];
        const progressResult = results[1];
        
        const streakData: UserStreak | null = 
          streakResult.status === 'fulfilled' ? streakResult.value as UserStreak : null;
        
        const progressData = 
          progressResult.status === 'fulfilled' ? progressResult.value : null;
        
        // Process user data based on auth status
        let processedData;
        if (isGuest) {
          processedData = {
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
        } else {
          processedData = {
            streak: streakData?.current_streak || 0,
            level: streakData?.level || 1,
            xp: streakData?.daily_xp || 0,
            totalXp: streakData?.total_xp || 0,
            dailyGoal: streakData?.daily_goal || 50,
            recentLessons: [], // Would be processed from progressData
            nextLesson: {
              id: "demo-lesson-1", // Fallback
              title: "Introduction to Japanese",
              unitName: "Basics",
              xp_reward: 10
            }
          };
        }
        
        setUserData(processedData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please try again.");
        
        // Provide fallback data for better UX
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
      } finally {
        // Ensure loading is always set to false, even on errors
        setLoading(false);
        setLongLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, authLoading, getUserStreakData, getUserProgressData, isGuest]);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Show appropriate loading/error state with better UX
  if (loading) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
        <HomeHeader 
          username={profile?.username || user?.user_metadata?.username || "Friend"} 
          isGuest={isGuest} 
        />
        
        <div className="py-8">
          <LoadingSpinner />
          <p className="text-center text-muted-foreground mt-4">
            {longLoading 
              ? "Still loading... This is taking longer than usual." 
              : "Loading your progress..."}
          </p>
          
          {longLoading && (
            <div className="flex justify-center mt-4">
              <Button onClick={handleRefresh} size="sm" variant="outline">
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
        <HomeHeader 
          username={profile?.username || user?.user_metadata?.username || "Friend"} 
          isGuest={isGuest} 
        />
        
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
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 pt-6 pb-20 animate-fade-in">
      <HomeHeader 
        username={profile?.username || user?.user_metadata?.username || "Friend"} 
        isGuest={isGuest} 
      />
      
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
    </div>
  );
};

export default Home;
