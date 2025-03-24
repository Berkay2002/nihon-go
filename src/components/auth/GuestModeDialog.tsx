
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GuestModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueAsGuest: () => void;
}

const GuestModeDialog: React.FC<GuestModeDialogProps> = ({
  open,
  onOpenChange,
  onContinueAsGuest
}) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Continue as Guest?</DialogTitle>
          <DialogDescription>
            You were previously browsing in guest mode. Would you like to continue as a guest or sign in with an account?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              onOpenChange(false);
              navigate("/auth");
            }}
            className="sm:flex-1"
          >
            Sign In
          </Button>
          <Button 
            onClick={onContinueAsGuest}
            className="bg-nihongo-blue hover:bg-nihongo-blue/90 sm:flex-1"
          >
            Continue as Guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GuestModeDialog;
