import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/lib/theme-provider";
// Define the QUESTS constant since it was imported in the original code
const QUESTS = [
  {
    title: "Reach Level 5 in Japanese",
    value: 5,
  },
  {
    title: "Earn 50 points",
    value: 50,
  },
  {
    title: "Complete 20 lessons",
    value: 20,
  },
  {
    title: "Practice 3 days in a row",
    value: 3,
  },
];

type QuestsProps = {
  points: number;
};

export function Quests({ points }: QuestsProps) {
  const { isDark } = useTheme();

  return (
    <div className="border border-border rounded-xl p-5 w-full shadow-md bg-panel-bg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-xl text-primary">
          Daily Quests
        </h3>
        <Button 
          asChild 
          variant="ghost" 
          className={isDark 
            ? "text-slate-300 hover:text-white hover:bg-slate-700"
            : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }
        >
          <Link 
            to="/quests"
            className="text-sm hover:text-primary dark:hover:text-white text-black"
          >
            View all
          </Link>
        </Button>
      </div>
      <div className="space-y-6">
        {QUESTS.map((quest) => {
          const progress = (points / quest.value) * 100;
          const isCompleted = progress >= 100;

          return (
            <div key={quest.title} className={`p-3 rounded-lg ${
              isDark ? "bg-white" : "bg-slate-100 shadow-sm"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-primary">
                  {quest.title}
                </p>
                <p className="text-sm font-medium text-secondary">
                  {Math.min(points, quest.value)}/{quest.value}
                </p>
              </div>
              <Progress 
                value={isCompleted ? 100 : progress} 
                className={`h-2 ${isCompleted ? "bg-green-500" : ""}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
} 