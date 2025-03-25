import { Link } from "react-router-dom";
import { useTheme } from "@/lib/theme-provider";

type UserProgressProps = {
  activeCourse: {
    title: string;
    imageSrc: string;
  };
  points: number;
};

export function UserProgress({
  activeCourse,
  points
}: UserProgressProps) {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-col gap-y-6 w-full border border-border p-5 rounded-xl shadow-md bg-panel-bg">
      <div className="flex items-center gap-x-4">
        <div className={`p-2 rounded-xl ${
          isDark ? "bg-slate-700 shadow-inner" : "bg-slate-100 shadow-sm"
        }`}>
          <div className="rounded-md w-16 h-12 flex items-center justify-center overflow-hidden">
            <img
              src="/japan-flag.svg"
              alt="Japan"
              className="w-16 h-auto object-contain"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-secondary">
            Active Course
          </p>
          <p className="text-xl font-bold text-primary">
            {activeCourse.title}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-start gap-x-6">
        <div className="flex items-center gap-x-2">
          <p className="text-secondary">
            Total XP:
          </p>
          <p className="text-blue-500 text-xl font-bold">
            {points}
          </p>
        </div>
      </div>
    </div>
  );
} 