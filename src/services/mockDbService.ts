
import { Donor, Hospital, Recipient, User, BloodType, Referral } from "@/types";

export const mockDbService = {
  getDonors: async (): Promise<Donor[]> => {
    try {
      const storedDonors = localStorage.getItem('bloodlink_donors');
      if (storedDonors) {
        return JSON.parse(storedDonors);
      }

      const mockDonors: Donor[] = [
        {
          id: 'donor-1',
          userId: 'user-1',
          name: 'Alice Smith',
          age: 28,
          bloodType: 'A+',
          phone: '123-456-7890',
          email: 'alice.smith@example.com',
          address: '123 Main St',
          isAvailable: true,
        },
        {
          id: 'donor-2',
          userId: 'user-2',
          name: 'Bob Johnson',
          age: 34,
          bloodType: 'B-',
          phone: '987-654-3210',
          email: 'bob.johnson@example.com',
          address: '456 Elm St',
          isAvailable: false,
        },
        {
          id: 'donor-3',
          userId: 'user-3',
          name: 'Charlie Brown',
          age: 22,
          bloodType: 'O+',
          phone: '555-123-4567',
          email: 'charlie.brown@example.com',
          address: '789 Oak St',
          isAvailable: true,
        },
        {
          id: 'donor-4',
          userId: 'user-4',
          name: 'Diana Miller',
          age: 41,
          bloodType: 'AB+',
          phone: '111-222-3333',
          email: 'diana.miller@example.com',
          address: '101 Pine St',
          isAvailable: false,
        },
        {
          id: 'donor-5',
          userId: 'user-5',
          name: 'Ethan Davis',
          age: 29,
          bloodType: 'A-',
          phone: '444-555-6666',
          email: 'ethan.davis@example.com',
          address: '222 Cedar St',
          isAvailable: true,
        },
      ];

      localStorage.setItem('bloodlink_donors', JSON.stringify(mockDonors));
      return mockDonors;
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
        return JSON.parse(storedRecipients);
      }

      // Only create mock recipients if none exist
      const mockRecipients: Recipient[] = [
        {
          id: 'recipient-1',
          userId: 'user-6',
          name: 'Sophia White',
          bloodType: 'B+',
          phone: '222-333-4444',
          preferredHospital: 'City General Hospital',
          urgency: 'urgent',
          medicalCondition: 'Anemia',
        },
        {
          id: 'recipient-2',
          userId: 'user-7',
          name: 'Liam Green',
          bloodType: 'O-',
          phone: '333-444-5555',
          preferredHospital: 'County Medical Center',
          urgency: 'critical',
          medicalCondition: 'Surgery required',
        },
        {
          id: 'recipient-3',
          userId: 'user-8',
          name: 'Olivia Taylor',
          bloodType: 'AB-',
          phone: '444-555-7777',
          preferredHospital: 'State University Hospital',
          urgency: 'normal',
          medicalCondition: 'Routine checkup',
        },
        {
          id: 'recipient-4',
          userId: 'user-9',
          name: 'Noah Anderson',
          bloodType: 'A+',
          phone: '555-666-8888',
          preferredHospital: 'Community Hospital',
          urgency: 'urgent',
          medicalCondition: 'Accident victim',
        },
        {
          id: 'recipient-5',
          userId: 'user-10',
          name: 'Isabella Thomas',
          bloodType: 'B-',
          phone: '666-777-9999',
          preferredHospital: 'Regional Trauma Center',
          urgency: 'critical',
          medicalCondition: 'Emergency transfusion',
        },
      ];

      localStorage.setItem('bloodlink_recipients', JSON.stringify(mockRecipients));
      return mockRecipients;
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

      const mockHospitals: Hospital[] = [
        {
          id: 'hospital-1',
          name: 'City General Hospital',
          location: 'Downtown',
          phone: '777-888-9999',
          availableBloodTypes: ['A+', 'B+', 'O-', 'AB+'],
        },
        {
          id: 'hospital-2',
          name: 'County Medical Center',
          location: 'Suburb',
          phone: '888-999-0000',
          availableBloodTypes: ['A-', 'B-', 'O+', 'AB-'],
        },
        {
          id: 'hospital-3',
          name: 'State University Hospital',
          location: 'University Area',
          phone: '999-000-1111',
          availableBloodTypes: ['A+', 'B-', 'O-', 'AB+'],
        },
      ];

      localStorage.setItem('bloodlink_hospitals', JSON.stringify(mockHospitals));
      return mockHospitals;
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      return [];
    }
  },

  getReferrals: async () => {
    try {
      // Try to get existing referrals from localStorage
      const storedReferrals = localStorage.getItem('bloodlink_referrals');
      
      if (storedReferrals) {
        return JSON.parse(storedReferrals);
      }
      
      // If no referrals exist, create some mock referrals
      const donors = await mockDbService.getDonors();
      const recipients = await mockDbService.getRecipients();
      const hospitals = await mockDbService.getHospitals();
      
      if (donors.length === 0 || recipients.length === 0) {
        return [];
      }
      
      // Generate some mock referrals
      const mockReferrals = [];
      
      for (let i = 0; i < Math.min(donors.length, recipients.length); i++) {
        const donor = donors[i];
        const recipient = recipients[i];
        const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
        
        // Only create referrals if blood types are compatible
        if (adminService.isBloodCompatible(donor.bloodType, recipient.bloodType)) {
          mockReferrals.push({
            id: `ref-${donor.id}-${recipient.id}`,
            donorId: donor.id,
            donorName: donor.name,
            recipientId: recipient.id,
            recipientName: recipient.name,
            hospitalId: hospital.id,
            hospitalName: hospital.name,
            status: Math.random() > 0.5 ? 'approved' : 'pending',
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          });
        }
      }
      
      // Store the mock referrals
      localStorage.setItem('bloodlink_referrals', JSON.stringify(mockReferrals));
      
      return mockReferrals;
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
      
      return newReferral;
    } catch (error) {
      console.error("Error creating referral:", error);
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
  
  // Notification system
  addNotification: (userId: string, message: string) => {
    try {
      // Get existing notifications
      let notifications = [];
      const storedNotifications = localStorage.getItem(`bloodlink_notifications_${userId}`);
      
      if (storedNotifications) {
        notifications = JSON.parse(storedNotifications);
      }
      
      // Add new notification
      notifications.push({
        id: `notification-${Date.now()}`,
        message,
        read: false,
        createdAt: new Date()
      });
      
      // Save to localStorage
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
