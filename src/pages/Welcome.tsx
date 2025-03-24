
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Welcome = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isGuest } = useAuth();

  useEffect(() => {
    if (!isLoading && (isAuthenticated || isGuest)) {
      navigate("/app");
    }
  }, [isAuthenticated, isLoading, isGuest, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="font-bold text-5xl md:text-6xl mb-2 bg-clip-text text-transparent bg-gradient-to-r from-nihongo-red to-nihongo-blue">
          NihonGo
        </h1>
        
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-md">
          Learn Japanese step by step, with personalized lessons and interactive exercises.
        </p>
        
        <div className="space-y-4 w-full max-w-xs">
          <Button 
            onClick={() => navigate("/auth")}
            className="w-full h-12 text-lg bg-nihongo-blue hover:bg-nihongo-blue/90"
          >
            Get Started
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-nihongo-red/10 rounded-full flex items-center justify-center mb-3">
              <span className="text-nihongo-red text-2xl">あ</span>
            </div>
            <h3 className="font-semibold mb-1">Learn Hiragana</h3>
            <p className="text-gray-600 text-sm">Master the basic Japanese alphabet</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-nihongo-blue/10 rounded-full flex items-center justify-center mb-3">
              <span className="text-nihongo-blue text-2xl">語</span>
            </div>
            <h3 className="font-semibold mb-1">Build Vocabulary</h3>
            <p className="text-gray-600 text-sm">Learn practical words and phrases</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-nihongo-gold/10 rounded-full flex items-center justify-center mb-3">
              <span className="text-nihongo-gold text-2xl">文</span>
            </div>
            <h3 className="font-semibold mb-1">Practice Speaking</h3>
            <p className="text-gray-600 text-sm">Gain confidence in conversations</p>
          </div>
        </div>
      </div>
      
      <footer className="pb-4 pt-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} NihonGo. Japanese learning made simple.</p>
      </footer>
    </div>
  );
};

export default Welcome;
