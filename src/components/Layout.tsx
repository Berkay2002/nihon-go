
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
