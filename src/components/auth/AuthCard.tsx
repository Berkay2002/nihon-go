
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DatabaseDebugger from "@/components/debug/DatabaseDebugger";

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  showDebugger?: boolean;
};

const AuthCard = ({ title, description, children, footer, showDebugger = false }: AuthCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
        {showDebugger && <DatabaseDebugger />}
      </CardContent>
      {footer && <CardFooter className="flex flex-col space-y-4">{footer}</CardFooter>}
    </Card>
  );
};

export default AuthCard;
