import { toast } from "sonner";

// Add type augmentation for error and success methods
const enhancedToast = {
  ...toast,
  error: (title: string, options?: { description?: string }) => {
    return toast(title, {
      ...options,
      // This would apply custom styling for error toasts if needed
      // For now, we're keeping it simple
    });
  },
  success: (title: string, options?: { description?: string }) => {
    return toast(title, {
      ...options,
      // This would apply custom styling for success toasts if needed
      // For now, we're keeping it simple
    });
  }
};

export { enhancedToast as toast };
