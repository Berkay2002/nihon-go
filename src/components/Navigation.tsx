
import { Home, BookOpen, Trophy, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const Navigation = () => {
  const navItems = [
    { path: "/app", label: "Home", icon: Home },
    { path: "/app/units", label: "Lessons", icon: BookOpen },
    { path: "/app/achievements", label: "Trophies", icon: Trophy },
    { path: "/app/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-1/4 h-full transition-all duration-200 ${
                isActive
                  ? "text-nihongo-red font-medium"
                  : "text-gray-500 hover:text-nihongo-blue"
              }`
            }
            end={item.path === "/app"}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-6 h-6 ${
                    isActive ? "animate-bounce-light" : ""
                  }`}
                />
                <span className="text-xs mt-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
