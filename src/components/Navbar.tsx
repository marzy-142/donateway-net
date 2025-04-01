
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Droplet } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Link to="/" className="flex items-center space-x-2">
          <Droplet className="h-6 w-6 text-bloodlink-red" />
          <span className="text-xl font-bold">
            Blood<span className="text-bloodlink-red">Link</span>
          </span>
        </Link>
        
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link to="/" className="text-sm font-medium hover:text-bloodlink-red transition-colors">
            Home
          </Link>
          
          <Link to="/about" className="text-sm font-medium hover:text-bloodlink-red transition-colors">
            About
          </Link>
          
          <Link to="/hospitals" className="text-sm font-medium hover:text-bloodlink-red transition-colors">
            Hospitals
          </Link>
          
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/dashboard" className="text-sm font-medium hover:text-bloodlink-red transition-colors">
              Dashboard
            </Link>
          )}
          
          {isAuthenticated && (
            <>
              {(user?.role === 'donor' || user?.role === 'admin') && (
                <Link to="/matches" className="text-sm font-medium hover:text-bloodlink-red transition-colors">
                  Matches
                </Link>
              )}
              
              {(user?.role === 'donor' || user?.role === 'recipient' || user?.role === 'admin') && (
                <Link to="/referrals" className="text-sm font-medium hover:text-bloodlink-red transition-colors">
                  Referrals
                </Link>
              )}
              
              <Link to="/profile" className="text-sm font-medium hover:text-bloodlink-red transition-colors">
                Profile
              </Link>
              
              <Button 
                variant="destructive" 
                onClick={() => logout()}
                className="bg-bloodlink-red hover:bg-bloodlink-red/80"
              >
                Logout
              </Button>
            </>
          )}
          
          {!isAuthenticated && (
            <>
              <Link to="/login">
                <Button variant="outline" className="border-bloodlink-red text-bloodlink-red hover:bg-bloodlink-red/10">
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
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
