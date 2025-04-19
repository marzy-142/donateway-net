import { toast } from "sonner";
import { mockDbService } from "./mockDbService";
import { Donor, Hospital, Recipient, User, BloodType, Appointment } from "@/types";

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
        return [];
      }

      const availableDonors = donors.filter(donor => donor.isAvailable);
      
      if (!availableDonors.length) {
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
      
      matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      
      return matches;
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load match data");
      return [];
    }
  },
  
  calculateCompatibilityScore(donor: Donor, recipient: Recipient): number {
    let score = 70;
    
    if (donor.bloodType === recipient.bloodType) {
      score += 15;
    }
    
    if (recipient.urgency === 'critical') {
      score += 25;
    } else if (recipient.urgency === 'urgent') {
      score += 15;
    }
    
    if (donor.lastDonationDate) {
      const lastDonation = new Date(donor.lastDonationDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      if (lastDonation > threeMonthsAgo) {
        score -= 10;
      }
    }
    
    return Math.max(0, Math.min(score, 100));
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
      
      const activeDonors = donors.filter(donor => donor.isAvailable).length;
      const activeRecipients = recipients.length;
      const completedDonations = referrals.filter(ref => ref.status === 'completed').length;
      const pendingMatches = referrals.filter(ref => ref.status === 'pending').length;
      
      const bloodTypeDistribution: Record<BloodType, number> = {
        'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
      };
      
      donors.forEach(donor => {
        bloodTypeDistribution[donor.bloodType]++;
      });
      
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
  
  async createReferral(donorId: string, recipientId: string, hospitalId: string) {
    try {
      const donor = await mockDbService.getDonorById(donorId);
      const recipient = await mockDbService.getRecipientById(recipientId);
      const hospital = await mockDbService.getHospitalById(hospitalId);
      
      if (!donor) {
        toast.error("Donor not found or no longer available");
        throw new Error("Donor not found");
      }
      
      if (!recipient) {
        toast.error("Recipient not found");
        throw new Error("Recipient not found");
      }
      
      if (!hospital) {
        toast.error("Hospital not found");
        throw new Error("Hospital not found");
      }
      
      if (!this.isBloodCompatible(donor.bloodType, recipient.bloodType)) {
        toast.error("Blood types are not compatible");
        throw new Error("Incompatible blood types");
      }
      
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
      toast.error(`Failed to create referral: ${(error as Error).message}`);
      throw error;
    }
  },
  
  async updateReferralStatus(referralId: string, newStatus: string) {
    try {
      const referrals = await mockDbService.getReferrals();
      const referral = referrals.find(r => r.id === referralId);
      
      if (!referral) {
        toast.error("Referral not found");
        return false;
      }
      
      if (newStatus === 'completed') {
        const donor = await mockDbService.getDonorById(referral.donorId);
        if (donor) {
          await mockDbService.updateDonorLastDonationDate(referral.donorId, new Date());
          mockDbService.addNotification(donor.userId, `Your blood donation for recipient ${referral.recipientName} has been completed. Thank you for your life-saving contribution!`);
          
          const recipient = await mockDbService.getRecipientById(referral.recipientId);
          if (recipient) {
            mockDbService.addNotification(recipient.userId, `Your blood donation from ${donor.name} has been completed. We hope this helps in your recovery!`);
          }
        }
      }
      
      await mockDbService.updateReferralStatus(referralId, newStatus);
      toast.success(`Referral status updated to ${newStatus}`);
      return true;
    } catch (error) {
      console.error("Error updating referral status:", error);
      toast.error("Failed to update referral status");
      return false;
    }
  },
  
  async getAllAppointments(): Promise<Appointment[]> {
    try {
      const appointments = await mockDbService.getAppointments();
      const users = await this.getAllUsers();
      const hospitals = await this.getAllHospitals();
      
      return appointments.map(appointment => {
        const user = users.find(u => u.id === appointment.userId);
        const hospital = hospitals.find(h => h.id === appointment.hospitalId);
        
        return {
          ...appointment,
          userName: user?.name || 'Unknown User',
          hospitalName: hospital?.name || 'Unknown Hospital'
        };
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
      return [];
    }
  },
  
  async updateAppointmentStatus(appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled'): Promise<boolean> {
    try {
      await mockDbService.updateAppointmentStatus(appointmentId, status);
      toast.success(`Appointment ${status} successfully`);
      return true;
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
      return false;
    }
  }
};

export default adminService;
