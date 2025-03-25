import { Link } from "react-router-dom";
import { useTheme } from "@/lib/theme-provider";

type UserProgressProps = {
  activeCourse: {
    title: string;
    imageSrc: string;
  };
  hearts: number;
  points: number;
};

export function UserProgress({
  activeCourse,
  hearts,
  points
}: UserProgressProps) {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-col gap-y-6 w-full border border-border p-5 rounded-xl shadow-md bg-panel-bg">
      <div className="flex items-center gap-x-4">
        <div className={`p-2 rounded-xl ${
          isDark ? "bg-slate-700 shadow-inner" : "bg-slate-100 shadow-sm"
        }`}>
          <div className="rounded-md w-16 h-16 flex items-center justify-center overflow-hidden">
            <img
              src={activeCourse.imageSrc}
              alt={activeCourse.title}
              className="w-14 h-14 object-contain"
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
          <img
            src="/heart.svg"
            alt="Heart"
            className="h-8 w-8"
          />
          <p className="text-rose-500 text-xl font-bold">
            {hearts}
          </p>
        </div>
        <div className="flex items-center gap-x-2">
          <img
            src="/points.svg"
            alt="Points"
            className="h-8 w-8"
          />
          <p className="text-amber-500 text-xl font-bold">
            {points}
          </p>
        </div>
      </div>
    </div>
  );
} 