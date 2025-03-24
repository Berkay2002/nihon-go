
import { ReactNode } from "react";

type AuthContainerProps = {
  children: ReactNode;
};

const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-nihongo-red">NihonGo</h1>
          <p className="mt-2 text-muted-foreground">Learn Japanese, one step at a time.</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthContainer;
