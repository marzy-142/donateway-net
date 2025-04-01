
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the path the user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bloodlink-pink p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Droplet className="h-12 w-12 text-bloodlink-red" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <Input
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-bloodlink-red hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <p>Demo accounts:</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEmail('admin@bloodlink.com');
                  setPassword('admin123');
                }}
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEmail('donor@bloodlink.com');
                  setPassword('donor123');
                }}
              >
                Donor
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEmail('recipient@bloodlink.com');
                  setPassword('recipient123');
                }}
              >
                Recipient
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEmail('hospital@bloodlink.com');
                  setPassword('hospital123');
                }}
              >
                Hospital
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-center mt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-bloodlink-red hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
