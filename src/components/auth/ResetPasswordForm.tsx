
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/lib/auth-utils";
import { toast } from "@/components/ui/use-toast";

type ResetPasswordFormProps = {
  onBack: () => void;
};

const ResetPasswordForm = ({ onBack }: ResetPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get the current site URL from the browser
      const siteUrl = window.location.origin;
      // Create the correct redirect URL with the auth page
      // Don't include specific parameters, let Supabase add them
      const redirectUrl = `${siteUrl}/auth`;
      
      console.log("Sending reset email with redirect to:", redirectUrl);
      
      await resetPassword(email, redirectUrl);
      setIsSuccess(true);
      toast.success("Password reset email sent", {
        description: "Check your email for the password reset link",
      });
    } catch (error: any) {
      toast.error("Failed to send reset email", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center">
        <Button type="button" variant="ghost" onClick={onBack} className="p-0 mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Reset Password</h2>
      </div>
      
      {isSuccess ? (
        <div className="bg-green-50 border border-green-200 p-4 rounded-md">
          <p className="text-green-800">
            Password reset email sent! Please check your inbox and follow the instructions to reset your password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-nihongo-blue hover:bg-nihongo-blue/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordForm;
