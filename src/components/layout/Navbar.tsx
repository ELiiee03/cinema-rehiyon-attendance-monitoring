import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Register", path: "/register" },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="/lovable-uploads/896a2c4f-9519-4e47-bfd9-a4001abad55b.png" 
                alt="Attendify Logo" 
                className="h-10" 
              />
              <span className="font-bold text-xl tracking-wider hidden sm:inline bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-primary">Attendify</span>
            </Link>
          </div>
          
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-white"
                    : "text-primary hover:bg-blue-50"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
