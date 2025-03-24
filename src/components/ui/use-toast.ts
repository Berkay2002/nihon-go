
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
  },
  destructive: (options: { title: string, description?: string }) => {
    return sonnerToast.error(options.title, {
      description: options.description,
      // Apply destructive styling
    });
  },
  variant: (variant: string, options: { title: string, description?: string }) => {
    if (variant === "destructive") {
      return sonnerToast.error(options.title, {
        description: options.description,
      });
    }
    return sonnerToast(options.title, {
      description: options.description,
    });
  }
};
