
import { toast } from "sonner";
import { mockDbService } from "./mockDbService";
import { Donor, Hospital, Recipient, User, BloodType } from "@/types";

export const adminService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const users: User[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key?.startsWith('bloodlink_user_')) {
          try {
            const userId = key.replace('bloodlink_user_', '');
            const userData = JSON.parse(localStorage.getItem(key) || '{}');
            
            // Only add valid users with required fields
            if (userData && userData.email && userData.name) {
              const user: User = {
                id: userId,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                createdAt: new Date(userData.createdAt || Date.now()),
                hasCompletedProfile: userData.hasCompletedProfile || false,
                avatar: userData.avatar
              };
              
              users.push(user);
            }
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }
      }
      
      console.log('Retrieved Users:', users);
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load user data");
      return [];
    }
  },
  
  async getAllMatches() {
    try {
      const donors = await mockDbService.getDonors();
      const recipients = await mockDbService.getRecipients();
      
      if (!donors.length || !recipients.length) {
        console.log("No donors or recipients found for matches");
        return [];
      }

      // Get only available donors
      const availableDonors = donors.filter(donor => donor.isAvailable);
      
      if (!availableDonors.length) {
        console.log("No available donors found");
        return [];
      }

      const matches = [];
      
      for (const donor of availableDonors) {
        const compatibleRecipients = recipients.filter(recipient => 
          this.isBloodCompatible(donor.bloodType, recipient.bloodType)
        );
        
        for (const recipient of compatibleRecipients) {
          matches.push({
            id: `match-${donor.id}-${recipient.id}`,
            donor: donor,
            recipient: recipient,
            status: 'pending',
            matchDate: new Date(),
            compatibilityScore: this.calculateCompatibilityScore(donor, recipient)
          });
        }
      }
      
      // Sort matches by compatibility score (higher is better)
      matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      
      console.log(`Generated ${matches.length} potential matches`, matches);
      return matches;
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load match data");
      return [];
    }
  },
  
  calculateCompatibilityScore(donor: Donor, recipient: Recipient): number {
    // Basic score starts at 70
    let score = 70;
    
    // Exact blood type match gets a bonus
    if (donor.bloodType === recipient.bloodType) {
      score += 15;
    }
    
    // Urgency affects the score
    if (recipient.urgency === 'critical') {
      score += 25;
    } else if (recipient.urgency === 'urgent') {
      score += 15;
    }
    
    // Recent donors get a small penalty (if they donated in the last 3 months)
    if (donor.lastDonationDate) {
      const lastDonation = new Date(donor.lastDonationDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      if (lastDonation > threeMonthsAgo) {
        score -= 10;
      }
    }
    
    return Math.max(0, Math.min(score, 100)); // Keep score between 0 and 100
  },
  
  async getAllHospitals(): Promise<Hospital[]> {
    try {
      return await mockDbService.getHospitals();
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      toast.error("Failed to load hospital data");
      return [];
    }
  },
  
  async getAnalyticsData() {
    try {
      const donors = await mockDbService.getDonors();
      const recipients = await mockDbService.getRecipients();
      const hospitals = await mockDbService.getHospitals();
      const referrals = await mockDbService.getReferrals();
      
      // Calculate real statistics
      const activeDonors = donors.filter(donor => donor.isAvailable).length;
      const activeRecipients = recipients.length;
      const completedDonations = referrals.filter(ref => ref.status === 'completed').length;
      const pendingMatches = referrals.filter(ref => ref.status === 'pending').length;
      
      // Blood type distribution from real donors
      const bloodTypeDistribution: Record<BloodType, number> = {
        'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
      };
      
      donors.forEach(donor => {
        bloodTypeDistribution[donor.bloodType]++;
      });
      
      // Get real monthly donations from referrals
      const monthlyDonations = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        const donations = referrals.filter(ref => {
          const refDate = new Date(ref.createdAt);
          return refDate.getMonth() === date.getMonth() && 
                 refDate.getFullYear() === date.getFullYear() &&
                 ref.status === 'completed';
        }).length;
        
        return { month, donations };
      }).reverse();
      
      return {
        stats: {
          activeDonors,
          activeRecipients,
          pendingMatches,
          completedDonations,
          totalHospitals: hospitals.length,
        },
        bloodTypeDistribution,
        monthlyDonations
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
  
  // Blood type compatibility helper
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
  },
  
  // Create a referral between donor and recipient
  async createReferral(donorId: string, recipientId: string, hospitalId: string) {
    try {
      const referral = await mockDbService.createReferral({
        donorId,
        recipientId,
        hospitalId,
        status: 'pending'
      });
      
      toast.success("Referral created successfully!");
      return referral;
    } catch (error) {
      console.error("Error creating referral:", error);
      toast.error("Failed to create referral");
      throw error;
    }
  },
  
  // Update referral status
  async updateReferralStatus(referralId: string, newStatus: string) {
    try {
      await mockDbService.updateReferralStatus(referralId, newStatus);
      toast.success(`Referral status updated to ${newStatus}`);
      return true;
    } catch (error) {
      console.error("Error updating referral status:", error);
      toast.error("Failed to update referral status");
      return false;
    }
  }
};

export default adminService;
