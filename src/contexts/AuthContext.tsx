
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import { mockDbService } from "@/services/mockDbService";
import { useNavigate } from "react-router-dom";
import { validatePasswordStrength, verifyPassword, hashPassword } from "@/lib/security/passwordUtils";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasCompletedProfile: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo purposes
const mockUsers = [
  {
    id: "1",
    email: "admin@bloodlink.com",
    password: "Admin123!",
    name: "Admin User",
    role: "admin" as UserRole,
    createdAt: new Date(),
    hasCompletedProfile: true,
  },
  {
    id: "2",
    email: "donor@bloodlink.com",
    password: "Donor123!",
    name: "John Donor",
    role: "donor" as UserRole,
    createdAt: new Date(),
    hasCompletedProfile: true,
  },
  {
    id: "3",
    email: "recipient@bloodlink.com",
    password: "Recipient123!",
    name: "Mary Patient",
    role: "recipient" as UserRole,
    createdAt: new Date(),
    hasCompletedProfile: true,
  },
  {
    id: "4",
    email: "hospital@bloodlink.com",
    password: "Hospital123!",
    name: "City General Hospital",
    role: "hospital" as UserRole,
    createdAt: new Date(),
    hasCompletedProfile: true,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for stored user in local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("bloodlink_user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("bloodlink_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // For demo purposes, find the user in our mock data
    const foundUser = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      throw new Error("Invalid email or password");
    }

    // Create a user object without the password
    const userData: User = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      createdAt: foundUser.createdAt,
      hasCompletedProfile: foundUser.hasCompletedProfile,
    };

    // Store user in local storage
    localStorage.setItem("bloodlink_user", JSON.stringify(userData));
    setUser(userData);
    toast.success("Login successful!");
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    // Check if user already exists
    const userExists = mockUsers.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      throw new Error("User with this email already exists");
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Create new user
    const newUser: User = {
      id: `${mockUsers.length + 1}`,
      name,
      email,
      role,
      createdAt: new Date(),
      hasCompletedProfile: false,
    };

    // Add to mock users (in a real app, this would be saved to a database)
    mockUsers.push({
      ...newUser,
      password,
    });

    // Store user in local storage (without password)
    localStorage.setItem("bloodlink_user", JSON.stringify(newUser));
    setUser(newUser);
    toast.success("Registration successful!");
  };

  const logout = () => {
    localStorage.removeItem("bloodlink_user");
    setUser(null);
    navigate("/");
    toast.success("Logged out successfully");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("Not authenticated");

    // Update the user data
    const updatedUser = { ...user, ...data };
    
    // Update in mock users array (in a real app, this would update the database)
    const userIndex = mockUsers.findIndex(u => u.id === user.id);
    if (userIndex >= 0) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
    }

    // Update local storage
    localStorage.setItem("bloodlink_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.success("Profile updated successfully");
  };

  const isAuthenticated = user !== null;
  const hasCompletedProfile = user?.hasCompletedProfile || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        hasCompletedProfile,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
