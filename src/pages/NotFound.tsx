
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-nihongo-lightGray p-6 animate-fade-in">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-nihongo-red/10 flex items-center justify-center">
            <Ghost className="w-10 h-10 text-nihongo-red" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-gradient">404</h1>
        <p className="text-xl text-nihongo-blue mb-6">This page doesn't exist</p>
        <p className="text-muted-foreground mb-8">
          The page you're looking for couldn't be found. Let's get you back on track.
        </p>
        
        <Button 
          className="bg-nihongo-red hover:bg-nihongo-red/90 text-white py-6 px-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => navigate("/")}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
