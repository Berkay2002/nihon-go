
import { toast as sonnerToast } from "sonner";

// Add type augmentation for error and success methods
export const toast = {
  ...sonnerToast,
  error: (title: string, options?: { description?: string }) => {
    return sonnerToast.error(title, {
      ...options,
      // This would apply custom styling for error toasts if needed
    });
  },
  success: (title: string, options?: { description?: string }) => {
    return sonnerToast.success(title, {
      ...options,
      // This would apply custom styling for success toasts if needed
    });
  }
};
