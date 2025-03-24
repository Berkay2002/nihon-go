
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to NihonGo",
      subtitle: "Learn Japanese in small, fun lessons",
      description: "Master vocabulary, grammar, and hiragana with our gamified approach.",
      buttonText: "Next",
    },
    {
      title: "Bite-sized Lessons",
      subtitle: "Learn in just 5 minutes a day",
      description: "Short, focused exercises help you learn efficiently and build a daily habit.",
      buttonText: "Next",
    },
    {
      title: "Track Your Progress",
      subtitle: "Earn XP and unlock new content",
      description: "Keep your streak alive and watch your Japanese skills improve daily.",
      buttonText: "Get Started",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-nihongo-lightGray p-4">
      <div className="w-full max-w-md">
        <Card className="glass-card overflow-hidden">
          <div className="p-6">
            <div className="flex justify-center mb-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-nihongo-red to-nihongo-blue flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white">日</span>
              </div>
            </div>
            
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-3xl font-bold mb-2 text-gradient">
                {slides[currentSlide].title}
              </h1>
              <h2 className="text-xl font-medium mb-4 text-nihongo-blue">
                {slides[currentSlide].subtitle}
              </h2>
              <p className="text-nihongo-text">
                {slides[currentSlide].description}
              </p>
            </div>

            <div className="flex justify-center mb-8">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 mx-1 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-nihongo-red w-8"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="w-full bg-nihongo-red hover:bg-nihongo-red/90 text-white font-semibold py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center group"
            >
              <span className="mr-2">{slides[currentSlide].buttonText}</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Welcome;
