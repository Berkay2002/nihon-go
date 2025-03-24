
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const { signIn, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Combine both loading states to handle edge cases
  const isLoading = localLoading || authLoading;

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    let timeoutId: number;
    
    if (localLoading) {
      timeoutId = window.setTimeout(() => {
        setLocalLoading(false);
        toast.error("Sign in is taking too long", {
          description: "Please try again or check your internet connection",
        });
      }, 5000); // Reduced from 8 to 5 seconds for faster feedback
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [localLoading]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Missing information", {
        description: "Please enter both username/email and password",
      });
      return;
    }
    
    try {
      setLocalLoading(true);
      await signIn(email, password);
      // Only navigate if successful (navigation actually happens in AuthProvider)
    } catch (error) {
      // Error is handled in the Auth provider
      console.error("Sign in form error:", error);
      setLocalLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/auth?tab=reset");
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identifier">Username or Email</Label>
        <Input 
          id="identifier" 
          type="text" 
          placeholder="username or email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      
      <div className="text-right">
        <Button 
          type="button" 
          variant="link" 
          className="text-nihongo-blue p-0 h-auto"
          onClick={handleForgotPassword}
          disabled={isLoading}
        >
          Forgot password?
        </Button>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-nihongo-blue hover:bg-nihongo-blue/90"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
};

export default SignInForm;
