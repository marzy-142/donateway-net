import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Droplet, Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center space-x-2">
          <Droplet className="h-6 w-6 text-bloodlink-red" />
          <span className="text-xl font-bold">
            Blood<span className="text-bloodlink-red">Link</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link
                  to="/"
                  className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
                >
                  Home
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  to="/about"
                  className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
                >
                  About
                </Link>
              </NavigationMenuItem>

              {user?.role !== "admin" && (
                <NavigationMenuItem>
                  <Link
                    to="/hospitals"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent"
                    )}
                  >
                    Hospitals
                  </Link>
                </NavigationMenuItem>
              )}

              {isAuthenticated && (
                <>
                  {user?.role === "admin" && (
                    <>
                      <NavigationMenuItem>
                        <Link
                          to="/dashboard"
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "bg-transparent"
                          )}
                        >
                          Dashboard
                        </Link>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <Link
                          to="/matches"
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "bg-transparent"
                          )}
                        >
                          Matches
                        </Link>
                      </NavigationMenuItem>
                    </>
                  )}

                  {(user?.role === "donor" ||
                    user?.role === "recipient" ||
                    user?.role === "admin") && (
                    <NavigationMenuItem>
                      <Link
                        to="/referrals"
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "bg-transparent"
                        )}
                      >
                        Referrals
                      </Link>
                    </NavigationMenuItem>
                  )}

                  <NavigationMenuItem>
                    <Link
                      to="/profile"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "bg-transparent"
                      )}
                    >
                      Profile
                    </Link>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <Button
                variant="ghost"
                onClick={() => logout()}
                className="text-bloodlink-red hover:bg-bloodlink-red/10 border border-bloodlink-red"
              >
                Logout
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="border border-bloodlink-red text-bloodlink-red hover:bg-bloodlink-red/10"
                  >
                    Login
                  </Button>
                </Link>

                <Link to="/register">
                  <Button className="bg-bloodlink-red hover:bg-bloodlink-red/80">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 hover:text-bloodlink-red focus:outline-none"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="container px-4 py-3 space-y-3">
            <Link
              to="/"
              className="block py-2 hover:text-bloodlink-red"
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block py-2 hover:text-bloodlink-red"
              onClick={toggleMobileMenu}
            >
              About
            </Link>

            {user?.role !== "admin" && (
              <Link
                to="/hospitals"
                className="block py-2 hover:text-bloodlink-red"
                onClick={toggleMobileMenu}
              >
                Hospitals
              </Link>
            )}

            {isAuthenticated && (
              <>
                {user?.role === "admin" && (
                  <>
                    <Link
                      to="/dashboard"
                      className="block py-2 hover:text-bloodlink-red"
                      onClick={toggleMobileMenu}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/matches"
                      className="block py-2 hover:text-bloodlink-red"
                      onClick={toggleMobileMenu}
                    >
                      Matches
                    </Link>
                  </>
                )}

                {(user?.role === "donor" ||
                  user?.role === "recipient" ||
                  user?.role === "admin") && (
                  <Link
                    to="/referrals"
                    className="block py-2 hover:text-bloodlink-red"
                    onClick={toggleMobileMenu}
                  >
                    Referrals
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="block py-2 hover:text-bloodlink-red"
                  onClick={toggleMobileMenu}
                >
                  Profile
                </Link>
              </>
            )}

            <div className="pt-3 border-t flex flex-col space-y-2">
              {isAuthenticated ? (
                <Button
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80"
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full"
                    onClick={toggleMobileMenu}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-bloodlink-red text-bloodlink-red hover:bg-bloodlink-red/10"
                    >
                      Login
                    </Button>
                  </Link>

                  <Link
                    to="/register"
                    className="w-full"
                    onClick={toggleMobileMenu}
                  >
                    <Button className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
