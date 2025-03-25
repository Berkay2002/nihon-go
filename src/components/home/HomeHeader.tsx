
import React from "react";

interface HomeHeaderProps {
  username: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ username }) => {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-bold mb-1">Hello, {username}!</h1>
      <p className="text-muted-foreground">Welcome to your learning dashboard</p>
    </header>
  );
};
