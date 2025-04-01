
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Heart } from 'lucide-react';

const Index: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'donor':
          navigate('/donor');
          break;
        case 'recipient':
          navigate('/recipient');
          break;
        case 'hospital':
          navigate('/hospital');
          break;
        case 'admin':
          navigate('/dashboard');
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-bloodlink-pink py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                Connecting Lives Through Blood Donation
              </h1>
              <p className="text-lg text-gray-600 md:text-xl/relaxed">
                BloodLink empowers communities by creating{' '}
                <span className="text-bloodlink-red font-semibold">lifesaving connections</span>{' '}
                between donors, recipients, and hospitals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={isAuthenticated ? "/donor" : "/register"}>
                  <Button 
                    size="lg" 
                    className="bg-bloodlink-red hover:bg-bloodlink-red/80"
                  >
                    Become a Donor
                  </Button>
                </Link>
                <Link to={isAuthenticated ? "/recipient/request" : "/register"}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-bloodlink-red text-bloodlink-red hover:bg-bloodlink-red/10"
                  >
                    Request Blood
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/fa5516be-7180-4f94-93b3-516bed154218.png" 
                alt="Blood donation" 
                className="rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter">How BloodLink Works</h2>
            <p className="text-gray-600 mt-2">Simple, secure, and life-saving</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow">
              <div className="h-16 w-16 bg-bloodlink-pink rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-bloodlink-red" />
              </div>
              <h3 className="text-xl font-bold">Register as a Donor</h3>
              <p className="text-gray-600 mt-2">
                Sign up and complete your donor profile with your blood type and availability.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow">
              <div className="h-16 w-16 bg-bloodlink-pink rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bloodlink-red">
                  <path d="M18 16.98h-5.99c-1.1 0-1.95.94-1.95 1.98v1.96c0 1.04.85 1.98 1.95 1.98H18c1.1 0 2-.94 2-1.98v-1.96c0-1.04-.9-1.98-2-1.98z" />
                  <path d="M18 8.976h-5.99c-1.1 0-1.95.94-1.95 1.98v1.96c0 1.04.85 1.98 1.95 1.98H18c1.1 0 2-.94 2-1.98v-1.96c0-1.04-.9-1.98-2-1.98z" />
                  <path d="M18 .976h-5.99c-1.1 0-1.95.94-1.95 1.98v1.96c0 1.04.85 1.98 1.95 1.98H18c1.1 0 2-.94 2-1.98v-1.96c0-1.04-.9-1.98-2-1.98z" />
                  <path d="M5.01 1.973c-.55 0-.99.43-.99.95v18.1c0 .53.44.95.99.95h1.98c.55 0 .99-.43.99-.95v-18.1c0-.53-.44-.95-.99-.95H5.01z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Find Matches</h3>
              <p className="text-gray-600 mt-2">
                Our system matches donors with compatible recipients in need of blood.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow">
              <div className="h-16 w-16 bg-bloodlink-pink rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bloodlink-red">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Save Lives</h3>
              <p className="text-gray-600 mt-2">
                Connect with hospitals, schedule donations, and make a life-saving difference.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Blood Donation Facts */}
      <section className="bg-bloodlink-pink py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter">Blood Donation Impact</h2>
            <p className="text-gray-600 mt-2">Every donation counts and makes a difference</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-4xl font-bold text-bloodlink-red mb-2">1 Unit</div>
              <p>Can save up to 3 lives</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-4xl font-bold text-bloodlink-red mb-2">Every 2 Seconds</div>
              <p>Someone needs blood</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-4xl font-bold text-bloodlink-red mb-2">38%</div>
              <p>Of the population is eligible to donate</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-bloodlink-red to-red-600 text-white">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter mb-4">Ready to make a difference?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of donors who are saving lives every day through the BloodLink network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={isAuthenticated ? "/donor" : "/register"}>
              <Button 
                size="lg" 
                className="bg-white text-bloodlink-red hover:bg-gray-100"
              >
                Become a Donor
              </Button>
            </Link>
            <Link to="/about">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/20"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-bloodlink-red" />
                <span className="text-xl font-bold">
                  Blood<span className="text-bloodlink-red">Link</span>
                </span>
              </div>
              <p className="mt-4 text-gray-400">
                Connecting donors with recipients to save lives.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link to="/hospitals" className="text-gray-400 hover:text-white">Hospitals</Link></li>
                <li><Link to="/donors" className="text-gray-400 hover:text-white">Find Donors</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/blood-compatibility" className="text-gray-400 hover:text-white">Blood Compatibility</Link></li>
                <li><Link to="/donation-process" className="text-gray-400 hover:text-white">Donation Process</Link></li>
                <li><Link to="/faqs" className="text-gray-400 hover:text-white">FAQs</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <address className="text-gray-400 not-italic">
                <p>Email: contact@bloodlink.com</p>
                <p className="mt-2">Phone: +1 (800) BLOOD-HELP</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} BloodLink. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
