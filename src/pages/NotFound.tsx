
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Droplet } from 'lucide-react';

const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center bg-bloodlink-pink p-4">
        <Droplet className="h-16 w-16 text-bloodlink-red mb-6" />
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          404
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
          Oops! The page you're looking for seems to have been donated elsewhere.
        </p>
        
        <Link to="/">
          <Button 
            size="lg" 
            className="bg-bloodlink-red hover:bg-bloodlink-red/80"
          >
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
