// src/components/ui/theme-text.tsx
import React from "react";
import { cn } from "@/lib/utils";

// High contrast text - for headings and important content
export const HighContrastText = ({ 
  children, 
  className,
  as: Component = "span",
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) => {
  return (
    <Component className={cn("text-high-contrast", className)} {...props}>
      {children}
    </Component>
  );
};

// Medium contrast text - for most paragraph text
export const MediumContrastText = ({ 
  children, 
  className,
  as: Component = "span",
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) => {
  return (
    <Component className={cn("text-medium-contrast", className)} {...props}>
      {children}
    </Component>
  );
};

// Low contrast text - for secondary information, captions, etc.
export const LowContrastText = ({ 
  children, 
  className,
  as: Component = "span",
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) => {
  return (
    <Component className={cn("text-low-contrast", className)} {...props}>
      {children}
    </Component>
  );
};

// Themed background container with appropriate text contrast
export const ThemedContainer = ({
  children,
  className,
  darkMode = false,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  darkMode?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn(
        "bg-background text-foreground", 
        darkMode && "bg-[#1F2937] text-[#F9FAFB]",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

// Card with proper contrast for both light and dark modes
export const ThemedCard = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn(
        "bg-background border border-border rounded-lg shadow-sm", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};