
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, Database, RefreshCw } from "lucide-react";
import seedDataService from "@/services/seedDataService";
import { toast } from "sonner";

// Interface for database status
interface DatabaseStatus {
  units: { exists: boolean; count: number };
  lessons: { exists: boolean; count: number };
  vocabulary: { exists: boolean; count: number };
  exercises: { exists: boolean; count: number };
  message: string;
}

const DatabaseDebugger: React.FC = () => {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);

  // Check database status
  const checkStatus = async () => {
    setLoading(true);
    try {
      const result = await seedDataService.getDatabaseStatus();
      setStatus(result);
    } catch (error) {
      console.error("Error checking database status:", error);
      toast.error("Failed to check database status");
    } finally {
      setLoading(false);
    }
  };

  // Run seed function
  const runSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const result = await seedDataService.seedInitialData();
      setSeedResult({
        success: !!result,
        message: result ? "Database seeded successfully" : "Failed to seed database"
      });
      
      if (result) {
        toast.success("Database seeded successfully");
        // Refresh status after seeding
        await checkStatus();
      } else {
        toast.error("Failed to seed database");
      }
    } catch (error) {
      console.error("Error seeding database:", error);
      toast.error("Failed to seed database");
      setSeedResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setSeeding(false);
    }
  };

  // Check status on initial load
  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-800 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status ? (
          <div className="space-y-4">
            {/* Status Overview */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex justify-between items-center p-2 rounded bg-white">
                <span className="font-medium">Units</span>
                <Badge 
                  variant={status.units.count > 0 ? "default" : "destructive"}
                  className={status.units.count > 0 ? "bg-green-500" : ""}
                >
                  {status.units.count}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white">
                <span className="font-medium">Lessons</span>
                <Badge 
                  variant={status.lessons.count > 0 ? "default" : "destructive"}
                  className={status.lessons.count > 0 ? "bg-green-500" : ""}
                >
                  {status.lessons.count}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white">
                <span className="font-medium">Vocabulary</span>
                <Badge 
                  variant={status.vocabulary.count > 0 ? "default" : "destructive"}
                  className={status.vocabulary.count > 0 ? "bg-green-500" : ""}
                >
                  {status.vocabulary.count}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white">
                <span className="font-medium">Exercises</span>
                <Badge 
                  variant={status.exercises.count > 0 ? "default" : "destructive"}
                  className={status.exercises.count > 0 ? "bg-green-500" : ""}
                >
                  {status.exercises.count}
                </Badge>
              </div>
            </div>
            
            {/* Status Message */}
            <div className={`p-3 rounded flex gap-2 items-start ${
              status.units.count > 0 && status.lessons.count > 0 
                ? "bg-green-100 text-green-800" 
                : "bg-amber-100 text-amber-800"
            }`}>
              {status.units.count > 0 && status.lessons.count > 0 
                ? <Check className="h-5 w-5 text-green-600 mt-0.5" /> 
                : <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              }
              <p>{status.message}</p>
            </div>
            
            {/* Seed Result */}
            {seedResult && (
              <div className={`p-3 rounded flex gap-2 items-start ${
                seedResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {seedResult.success 
                  ? <Check className="h-5 w-5 text-green-600 mt-0.5" /> 
                  : <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                }
                <p>{seedResult.message}</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={checkStatus} 
                disabled={loading}
                className="flex gap-1"
              >
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                Refresh Status
              </Button>
              
              {(status.units.count === 0 || status.lessons.count === 0) && (
                <Button 
                  onClick={runSeed} 
                  disabled={seeding}
                  className="bg-amber-600 hover:bg-amber-700 flex gap-1"
                >
                  {seeding && <RefreshCw className="h-4 w-4 animate-spin" />}
                  Seed Database
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin text-amber-600 mr-2" />
            <p>Checking database status...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseDebugger;
