
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SkillPracticeCard } from "@/components/review/SkillPracticeCard";
import { SectionHeader } from "@/components/review/SectionHeader";
import { MistakesIcon, WordsIcon, SRSReviewIcon } from "@/components/review/SkillPracticeIcons";

const Reviews = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleSkillPracticeClick = (type: string) => {
    navigate(`/app/practice/${type}`);
  };

  const handleSRSReviewClick = () => {
    navigate(`/app/reviews/vocabulary`);
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-4 pb-20">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="space-y-6">
          {/* Skill Practice Section */}
          <div>
            <SectionHeader title="Skill practice" />
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0 space-y-3">
                <SkillPracticeCard
                  title="Mistakes"
                  description="Practice exercises you found challenging"
                  icon={<MistakesIcon />}
                  onClick={() => handleSkillPracticeClick('mistakes')}
                />
                <SkillPracticeCard
                  title="Words"
                  description="Build your vocabulary with words from your lessons"
                  icon={<WordsIcon />}
                  onClick={() => handleSkillPracticeClick('words')}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* SRS Reviews Section - This connects to the existing review functionality */}
          <div>
            <SectionHeader title="Reviews" />
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                <SkillPracticeCard
                  title="SRS Review"
                  description="Review your vocabulary with spaced repetition"
                  icon={<SRSReviewIcon />}
                  onClick={handleSRSReviewClick}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
