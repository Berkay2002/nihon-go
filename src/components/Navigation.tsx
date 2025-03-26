
import { NavLink } from "react-router-dom";

const Navigation = () => {
  const navItems = [
    { 
      path: "/app", 
      icon: "/home-icon.svg", 
      ariaLabel: "Home"
    },
    { 
      path: "/app/characters", 
      icon: "/characters-icon.svg", 
      ariaLabel: "Characters"
    },
    { 
      path: "/app/reviews", 
      icon: "/review-icon.svg", 
      ariaLabel: "Reviews"
    },
    { 
      path: "/app/profile", 
      icon: "/profile-icon.svg", 
      ariaLabel: "Profile"
    },
  ];

  return (
    <nav className="
      md:fixed md:top-0 md:left-0 md:h-full md:w-24 md:bg-white md:dark:bg-gray-900 md:border-r md:border-gray-200 md:dark:border-gray-700 md:shadow-lg md:z-50
      fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50
    ">
      <div className="
        md:flex md:flex-col md:justify-start md:items-center md:h-full md:py-6 md:gap-8
        flex justify-around items-center h-16
      ">
        {/* Logo - only visible on desktop */}
        <div className="hidden md:block md:mb-8">
          <img 
            src="/nihon-go-logo-transparent.png" 
            alt="Nihon Go Logo" 
            className="w-12 h-12"
          />
        </div>
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-center transition-all duration-200
              md:w-16 md:h-16 md:rounded-lg md:my-1 md:hover:bg-gray-100 md:dark:hover:bg-gray-800
              h-full p-2 ${
                isActive
                  ? "transform scale-110 md:bg-gray-100 md:dark:bg-gray-800"
                  : "opacity-70 hover:opacity-100"
              }`
            }
            end={item.path === "/app"}
            aria-label={item.ariaLabel}
          >
            {({ isActive }) => (
              <img 
                src={item.icon} 
                alt={item.ariaLabel}
                className={`w-6 h-6 ${isActive ? "animate-bounce-light" : ""}`}
              />
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
