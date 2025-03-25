
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      closeButton
      position="top-right"
      richColors
      toastOptions={{
        className: "border-border rounded-md",
        duration: 3000,
      }}
    />
  );
}
