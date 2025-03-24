
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import AuthContainer from "@/components/auth/AuthContainer";
import AuthCard from "@/components/auth/AuthCard";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import GuestModeButton from "@/components/auth/GuestModeButton";
import AuthDivider from "@/components/auth/AuthDivider";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import UpdatePasswordForm from "@/components/UpdatePasswordForm";

const Auth = () => {
  const [showResetForm, setShowResetForm] = useState(false);
  const [searchParams] = useSearchParams();
  const isResetMode = searchParams.get("reset") === "true";
  const tabParam = searchParams.get("tab");

  // Set default tab or use the tab from URL
  const defaultTab = tabParam === "signup" ? "signup" : 
                    tabParam === "reset" ? "reset" : "signin";
  
  // If showResetForm was previously true but URL no longer has tab=reset
  useEffect(() => {
    if (showResetForm && tabParam !== "reset") {
      setShowResetForm(false);
    } else if (!showResetForm && tabParam === "reset") {
      setShowResetForm(true);
    }
  }, [tabParam, showResetForm]);

  const authCardFooter = (
    <>
      <AuthDivider />
      <GuestModeButton />
    </>
  );

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
            footer={authCardFooter}
          >
            <SignInForm />
          </AuthCard>
        </TabsContent>
        
        <TabsContent value="signup">
          <AuthCard 
            title="Sign Up" 
            description="Create a new account to start learning Japanese"
            footer={authCardFooter}
          >
            <SignUpForm />
          </AuthCard>
        </TabsContent>
      </Tabs>
    </AuthContainer>
  );
};

export default Auth;
