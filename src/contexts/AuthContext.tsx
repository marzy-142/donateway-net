
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo purposes
const mockUsers = [
  {
    id: '1',
    email: 'admin@bloodlink.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as UserRole,
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'donor@bloodlink.com',
    password: 'donor123',
    name: 'John Donor',
    role: 'donor' as UserRole,
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'recipient@bloodlink.com',
    password: 'recipient123',
    name: 'Mary Patient',
    role: 'recipient' as UserRole,
    createdAt: new Date(),
  },
  {
    id: '4',
    email: 'hospital@bloodlink.com',
    password: 'hospital123',
    name: 'City General Hospital',
    role: 'hospital' as UserRole,
    createdAt: new Date(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('bloodlinkUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching credentials
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // Omit password from user object
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      
      // Save user to localStorage
      localStorage.setItem('bloodlinkUser', JSON.stringify(userWithoutPassword));
      
      toast.success('Login successful');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      // Create new user (in a real app, this would be a server request)
      const newUser = {
        id: `${mockUsers.length + 1}`,
        email,
        password,
        name,
        role,
        createdAt: new Date(),
      };
      
      // In a real app, we would save this to a database
      mockUsers.push(newUser);
      
      // Omit password from user object
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      
      // Save user to localStorage
      localStorage.setItem('bloodlinkUser', JSON.stringify(userWithoutPassword));
      
      toast.success('Registration successful');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear user from state
      setUser(null);
      
      // Remove user from localStorage
      localStorage.removeItem('bloodlinkUser');
      
      toast.success('Logout successful');
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
