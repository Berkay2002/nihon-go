import { NavLink } from "react-router-dom";

// Custom colorful navigation icons based on Duolingo
const HomeIcon = ({ className }: { className?: string }) => (
  <div className={className}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4L4 12.5V28H28V12.5L16 4Z" fill="#58CC02"/>
      <path d="M16 7L6 14V26H26V14L16 7Z" fill="#89E219"/>
      <rect x="13" y="18" width="6" height="8" rx="1" fill="#58CC02"/>
    </svg>
  </div>
);

const HiraganaIcon = ({ className }: { className?: string }) => (
  <div className={className}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#E53E51"/>
      <circle cx="16" cy="16" r="11" fill="#FF5757"/>
      <path d="M11 11C11 10.4477 11.4477 10 12 10H20C20.5523 10 21 10.4477 21 11V13C21 13.5523 20.5523 14 20 14H14V16H20C20.5523 16 21 16.4477 21 17V21C21 21.5523 20.5523 22 20 22H12C11.4477 22 11 21.5523 11 21V19C11 18.4477 11.4477 18 12 18H18V18H12C11.4477 18 11 17.5523 11 17V11Z" fill="#FFFFFF"/>
    </svg>
  </div>
);

const ProfileIcon = ({ className }: { className?: string }) => (
  <div className={className}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#1CB0F6"/>
      <circle cx="16" cy="11" r="5" fill="#84D8FF"/>
      <path d="M16 16C11.5817 16 8 19.5817 8 24V25C8 26.1046 8.89543 27 10 27H22C23.1046 27 24 26.1046 24 25V24C24 19.5817 20.4183 16 16 16Z" fill="#84D8FF"/>
    </svg>
  </div>
);

const Navigation = () => {
  const navItems = [
    { 
      path: "/app", 
      icon: "/home-icon.svg", 
      ariaLabel: "Home" 
    },
    { 
      path: "/app/characters", 
      icon: "/character-icon.svg", 
      ariaLabel: "Characters" 
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
            className="w-24 h-23"
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
                className={`w-8 h-8 ${
                  isActive ? "animate-bounce-light" : ""
                }`}
              />
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;