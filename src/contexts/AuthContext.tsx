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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "donor" | "recipient" | "hospital";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo purposes
const mockUsers = [
  {
    id: "1",
    email: "admin@bloodlink.com",
    password: "admin123",
    name: "Admin User",
    role: "admin" as UserRole,
    createdAt: new Date(),
  },
  {
    id: "2",
    email: "donor@bloodlink.com",
    password: "donor123",
    name: "John Donor",
    role: "donor" as UserRole,
    createdAt: new Date(),
  },
  {
    id: "3",
    email: "recipient@bloodlink.com",
    password: "recipient123",
    name: "Mary Patient",
    role: "recipient" as UserRole,
    createdAt: new Date(),
  },
  {
    id: "4",
    email: "hospital@bloodlink.com",
    password: "hospital123",
    name: "City General Hospital",
    role: "hospital" as UserRole,
    createdAt: new Date(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored auth token and validate it
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          // Validate token with backend
          const response = await fetch(
            "https://api.donateway.net/auth/validate",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem("auth_token");
          }
        }
      } catch (error) {
        console.error("Auth validation error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("https://api.donateway.net/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const { user: userData, token } = await response.json();
      localStorage.setItem("auth_token", token);
      setUser(userData);
      toast.success("Login successful!");
      navigate(
        userData.hasCompletedProfile
          ? `/${userData.role}`
          : `/${userData.role}/complete-profile`
      );
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch("https://api.donateway.net/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const { user: userData, token } = await response.json();
      localStorage.setItem("auth_token", token);
      setUser(userData);
      toast.success("Registration successful!");
      navigate(`/${userData.role}/complete-profile`);
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    navigate("/");
    toast.success("Logged out successfully");
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("https://api.donateway.net/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Profile update failed");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      throw error;
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
