// src/components/UnitBannerCard.tsx
import { Button } from "@/components/ui/button";

interface UnitBannerCardProps {
  title: string;
  description: string;
  onContinue: () => void;
}

const UnitBannerCard = ({ title, description, onContinue }: UnitBannerCardProps) => {
  return (
    <div className="w-full bg-green-500 text-white p-5 rounded-xl mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-white/90">{description}</p>
        </div>
        <Button 
          variant="secondary" 
          className="bg-white text-green-500 hover:bg-white/90 border-0"
          onClick={onContinue}
        >
          <span className="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <path d="M17.5 6.5h.01"></path>
            </svg>
          </span>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default UnitBannerCard;