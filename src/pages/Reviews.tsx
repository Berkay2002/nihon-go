
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewSessionContainer } from "@/components/review";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, AlertTriangle } from "lucide-react";

const Reviews = () => {
  const [activeTab, setActiveTab] = useState("vocabulary");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-4 pb-20">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Review Center</CardTitle>
            <CardDescription>
              Practice vocabulary and revisit exercises you found challenging
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Tabs defaultValue="vocabulary" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="vocabulary" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Vocabulary Review</span>
            </TabsTrigger>
            <TabsTrigger value="difficult" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Difficult Exercises</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="vocabulary" className="mt-0">
            <ReviewSessionContainer reviewType="vocabulary" />
          </TabsContent>
          
          <TabsContent value="difficult" className="mt-0">
            <ReviewSessionContainer reviewType="difficult" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reviews;
