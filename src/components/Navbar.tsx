import { Link, useLocation } from "react-router-dom";
import { Shield, Search, Home } from "lucide-react";

export function Navbar() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/certify", label: "Certify", icon: Shield },
    { to: "/verify", label: "Verify", icon: Search },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Shield className="h-5 w-5 text-accent" />
          <span>Provenance</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
