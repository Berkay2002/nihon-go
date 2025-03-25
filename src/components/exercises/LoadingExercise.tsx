
import { useTheme } from "@/providers/ThemeProvider";

export const LoadingExercise = () => {
  const { theme } = useTheme();
  
  return (
    <div className="container max-w-md mx-auto px-4 pt-6 flex items-center justify-center h-[80vh]">
      <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'dark' ? 'border-nihongo-gold' : 'border-nihongo-red'}`}></div>
    </div>
  );
};
