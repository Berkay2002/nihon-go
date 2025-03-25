
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SkillPracticeCard } from "@/components/review/SkillPracticeCard";
import { SectionHeader, SuperBadge, MaxBadge, NewBadge } from "@/components/review/SectionHeader";
import { MistakesIcon, WordsIcon, ListenIcon, StoriesIcon, SRSReviewIcon } from "@/components/review/SkillPracticeIcons";

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
          {/* Conversation Section */}
          <div>
            <SectionHeader 
              title="Conversation" 
              badge={<MaxBadge />}
            />
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                <SkillPracticeCard
                  title="Video Call"
                  icon={
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="6" width="14" height="12" rx="2" fill="white" />
                        <path d="M16 10L22 7V17L16 14" fill="white" />
                      </svg>
                    </div>
                  }
                  onClick={() => {}}
                  badge="NEW"
                />
              </CardContent>
            </Card>
          </div>

          {/* Skill Practice Section */}
          <div>
            <SectionHeader 
              title="Skill practice" 
              badge={<SuperBadge />}
            />
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
                <SkillPracticeCard
                  title="Listen"
                  description="Train your listening comprehension"
                  icon={<ListenIcon />}
                  onClick={() => {}}
                />
              </CardContent>
            </Card>
          </div>

          {/* Collections Section */}
          <div>
            <SectionHeader title="Collections" />
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                <SkillPracticeCard
                  title="Stories"
                  description="Read and listen to short stories"
                  icon={<StoriesIcon />}
                  onClick={() => {}}
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
