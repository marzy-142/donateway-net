import React, { createContext, useState, useContext, useEffect } from "react";
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import { mockDbService } from "@/services/mockDbService";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasCompletedProfile: boolean;
  checkProfileCompletion: (currentUser: User | null) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  const checkProfileCompletion = async (currentUser: User | null) => {
    if (!currentUser) return false;

    try {
      switch (currentUser.role) {
        case "donor": {
          const donors = await mockDbService.getDonors();
          const isDonorComplete = donors.some(
            (d) => d.userId === currentUser.id
          );
          setHasCompletedProfile(isDonorComplete);
          // Update user data in localStorage and state
          if (isDonorComplete) {
            const userKey = `bloodlink_user_${currentUser.id}`;
            const userData = JSON.parse(localStorage.getItem(userKey) || "{}");
            userData.hasCompletedProfile = true;
            localStorage.setItem(userKey, JSON.stringify(userData));
            setUser({ ...currentUser, hasCompletedProfile: true });
          }
          return isDonorComplete;
        }
        case "recipient": {
          const recipients = await mockDbService.getRecipients();
          const isRecipientComplete = recipients.some(
            (r) => r.userId === currentUser.id
          );
          setHasCompletedProfile(isRecipientComplete);
          // Update user data in localStorage and state
          if (isRecipientComplete) {
            const userKey = `bloodlink_user_${currentUser.id}`;
            const userData = JSON.parse(localStorage.getItem(userKey) || "{}");
            userData.hasCompletedProfile = true;
            localStorage.setItem(userKey, JSON.stringify(userData));
            setUser({ ...currentUser, hasCompletedProfile: true });
          }
          return isRecipientComplete;
        }
        case "hospital":
        case "admin":
          // Hospitals and admins don't need profile completion
          setHasCompletedProfile(true);
          return true;
        default:
          setHasCompletedProfile(false);
          return false;
      }
    } catch (error) {
      console.error("Error checking profile completion:", error);
      return false;
    }
  };

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Get the user's custom data from localStorage
        const userData = localStorage.getItem(
          `bloodlink_user_${firebaseUser.uid}`
        );
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          await checkProfileCompletion(parsedUser);
        }
      } else {
        setUser(null);
        setHasCompletedProfile(false);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Get user data from localStorage
      const userData = localStorage.getItem(
        `bloodlink_user_${firebaseUser.uid}`
      );
      if (!userData) {
        throw new Error("User data not found");
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Check profile completion
      await checkProfileCompletion(parsedUser);

      toast.success("Login successful");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid email or password");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Create user data
      const newUser = {
        id: firebaseUser.uid,
        email,
        name,
        role,
        createdAt: new Date(),
      };

      // Save user data to localStorage
      localStorage.setItem(
        `bloodlink_user_${firebaseUser.uid}`,
        JSON.stringify(newUser)
      );

      setUser(newUser);
      setHasCompletedProfile(false);

      toast.success("Registration successful");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error instanceof Error ? error.message : "Registration failed"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setHasCompletedProfile(false);
      toast.success("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
      throw error;
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
        hasCompletedProfile,
        checkProfileCompletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
