
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      closeButton
      position="top-right"
      toastOptions={{
        className: "border-border rounded-md",
        // Add any additional styling options here
      }}
    />
  );
}
