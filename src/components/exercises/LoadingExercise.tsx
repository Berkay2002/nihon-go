
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingExercise = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pb-20 md:pb-4">
      <div className="container max-w-md mx-auto px-4 pt-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        
        {/* Progress Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        
        {/* Exercise Question Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8 border border-slate-200 dark:border-slate-700">
          <Skeleton className="h-6 w-2/3 mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          
          {/* Answer Options */}
          <div className="space-y-3 mt-6">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
        
        {/* Button Skeleton */}
        <div className="fixed md:static bottom-16 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t md:border-t-0 md:mt-8 border-slate-200 dark:border-slate-700 shadow-lg md:shadow-none z-50">
          <div className="container max-w-md mx-auto">
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
