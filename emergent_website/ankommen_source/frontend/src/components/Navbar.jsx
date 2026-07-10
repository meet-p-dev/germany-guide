import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, BookOpen, GitCompareArrows, MapPin } from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-border/60">
      <div className="flag-stripe" aria-hidden="true">
        <span className="bg-foreground" />
        <span className="bg-primary" />
        <span className="bg-accent" />
      </div>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-display font-extrabold">
            A
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">
            Ankommen
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link to="/process" data-testid="nav-process">
            <Button variant="ghost" className="gap-2 rounded-full font-semibold">
              <BookOpen className="h-4 w-4" /> The process
            </Button>
          </Link>
          <Link to="/cities" data-testid="nav-cities">
            <Button variant="ghost" className="gap-2 rounded-full font-semibold">
              <MapPin className="h-4 w-4" /> Cities
            </Button>
          </Link>
          <Link to="/compare" data-testid="nav-compare">
            <Button variant="ghost" className="gap-2 rounded-full font-semibold">
              <GitCompareArrows className="h-4 w-4" /> Compare
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ModeToggle />
          {user ? (
            <>
              <Link to="/dashboard" data-testid="nav-dashboard">
                <Button variant="secondary" className="gap-2 rounded-full font-semibold">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                data-testid="nav-logout"
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" data-testid="nav-login" className="hidden sm:block">
                <Button variant="ghost" className="rounded-full font-semibold">
                  Log in
                </Button>
              </Link>
              <Link to="/explore" data-testid="nav-build-plan">
                <Button className="rounded-full font-semibold">Build my plan</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
