// src/components/home/HomeHeader.tsx
import React from "react";
import { HighContrastText, MediumContrastText } from "@/components/ui/theme-text";

interface HomeHeaderProps {
  username: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ username }) => {
  return (
    <header className="mb-8">
      <HighContrastText as="h1" className="text-2xl font-bold mb-1">
        Hello, {username}!
      </HighContrastText>
      <MediumContrastText as="p">
        Welcome to your learning dashboard
      </MediumContrastText>
    </header>
  );
};