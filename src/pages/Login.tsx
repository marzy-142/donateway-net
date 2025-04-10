
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the path the user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      toast.success('Successfully logged in');
      
      // We'll handle redirect in useEffect based on user role
      const storedUser = localStorage.getItem("bloodlink_user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        switch (userData.role) {
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
            navigate('/');
            break;
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-bloodlink-pink to-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <Droplet className="h-8 w-8 text-bloodlink-red" />
              <span className="text-2xl font-bold">
                Blood<span className="text-bloodlink-red">Link</span>
              </span>
            </Link>
          </div>
          
          <Card className="border-none shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
              <CardDescription>
                Enter your credentials to access the BloodLink platform
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-bloodlink-red" />
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4 text-bloodlink-red" />
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-xs text-bloodlink-red hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
            </CardContent>
            
            <CardFooter className="flex flex-col border-t pt-6">
              <div className="text-sm text-center">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-bloodlink-red hover:underline">
                  Create an account
                </Link>
              </div>
              
              <div className="mt-6 text-center text-xs text-gray-500">
                By continuing, you agree to BloodLink's Terms of Service and Privacy Policy.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
