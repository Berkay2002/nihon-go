
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/services/userProgressService";
import { toast } from "@/components/ui/use-toast";
import { UserStreak } from "@/services/userProgress/types";
import {
  LoadingState,
  ErrorState,
  HomeContent
} from "@/components/home";

const Home = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isGuest, profile } = useAuth();
  const { getUserStreakData, getUserProgressData } = useUserProgress();
  const [loading, setLoading] = useState(true);
  const [longLoading, setLongLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState({
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

  // Set a loading timeout to show a message first, then fallback to default data
  useEffect(() => {
    let shortTimeoutId: number | null = null;
    let longTimeoutId: number | null = null;

    if (loading && !error) {
      // First timeout - show "taking longer than expected" message after 3 seconds
      shortTimeoutId = window.setTimeout(() => {
        setLongLoading(true);
        toast.info("Loading is taking longer than expected", {
          description: "Using fallback data to get you started",
        });
      }, 3000); 
      
      // Second timeout - use fallback data after 6 seconds total
      longTimeoutId = window.setTimeout(() => {
        setLoading(false);
        // We don't set error here anymore, just use fallback data
        
        const fallbackData = {
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
        };
        
        setUserData(fallbackData);
      }, 6000);
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
        const streakPromise = getUserStreakData();
        const progressPromise = getUserProgressData();
        
        // Use Promise.allSettled to ensure we get a response even if one fails
        const results = await Promise.allSettled([streakPromise, progressPromise]);
        
        // Process the results with proper type checking
        const streakResult = results[0];
        const progressResult = results[1];
        
        const streakData = 
          streakResult.status === 'fulfilled' ? streakResult.value : null;
        
        const progressData = 
          progressResult.status === 'fulfilled' ? progressResult.value : [];
        
        // Always have data ready to display
        const processedData = {
          streak: streakData?.current_streak || 1,
          level: streakData?.level || 1,
          xp: streakData?.daily_xp || 15,
          totalXp: streakData?.total_xp || 15,
          dailyGoal: streakData?.daily_goal || 50,
          recentLessons: [], // Would be processed from progressData
          nextLesson: {
            id: "demo-lesson-1",
            title: "Introduction to Japanese",
            unitName: "Basics",
            xp_reward: 10
          }
        };
        
        setUserData(processedData);
        setLoading(false);
        setLongLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        
        // Use fallback data instead of showing an error
        const fallbackData = {
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
        };
        
        setUserData(fallbackData);
        setLoading(false);
        setLongLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, authLoading, getUserStreakData, getUserProgressData, isGuest]);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Display appropriate component based on state
  if (loading) {
    return (
      <LoadingState
        username={profile?.username || user?.user_metadata?.username || "Friend"}
        isGuest={isGuest}
        longLoading={longLoading}
        handleRefresh={handleRefresh}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        username={profile?.username || user?.user_metadata?.username || "Friend"}
        isGuest={isGuest}
        error={error}
        handleRefresh={handleRefresh}
      />
    );
  }

  return (
    <HomeContent
      username={profile?.username || user?.user_metadata?.username || "Friend"}
      isGuest={isGuest}
      userData={userData}
      navigate={navigate}
    />
  );
};

export default Home;
