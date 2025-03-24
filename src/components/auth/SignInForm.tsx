
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
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
