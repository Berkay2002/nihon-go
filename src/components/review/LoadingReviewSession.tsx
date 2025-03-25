
import React from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const LoadingReviewSession: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading review items...</p>
      </div>
    </div>
  );
};
