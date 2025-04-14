
import { toast } from "sonner";
import { mockDbService } from "./mockDbService";
import { Donor, Hospital, Recipient, User, BloodType, UserRole } from "@/types";

export const adminService = {
  // User management
  async getAllUsers(): Promise<User[]> {
    try {
      // Collect users from localStorage
      const users: User[] = [];
      
      // Iterate through all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Check for user-related keys
        if (key?.startsWith('bloodlink_user_')) {
          try {
            const userId = key.replace('bloodlink_user_', '');
            const userData = JSON.parse(localStorage.getItem(key) || '{}');
            
            // Ensure all required fields are present
            const user: User = {
              id: userId,
              email: userData.email || `user${userId.substring(0, 4)}@example.com`,
              name: userData.name || `User ${userId.substring(0, 4)}`,
              role: userData.role || 'donor', // Default to donor if no role
              createdAt: new Date(userData.createdAt || Date.now()),
              hasCompletedProfile: userData.hasCompletedProfile || false,
              avatar: userData.avatar // Optional avatar
            };
            
            // Add the user to the list
            users.push(user);
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }
      }
      
      // Log the retrieved users for debugging
      console.log('Retrieved Users:', users);
      
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load user data");
      return [];
    }
  },
  
  // Match management
  async getAllMatches() {
    try {
      const donors = await mockDbService.getDonors();
      const recipients = await mockDbService.getRecipients();
      
      if (!donors.length || !recipients.length) {
        console.log("No donors or recipients found for matches");
        return [];
      }

      // Generate matches based on blood type compatibility
      const matches = [];
      
      for (const donor of donors) {
        if (!donor.isAvailable) continue; // Skip unavailable donors
        
        const compatibleRecipients = recipients.filter(recipient => 
          this.isBloodCompatible(donor.bloodType, recipient.bloodType)
        );
        
        for (const recipient of compatibleRecipients) {
          matches.push({
            id: `match-${donor.id}-${recipient.id}`,
            donor: donor,
            recipient: recipient,
            status: Math.random() > 0.5 ? 'approved' : 'pending',
            matchDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
          });
        }
      }
      
      console.log(`Generated ${matches.length} potential matches`, matches);
      return matches;
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load match data");
      return [];
    }
  },
  
  // Hospital management
  async getAllHospitals(): Promise<Hospital[]> {
    try {
      return await mockDbService.getHospitals();
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      toast.error("Failed to load hospital data");
      return [];
    }
  },
  
  // Analytics data
  async getAnalyticsData() {
    try {
      const donors = await mockDbService.getDonors();
      const recipients = await mockDbService.getRecipients();
      const hospitals = await mockDbService.getHospitals();
      
      // Calculate statistics
      const activeDonors = donors.filter(donor => donor.isAvailable).length;
      const activeRecipients = recipients.length;
      const completedDonations = Math.floor(Math.random() * 200) + 50; // Mock data
      const pendingMatches = Math.floor(Math.random() * 30) + 5; // Mock data
      
      // Blood type distribution
      const bloodTypeDistribution: Record<BloodType, number> = {
        'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
      };
      
      donors.forEach(donor => {
        bloodTypeDistribution[donor.bloodType]++;
      });
      
      return {
        stats: {
          activeDonors,
          activeRecipients,
          pendingMatches,
          completedDonations,
          totalHospitals: hospitals.length,
        },
        bloodTypeDistribution,
        // Monthly donation trend (mock data)
        monthlyDonations: [
          { month: 'Jan', donations: 45 },
          { month: 'Feb', donations: 52 },
          { month: 'Mar', donations: 49 },
          { month: 'Apr', donations: 63 },
          { month: 'May', donations: 55 },
          { month: 'Jun', donations: 71 }
        ]
      };
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
      return {
        stats: {
          activeDonors: 0,
          activeRecipients: 0,
          pendingMatches: 0,
          completedDonations: 0,
          totalHospitals: 0
        },
        bloodTypeDistribution: {},
        monthlyDonations: []
      };
    }
  },
  
  // Events management
  async getUpcomingEvents() {
    // Mock data for events
    return [
      {
        id: '1',
        title: 'Blood Donation Drive',
        location: 'Central Hospital',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        participants: 15
      },
      {
        id: '2',
        title: 'Community Awareness Program',
        location: 'City Hall',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        participants: 30
      },
      {
        id: '3',
        title: 'Hospital Staff Training',
        location: 'Medical Center',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        participants: 8
      }
    ];
  },
  
  // System alerts
  async getSystemAlerts() {
    // Mock data for system alerts
    return [
      {
        id: '1',
        type: 'critical',
        message: 'Critical shortage of O- blood type',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        id: '2',
        type: 'warning',
        message: 'AB+ supplies running low',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        id: '3',
        type: 'info',
        message: 'System maintenance scheduled for next weekend',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      }
    ];
  },
  
  // Helper function for blood type compatibility
  isBloodCompatible(donorType: BloodType, recipientType: BloodType): boolean {
    const compatibility: Record<BloodType, BloodType[]> = {
      'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'A-': ['A-', 'A+', 'AB-', 'AB+'],
      'A+': ['A+', 'AB+'],
      'B-': ['B-', 'B+', 'AB-', 'AB+'],
      'B+': ['B+', 'AB+'],
      'AB-': ['AB-', 'AB+'],
      'AB+': ['AB+']
    };
    
    return compatibility[donorType].includes(recipientType);
  }
};

export default adminService;
