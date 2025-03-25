import { toast as sonnerToast } from "sonner";

// Configuration for preventing duplicate toasts
const toastConfig = {
  duration: 3000,
};

// Create a unique ID for each toast based on title and current timestamp
const createToastId = (title: string) => `${title}-${Date.now()}`;

// Add type augmentation for error and success methods
export const toast = {
  ...sonnerToast,
  error: (title: string, options?: { description?: string }) => {
    return sonnerToast.error(title, {
      ...toastConfig,
      ...options,
      id: title, // Use title as ID to prevent duplicates
    });
  },
  success: (title: string, options?: { description?: string }) => {
    return sonnerToast.success(title, {
      ...toastConfig,
      ...options,
      id: title, // Use title as ID to prevent duplicates
    });
  },
  info: (title: string, options?: { description?: string }) => {
    return sonnerToast.info(title, {
      ...toastConfig,
      ...options,
      id: title, // Use title as ID to prevent duplicates
    });
  },
  warning: (title: string, options?: { description?: string }) => {
    return sonnerToast.warning(title, {
      ...toastConfig,
      ...options,
      id: title, // Use title as ID to prevent duplicates
    });
  },
  destructive: (options: { title: string, description?: string }) => {
    return sonnerToast.error(options.title, {
      ...toastConfig,
      description: options.description,
      id: options.title, // Use title as ID to prevent duplicates
    });
  },
  variant: (variant: string, options: { title: string, description?: string }) => {
    if (variant === "destructive") {
      return sonnerToast.error(options.title, {
        ...toastConfig,
        description: options.description,
        id: options.title, // Use title as ID to prevent duplicates
      });
    }
    return sonnerToast(options.title, {
      ...toastConfig,
      description: options.description,
      id: options.title, // Use title as ID to prevent duplicates
    });
  }
};

// Export the toast hook for components to use
export default toast;
