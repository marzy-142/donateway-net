
import { Donor, Hospital, Recipient, User, BloodType, Referral, Notification } from "@/types";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";

export const mockDbService = {
  getDonors: async (): Promise<Donor[]> => {
    try {
      const storedDonors = localStorage.getItem('bloodlink_donors');
      if (storedDonors) {
        // Filter out donors that don't correspond to registered users
        const donors = JSON.parse(storedDonors);
        const registeredDonors = [];
        
        for (const donor of donors) {
          const userKey = `bloodlink_user_${donor.userId}`;
          if (localStorage.getItem(userKey)) {
            registeredDonors.push(donor);
          }
        }
        
        return registeredDonors;
      }
      return [];
    } catch (error) {
      console.error("Error fetching donors:", error);
      return [];
    }
  },

  createDonor: async (donor: Omit<Donor, 'id'>): Promise<Donor> => {
    try {
      const newDonor: Donor = {
        id: `donor-${Date.now()}`,
        ...donor,
      };

      const donors = await mockDbService.getDonors();
      donors.push(newDonor);
      localStorage.setItem('bloodlink_donors', JSON.stringify(donors));

      return newDonor;
    } catch (error) {
      console.error("Error creating donor:", error);
      throw error;
    }
  },

  getDonorById: async (donorId: string): Promise<Donor | null> => {
    try {
      const donors = await mockDbService.getDonors();
      const donor = donors.find(d => d.id === donorId);
      return donor || null;
    } catch (error) {
      console.error("Error fetching donor by ID:", error);
      return null;
    }
  },

  getRecipients: async (): Promise<Recipient[]> => {
    try {
      const storedRecipients = localStorage.getItem('bloodlink_recipients');
      if (storedRecipients) {
        // Filter out recipients that don't correspond to registered users
        const recipients = JSON.parse(storedRecipients);
        const registeredRecipients = [];
        
        for (const recipient of recipients) {
          const userKey = `bloodlink_user_${recipient.userId}`;
          if (localStorage.getItem(userKey)) {
            registeredRecipients.push(recipient);
          }
        }
        
        return registeredRecipients;
      }
      return [];
    } catch (error) {
      console.error("Error fetching recipients:", error);
      return [];
    }
  },

  getRecipientById: async (recipientId: string): Promise<Recipient | null> => {
    try {
      const recipients = await mockDbService.getRecipients();
      const recipient = recipients.find(r => r.id === recipientId);
      return recipient || null;
    } catch (error) {
      console.error("Error fetching recipient by ID:", error);
      return null;
    }
  },

  getCompatibleRecipients: async (donorBloodType: BloodType): Promise<Recipient[]> => {
    try {
      const recipients = await mockDbService.getRecipients();
      const compatibleRecipients = recipients.filter(recipient => 
        adminService.isBloodCompatible(donorBloodType, recipient.bloodType)
      );
      return compatibleRecipients;
    } catch (error) {
      console.error("Error fetching compatible recipients:", error);
      return [];
    }
  },

  createRecipient: async (recipient: Omit<Recipient, 'id'>): Promise<Recipient> => {
    try {
      const newRecipient: Recipient = {
        id: `recipient-${Date.now()}`,
        ...recipient,
      };

      const recipients = await mockDbService.getRecipients();
      recipients.push(newRecipient);
      localStorage.setItem('bloodlink_recipients', JSON.stringify(recipients));

      return newRecipient;
    } catch (error) {
      console.error("Error creating recipient:", error);
      throw error;
    }
  },

  getHospitals: async (): Promise<Hospital[]> => {
    try {
      const storedHospitals = localStorage.getItem('bloodlink_hospitals');
      if (storedHospitals) {
        return JSON.parse(storedHospitals);
      }

      const defaultHospitals: Hospital[] = [
        {
          id: 'hospital-1',
          name: 'City General Hospital',
          location: 'Downtown',
          phone: '777-888-9999',
          availableBloodTypes: ['A+', 'B+', 'O-', 'AB+'],
        }
      ];

      localStorage.setItem('bloodlink_hospitals', JSON.stringify(defaultHospitals));
      return defaultHospitals;
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      return [];
    }
  },

  getReferrals: async () => {
    try {
      const storedReferrals = localStorage.getItem('bloodlink_referrals');
      
      if (storedReferrals) {
        return JSON.parse(storedReferrals);
      }
      
      return [];
    } catch (error) {
      console.error("Error getting referrals:", error);
      return [];
    }
  },
  
  createReferral: async (referral: {donorId: string, recipientId: string, hospitalId: string, status: string}) => {
    try {
      // Get existing referrals
      let referrals = [];
      const storedReferrals = localStorage.getItem('bloodlink_referrals');
      
      if (storedReferrals) {
        referrals = JSON.parse(storedReferrals);
      }
      
      // Get donor and recipient information
      const donor = await mockDbService.getDonorById(referral.donorId);
      const recipient = await mockDbService.getRecipientById(referral.recipientId);
      const hospital = await mockDbService.getHospitalById(referral.hospitalId);
      
      if (!donor || !recipient || !hospital) {
        throw new Error("Missing donor, recipient, or hospital information");
      }
      
      // Create new referral
      const newReferral = {
        id: `ref-${referral.donorId}-${referral.recipientId}-${Date.now()}`,
        donorId: referral.donorId,
        donorName: donor.name,
        recipientId: referral.recipientId,
        recipientName: recipient.name,
        hospitalId: referral.hospitalId,
        hospitalName: hospital.name,
        status: referral.status,
        createdAt: new Date()
      };
      
      // Add to referrals and save to localStorage
      referrals.push(newReferral);
      localStorage.setItem('bloodlink_referrals', JSON.stringify(referrals));
      
      // Add notifications for donor and recipient
      mockDbService.addNotification(donor.userId, `New blood donation referral created with recipient ${recipient.name}`);
      mockDbService.addNotification(recipient.userId, `New blood donation referral created with donor ${donor.name}`);
      
      toast.success("Referral created successfully!");
      
      return newReferral;
    } catch (error) {
      console.error("Error creating referral:", error);
      toast.error("Failed to create referral: " + (error as Error).message);
      throw error;
    }
  },
  
  updateReferralStatus: async (referralId: string, newStatus: string) => {
    try {
      // Get existing referrals
      const storedReferrals = localStorage.getItem('bloodlink_referrals');
      
      if (!storedReferrals) {
        throw new Error("No referrals found");
      }
      
      let referrals = JSON.parse(storedReferrals);
      
      // Find and update the referral
      const updatedReferrals = referrals.map(ref => {
        if (ref.id === referralId) {
          return { ...ref, status: newStatus };
        }
        return ref;
      });
      
      // Save updated referrals
      localStorage.setItem('bloodlink_referrals', JSON.stringify(updatedReferrals));
      
      return true;
    } catch (error) {
      console.error("Error updating referral status:", error);
      throw error;
    }
  },
  
  getHospitalById: async (hospitalId: string): Promise<Hospital | null> => {
    try {
      const hospitals = await mockDbService.getHospitals();
      const hospital = hospitals.find(h => h.id === hospitalId);
      return hospital || null;
    } catch (error) {
      console.error("Error fetching hospital by ID:", error);
      return null;
    }
  },
  
  addNotification: (userId: string, message: string) => {
    try {
      let notifications = [];
      const storedNotifications = localStorage.getItem(`bloodlink_notifications_${userId}`);
      
      if (storedNotifications) {
        notifications = JSON.parse(storedNotifications);
      }
      
      notifications.push({
        id: `notification-${Date.now()}`,
        message,
        read: false,
        createdAt: new Date()
      });
      
      localStorage.setItem(`bloodlink_notifications_${userId}`, JSON.stringify(notifications));
      return true;
    } catch (error) {
      console.error("Error adding notification:", error);
      return false;
    }
  },
  
  getNotifications: async (userId: string) => {
    try {
      const storedNotifications = localStorage.getItem(`bloodlink_notifications_${userId}`);
      
      if (storedNotifications) {
        return JSON.parse(storedNotifications);
      }
      
      return [];
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  },
  
  markNotificationAsRead: async (userId: string, notificationId: string) => {
    try {
      const storedNotifications = localStorage.getItem(`bloodlink_notifications_${userId}`);
      
      if (!storedNotifications) {
        return false;
      }
      
      const notifications = JSON.parse(storedNotifications);
      
      // Update notification
      const updatedNotifications = notifications.map(notification => {
        if (notification.id === notificationId) {
          return { ...notification, read: true };
        }
        return notification;
      });
      
      // Save updated notifications
      localStorage.setItem(`bloodlink_notifications_${userId}`, JSON.stringify(updatedNotifications));
      
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }
};

import { adminService } from "./adminService";

export default mockDbService;
