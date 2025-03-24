
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const GuestModeButton = () => {
  const { signInAsGuest, isLoading } = useAuth();

  return (
    <Button 
      variant="outline" 
      className="w-full"
      onClick={signInAsGuest}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        "Continue as Guest"
      )}
    </Button>
  );
};

export default GuestModeButton;
