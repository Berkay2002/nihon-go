
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import AuthContainer from "@/components/auth/AuthContainer";
import AuthCard from "@/components/auth/AuthCard";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const [showResetForm, setShowResetForm] = useState(false);
  const [processingAuthLink, setProcessingAuthLink] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [searchParams] = useSearchParams();
  const isResetMode = searchParams.get("reset") === "true" || searchParams.get("type") === "recovery";
  const tabParam = searchParams.get("tab");

  const defaultTab = tabParam === "signup" ? "signup" : 
                    tabParam === "reset" ? "reset" : "signin";
  
  useEffect(() => {
    if (showResetForm && tabParam !== "reset") {
      setShowResetForm(false);
    } else if (!showResetForm && tabParam === "reset") {
      setShowResetForm(true);
    }
    
    const processUrl = async () => {
      setProcessingAuthLink(true);
      
      const timeoutId = window.setTimeout(() => {
        setProcessingAuthLink(false);
        setConnectionError(true);
        console.error("Auth link processing timed out");
      }, 10000);
      
      try {
        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          const error = params.get('error');
          const errorDescription = params.get('error_description');
          
          if (error) {
            toast.error("Password reset link error", {
              description: errorDescription || "The password reset link is invalid or has expired. Please request a new one.",
            });
            
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
            
            setShowResetForm(true);
            setProcessingAuthLink(false);
            clearTimeout(timeoutId);
            return;
          }
          
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');
          
          if (type === 'recovery' && accessToken) {
            try {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });
              
              if (error) throw error;
              
              const url = new URL(window.location.href);
              url.searchParams.set('reset', 'true');
              url.hash = '';
              window.history.replaceState(null, "", url.toString());
              
              console.log("Recovery token processed successfully");
            } catch (error) {
              console.error("Error setting recovery session:", error);
              toast.error("Recovery session error", {
                description: "There was an error processing your recovery token. Please request a new reset link.",
              });
            }
          }
        }
        
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        
        if (error) {
          toast.error("Password reset link error", {
            description: errorDescription || "The password reset link is invalid or has expired. Please request a new one.",
          });
          setShowResetForm(true);
        }
      } catch (error) {
        console.error("Error processing auth URL:", error);
        setConnectionError(true);
      } finally {
        setProcessingAuthLink(false);
        clearTimeout(timeoutId);
      }
    };
    
    processUrl();
  }, [tabParam, showResetForm, searchParams]);

  if (processingAuthLink) {
    return (
      <AuthContainer>
        <AuthCard title="Processing Authentication Link">
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner />
            <p className="mt-4 text-center text-muted-foreground">
              Please wait while we process your authentication link...
            </p>
          </div>
        </AuthCard>
      </AuthContainer>
    );
  }

  if (connectionError) {
    return (
      <AuthContainer>
        <AuthCard title="Connection Error">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              We're having trouble connecting to the authentication service. This might be due to network issues.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">You can try:</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>Refreshing the page</li>
              <li>Checking your internet connection</li>
              <li>Trying again later</li>
            </ul>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-nihongo-blue hover:bg-nihongo-blue/90"
            >
              Refresh Page
            </Button>
          </div>
        </AuthCard>
      </AuthContainer>
    );
  }

  if (isResetMode) {
    return (
      <AuthContainer>
        <AuthCard title="Set New Password">
          <UpdatePasswordForm />
        </AuthCard>
      </AuthContainer>
    );
  }

  if (showResetForm) {
    return (
      <AuthContainer>
        <AuthCard title="Reset Password">
          <ResetPasswordForm onBack={() => setShowResetForm(false)} />
        </AuthCard>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <AuthCard 
            title="Sign In" 
            description="Enter your username or email and password to sign in"
          >
            <SignInForm />
          </AuthCard>
        </TabsContent>
        
        <TabsContent value="signup">
          <AuthCard 
            title="Sign Up" 
            description="Create a new account to start learning Japanese"
          >
            <SignUpForm />
          </AuthCard>
        </TabsContent>
      </Tabs>
    </AuthContainer>
  );
};

export default Auth;
