import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";

type StreakProps = {
  currentStreak: number;
}

export function DailyStreak({ currentStreak = 0 }: StreakProps) {
  const { isDark } = useTheme();
  
  // Calculate streak status
  const streakStatus = currentStreak >= 7 ? "on-fire" : 
                       currentStreak >= 3 ? "going-strong" : 
                       currentStreak > 0 ? "just-started" : "inactive";
  
  // Generate message based on streak
  const getMessage = () => {
    if (currentStreak === 0) return "Start your learning streak!";
    if (currentStreak < 3) return `Day ${currentStreak}! Keep it up!`;
    if (currentStreak < 7) return `${currentStreak} day streak! You're doing great!`;
    return `${currentStreak} day streak! You're on fire!`;
  };

  return (
    <div className="border border-border rounded-xl p-5 w-full shadow-md bg-panel-bg">
      <div className="flex flex-col items-center justify-center">
        <div className="relative mb-3">
          <div className="text-4xl">
            {streakStatus === "on-fire" ? "🔥" : 
             streakStatus === "going-strong" ? "✨" : 
             streakStatus === "just-started" ? "🌱" : "⏱️"}
          </div>
          <div className={`absolute -bottom-1 -right-1 rounded-full px-2 py-0.5 text-sm font-bold shadow-md ${
            isDark 
              ? "bg-slate-700 text-white" 
              : "bg-slate-200 text-slate-700"
          }`}>
            {currentStreak}
          </div>
        </div>
        <h3 className="font-bold text-lg mb-1 text-primary">
          Daily Streak
        </h3>
        <p className="text-center mb-4 text-secondary">
          {getMessage()}
        </p>
        <Button size="lg" variant="default" className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-lg" asChild>
          <Link to="/practice">
            Continue Today's Practice
          </Link>
        </Button>
      </div>
    </div>
  );
} 