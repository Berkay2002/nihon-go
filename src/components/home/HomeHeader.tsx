
import React from "react";

interface HomeHeaderProps {
  username: string;
  isGuest: boolean;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ username, isGuest }) => {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-bold">
        {isGuest ? 
          `こんにちは, Guest!` : 
          `こんにちは, ${username}!`}
      </h1>
      <p className="text-muted-foreground">Welcome to your Japanese learning journey</p>
    </header>
  );
};
