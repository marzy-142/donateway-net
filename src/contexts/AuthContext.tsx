
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile as firebaseUpdateProfile } from "firebase/auth";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Firebase user to our app's user format
const formatUser = (firebaseUser: FirebaseUser, role: UserRole = 'donor', hasCompleted: boolean = false): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || '',
    role: role,
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    hasCompletedProfile: hasCompleted,
    avatar: firebaseUser.photoURL || undefined,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for stored user role and profile completion
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Get stored user data from localStorage to include role and profile status
        const storedUserData = localStorage.getItem(`bloodlink_user_${firebaseUser.uid}`);
        let role: UserRole = 'donor';
        let hasCompletedProfile = false;
        
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            role = userData.role || 'donor';
            hasCompletedProfile = userData.hasCompletedProfile || false;
          } catch (error) {
            console.error("Failed to parse stored user data:", error);
          }
        }
        
        const formattedUser = formatUser(firebaseUser, role, hasCompletedProfile);
        setUser(formattedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get stored user data to include role and profile status
      const storedUserData = localStorage.getItem(`bloodlink_user_${firebaseUser.uid}`);
      let role: UserRole = 'donor';
      let hasCompletedProfile = false;
      
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          role = userData.role || 'donor';
          hasCompletedProfile = userData.hasCompletedProfile || false;
        } catch (error) {
          console.error("Failed to parse stored user data:", error);
        }
      }
      
      const formattedUser = formatUser(firebaseUser, role, hasCompletedProfile);
      setUser(formattedUser);
      toast.success("Login successful!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid email or password");
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with display name
      await firebaseUpdateProfile(firebaseUser, {
        displayName: name
      });
      
      // Store additional user data in localStorage
      const userData = {
        role,
        hasCompletedProfile: false
      };
      
      localStorage.setItem(`bloodlink_user_${firebaseUser.uid}`, JSON.stringify(userData));
      
      const formattedUser = formatUser(firebaseUser, role, false);
      setUser(formattedUser);
      toast.success("Registration successful!");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("Not authenticated");

    try {
      // Update Firebase displayName if name is provided
      if (data.name && auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: data.name
        });
      }
      
      // Update local storage with role and profile status
      const storedUserData = localStorage.getItem(`bloodlink_user_${user.id}`);
      let userData = {
        role: user.role,
        hasCompletedProfile: user.hasCompletedProfile || false
      };
      
      if (storedUserData) {
        try {
          userData = JSON.parse(storedUserData);
        } catch (error) {
          console.error("Failed to parse stored user data:", error);
        }
      }
      
      // Update with new data
      if (data.role) userData.role = data.role;
      if (data.hasCompletedProfile !== undefined) userData.hasCompletedProfile = data.hasCompletedProfile;
      
      localStorage.setItem(`bloodlink_user_${user.id}`, JSON.stringify(userData));
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...data } : null);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
      throw error;
    }
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
