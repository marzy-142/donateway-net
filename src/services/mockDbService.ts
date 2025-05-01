import {
  Donor,
  Hospital,
  Recipient,
  User,
  BloodType,
  Referral,
  Notification,
  Appointment,
  Match,
} from "@/types";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";

interface RawDonor
  extends Omit<
    Donor,
    "bloodType" | "lastDonationDate" | "createdAt" | "updatedAt"
  > {
  bloodType: string;
  lastDonationDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RawRecipient
  extends Omit<Recipient, "bloodType" | "createdAt" | "updatedAt"> {
  bloodType: string;
  createdAt: string;
  updatedAt: string;
}

interface RawReferral {
  id: string;
  donorId: string;
  recipientId: string;
  hospitalId: string;
  status: "pending" | "completed" | "cancelled" | "matched" | "scheduled";
  createdAt: string;
  updatedAt: string;
  donorName?: string;
  donorBloodType?: string;
  recipientName?: string;
  hospitalName?: string;
  transfusionDetails?: {
    scheduledDate?: string;
    scheduledTime?: string;
    hospitalLocation?: string;
    hospitalContactPerson?: string;
    hospitalContactNumber?: string;
    preparationInstructions?: string[];
    requiredDocuments?: string[];
    roomNumber?: string;
    department?: string;
    estimatedDuration?: string;
    specialInstructions?: string;
  };
}

interface RawMatch {
  id: string;
  donorId: string;
  recipientId: string;
  compatibilityScore: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export const mockDbService = {
  // Helper function to get current user ID
  getCurrentUserId: () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user");
    }
    return currentUser.uid;
  },

  getDonors: (): Donor[] => {
    const donorsJson = localStorage.getItem("bloodlink_donors");
    if (!donorsJson) return [];
    const rawDonors = JSON.parse(donorsJson) as RawDonor[];
    return rawDonors.map((donor: RawDonor) => ({
      ...donor,
      bloodType: donor.bloodType as BloodType,
      lastDonationDate: donor.lastDonationDate
        ? new Date(donor.lastDonationDate)
        : null,
      createdAt: new Date(donor.createdAt),
      updatedAt: new Date(donor.updatedAt),
    }));
  },

  updateAppointmentStatus: async (
    appointmentId: string,
    status: "scheduled" | "completed" | "cancelled"
  ) => {
    try {
      // Get appointments from localStorage
      const appointments = await mockDbService.getAppointments();

      // Find the appointment
      const appointmentIndex = appointments.findIndex(
        (a) => a.id === appointmentId
      );

      if (appointmentIndex === -1) {
        throw new Error("Appointment not found");
      }

      // Update the status
      const updatedAppointments = [...appointments];
      updatedAppointments[appointmentIndex] = {
        ...updatedAppointments[appointmentIndex],
        status,
      };

      // Save back to localStorage
      localStorage.setItem(
        "bloodlink_appointments",
        JSON.stringify(updatedAppointments)
      );

      return updatedAppointments[appointmentIndex];
    } catch (error) {
      console.error("Error updating appointment status:", error);
      throw error;
    }
  },

  createDonor: async (
    donorData: Omit<Donor, "id" | "userId" | "isAvailable">
  ): Promise<Donor> => {
    try {
      const userId = mockDbService.getCurrentUserId();
      const donors = await mockDbService.getDonors();

      // Check if donor already exists for this user
      if (donors.some((d) => d.userId === userId)) {
        throw new Error("Donor profile already exists for this user");
      }

      const newDonor: Donor = {
        id: `donor-${Date.now()}`,
        userId,
        ...donorData,
        isAvailable: true,
      };

      donors.push(newDonor);
      localStorage.setItem("bloodlink_donors", JSON.stringify(donors));
      return newDonor;
    } catch (error) {
      console.error("Error creating donor:", error);
      throw error;
    }
  },

  getDonorById: async (donorId: string): Promise<Donor | null> => {
    try {
      const donors = await mockDbService.getDonors();
      const donor = donors.find((d) => d.id === donorId);
      return donor || null;
    } catch (error) {
      console.error("Error fetching donor by ID:", error);
      return null;
    }
  },

  getDonorByUserId: async (userId: string): Promise<Donor | null> => {
    try {
      const donors = await mockDbService.getDonors();
      const donor = donors.find((d) => d.userId === userId);
      return donor || null;
    } catch (error) {
      console.error("Error fetching donor by user ID:", error);
      return null;
    }
  },

  updateDonorLastDonationDate: async (
    donorId: string,
    date: Date
  ): Promise<boolean> => {
    try {
      const donors = await mockDbService.getDonors();
      const updatedDonors = donors.map((donor) => {
        if (donor.id === donorId) {
          return { ...donor, lastDonationDate: date };
        }
        return donor;
      });

      localStorage.setItem("bloodlink_donors", JSON.stringify(updatedDonors));
      return true;
    } catch (error) {
      console.error("Error updating donor donation date:", error);
      return false;
    }
  },

  updateDonorAvailability: async (
    donorId: string,
    isAvailable: boolean
  ): Promise<boolean> => {
    try {
      const donors = await mockDbService.getDonors();
      const updatedDonors = donors.map((donor) => {
        if (donor.id === donorId) {
          return { ...donor, isAvailable };
        }
        return donor;
      });

      localStorage.setItem("bloodlink_donors", JSON.stringify(updatedDonors));
      return true;
    } catch (error) {
      console.error("Error updating donor availability:", error);
      return false;
    }
  },

  checkAndUpdateDonorAvailability: async (
    donorId: string
  ): Promise<boolean> => {
    try {
      const donor = await mockDbService.getDonorById(donorId);
      if (!donor) return false;

      const now = new Date();
      const lastDonation = donor.lastDonationDate
        ? new Date(donor.lastDonationDate)
        : null;
      const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));

      // If donor has never donated or last donation was more than 3 months ago
      const shouldBeAvailable = !lastDonation || lastDonation < threeMonthsAgo;

      // Only update if the current availability doesn't match what it should be
      if (donor.isAvailable !== shouldBeAvailable) {
        return await mockDbService.updateDonorAvailability(
          donorId,
          shouldBeAvailable
        );
      }

      return true;
    } catch (error) {
      console.error("Error checking donor availability:", error);
      return false;
    }
  },

  getRecipients: (): Recipient[] => {
    console.log('Getting recipients from storage');
    const recipientsJson = localStorage.getItem("bloodlink_recipients");
    console.log('Recipients JSON:', recipientsJson);
    if (!recipientsJson) return [];
    const rawRecipients = JSON.parse(recipientsJson) as RawRecipient[];
    console.log('Raw recipients:', rawRecipients);
    const recipients = rawRecipients.map((recipient: RawRecipient) => ({
      ...recipient,
      bloodType: recipient.bloodType as BloodType,
      createdAt: new Date(recipient.createdAt),
      updatedAt: new Date(recipient.updatedAt),
    }));
    console.log('Processed recipients:', recipients);
    return recipients;
  },

  getRecipientById: async (recipientId: string): Promise<Recipient | null> => {
    try {
      const recipients = await mockDbService.getRecipients();
      const recipient = recipients.find((r) => r.id === recipientId);
      return recipient || null;
    } catch (error) {
      console.error("Error fetching recipient by ID:", error);
      return null;
    }
  },

  getRecipientByUserId: async (userId: string): Promise<Recipient | null> => {
    try {
      const recipients = await mockDbService.getRecipients();
      const recipient = recipients.find((r) => r.userId === userId);
      return recipient || null;
    } catch (error) {
      console.error("Error fetching recipient by user ID:", error);
      return null;
    }
  },

  getCompatibleRecipients: async (
    donorBloodType: BloodType
  ): Promise<Recipient[]> => {
    try {
      const recipients = await mockDbService.getRecipients();
      console.log('Initial recipients:', recipients);
      
      // Get all referrals to check for completed ones
      const referrals = await mockDbService.getReferrals();
      
      // Get IDs of recipients who have completed referrals
      const recipientReferralStatus = new Map();
      referrals.forEach(ref => {
        // Only update if it's completed, otherwise keep existing status
        if (ref.status === "completed") {
          recipientReferralStatus.set(ref.recipientId, "completed");
        } else if (!recipientReferralStatus.has(ref.recipientId)) {
          recipientReferralStatus.set(ref.recipientId, ref.status);
        }
      });
      console.log('Recipient referral statuses:', Object.fromEntries(recipientReferralStatus));

      // Filter out only recipients who have completed referrals and check blood compatibility
      const compatibleRecipients = recipients.filter(recipient => {
        const status = recipientReferralStatus.get(recipient.id);
        const isCompatible = adminService.isBloodCompatible(donorBloodType, recipient.bloodType);
        console.log('Checking recipient:', {
          id: recipient.id,
          bloodType: recipient.bloodType,
          status,
          isCompatible,
          willInclude: (!status || status !== "completed") && isCompatible
        });
        // Include recipient if they have no referrals or their referrals aren't completed
        return (!status || status !== "completed") &&
          adminService.isBloodCompatible(donorBloodType, recipient.bloodType);
      });

      return compatibleRecipients;
    } catch (error) {
      console.error("Error fetching compatible recipients:", error);
      return [];
    }
  },

  createRecipient: async (
    recipientData: Omit<Recipient, "id" | "userId">
  ): Promise<Recipient> => {
    try {
      const userId = mockDbService.getCurrentUserId();
      const recipients = await mockDbService.getRecipients();

      // Check if recipient already exists for this user
      if (recipients.some((r) => r.userId === userId)) {
        throw new Error("Recipient profile already exists for this user");
      }

      const newRecipient: Recipient = {
        id: `recipient-${Date.now()}`,
        userId,
        ...recipientData,
      };

      recipients.push(newRecipient);
      localStorage.setItem("bloodlink_recipients", JSON.stringify(recipients));
      return newRecipient;
    } catch (error) {
      console.error("Error creating recipient:", error);
      throw error;
    }
  },

  getHospitals: async (): Promise<Hospital[]> => {
    try {
      const storedHospitals = localStorage.getItem("bloodlink_hospitals");
      if (storedHospitals) {
        return JSON.parse(storedHospitals);
      }

      // Initialize with default data if no hospitals exist
      const defaultHospitals: Hospital[] = [
        {
          id: "1",
          name: "City General Hospital",
          location: "123 Main St, City",
          phone: "+1 (555) 123-4567",
          bloodTypes: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date("2025-01-01"),
        },
        {
          id: "2",
          name: "Community Medical Center",
          location: "456 Oak Ave, Town",
          phone: "+1 (555) 987-6543",
          bloodTypes: ["A+", "B+", "O+", "AB+"],
          createdAt: new Date("2025-01-02"),
          updatedAt: new Date("2025-01-02"),
        },
        {
          id: "3",
          name: "Regional Blood Bank",
          location: "789 Pine Rd, Region",
          phone: "+1 (555) 456-7890",
          bloodTypes: ["A-", "B-", "O-", "AB-"],
          createdAt: new Date("2025-01-03"),
          updatedAt: new Date("2025-01-03"),
        },
      ];

      localStorage.setItem("bloodlink_hospitals", JSON.stringify(defaultHospitals));
      return defaultHospitals;
    } catch (error) {
      console.error("Error getting hospitals:", error);
      return [];
    }
  },

  getHospitalById: async (hospitalId: string): Promise<Hospital | null> => {
    try {
      const hospitals = await mockDbService.getHospitals();
      const hospital = hospitals.find((h) => h.id === hospitalId);
      return hospital || null;
    } catch (error) {
      console.error("Error fetching hospital by ID:", error);
      return null;
    }
  },

  createHospital: async (hospitalData: Omit<Hospital, "id" | "createdAt" | "updatedAt">): Promise<Hospital> => {
    try {
      const storedHospitals = localStorage.getItem("bloodlink_hospitals");
      const hospitals = storedHospitals ? JSON.parse(storedHospitals) : [];

      const now = new Date();
      const newHospital: Hospital = {
        id: Math.random().toString(36).substr(2, 9),
        ...hospitalData,
        createdAt: now,
        updatedAt: now,
      };

      hospitals.push(newHospital);
      localStorage.setItem("bloodlink_hospitals", JSON.stringify(hospitals));
      return newHospital;
    } catch (error) {
      console.error("Error creating hospital:", error);
      throw error;
    }
  },

  updateHospital: async (id: string, hospitalData: Partial<Omit<Hospital, "id" | "createdAt" | "updatedAt">>): Promise<Hospital> => {
    try {
      const storedHospitals = localStorage.getItem("bloodlink_hospitals");
      if (!storedHospitals) {
        throw new Error("No hospitals found");
      }

      const hospitals = JSON.parse(storedHospitals);

      // Find the hospital to update
      const hospitalToUpdate = hospitals.find((h) => h.id === id);
      if (!hospitalToUpdate) {
        throw new Error("Hospital not found");
      }

      const now = new Date();
      // Update the hospital
      const updatedHospitals = hospitals.map((hospital) => {
        if (hospital.id === id) {
          return {
            ...hospital,
            ...hospitalData,
            updatedAt: now,
          };
        }
        return hospital;
      });

      // Save updated hospitals
      localStorage.setItem(
        "bloodlink_hospitals",
        JSON.stringify(updatedHospitals)
      );

      return updatedHospitals.find((h) => h.id === id) as Hospital;
    } catch (error) {
      console.error("Error updating hospital:", error);
      throw error;
    }
  },

  deleteHospital: async (id: string): Promise<boolean> => {
    try {
      const storedHospitals = localStorage.getItem("bloodlink_hospitals");
      if (!storedHospitals) {
        return false;
      }

      const hospitals = JSON.parse(storedHospitals);

      // Find the hospital to delete
      const hospitalIndex = hospitals.findIndex((h) => h.id === id);
      if (hospitalIndex === -1) {
        return false;
      }

      // Remove the hospital
      const updatedHospitals = [...hospitals];
      updatedHospitals.splice(hospitalIndex, 1);

      // Save updated hospitals
      localStorage.setItem(
        "bloodlink_hospitals",
        JSON.stringify(updatedHospitals)
      );

      return true;
    } catch (error) {
      console.error("Error deleting hospital:", error);
      return false;
    }
  },

  getReferrals: async () => {
    try {
      const referralsJson = localStorage.getItem("bloodlink_referrals");
      if (!referralsJson) return [];

      const rawReferrals = JSON.parse(referralsJson) as RawReferral[];
      return rawReferrals.map((ref) => ({
        ...ref,
        createdAt: new Date(ref.createdAt),
        updatedAt: new Date(ref.updatedAt),
        transfusionDetails: ref.transfusionDetails
          ? {
              ...ref.transfusionDetails,
              scheduledDate: ref.transfusionDetails.scheduledDate
                ? new Date(ref.transfusionDetails.scheduledDate)
                : undefined,
            }
          : undefined,
      }));
    } catch (error) {
      console.error("Error fetching referrals:", error);
      return [];
    }
  },

  getReferralsByUserId: async (userId: string): Promise<Referral[]> => {
    try {
      // Get all referrals
      const allReferrals = await mockDbService.getReferrals();

      // Get donor and recipient by userId
      const donor = await mockDbService.getDonorByUserId(userId);
      const recipient = await mockDbService.getRecipientByUserId(userId);

      // Filter referrals for this user
      return allReferrals.filter(
        (ref) =>
          (donor && ref.donorId === donor.id) ||
          (recipient && ref.recipientId === recipient.id)
      );
    } catch (error) {
      console.error("Error getting referrals by user ID:", error);
      return [];
    }
  },

  createReferral: async (referral: {
    donorId: string;
    recipientId: string;
    hospitalId: string;
    status: string;
  }) => {
    try {
      // Get existing referrals
      const storedReferrals = localStorage.getItem("bloodlink_referrals");
      const referrals = storedReferrals ? JSON.parse(storedReferrals) : [];

      // Get donor and recipient information
      const donor = await mockDbService.getDonorById(referral.donorId);
      const recipient = await mockDbService.getRecipientById(
        referral.recipientId
      );
      const hospital = await mockDbService.getHospitalById(referral.hospitalId);

      if (!donor || !recipient || !hospital) {
        throw new Error("Missing donor, recipient, or hospital information");
      }

      const now = new Date();
      // Create new referral
      const newReferral = {
        id: `ref-${Date.now()}`,
        donorId: referral.donorId,
        donorName: donor.name,
        donorBloodType: donor.bloodType,
        recipientId: referral.recipientId,
        recipientName: recipient.name,
        hospitalId: referral.hospitalId,
        hospitalName: hospital.name,
        status: referral.status,
        createdAt: now,
        updatedAt: now,
      };

      // Add to referrals and save to localStorage
      referrals.push(newReferral);
      localStorage.setItem("bloodlink_referrals", JSON.stringify(referrals));

      // Add notifications for donor and recipient
      mockDbService.addNotification(
        donor.userId,
        `New blood donation referral created with recipient ${recipient.name} at ${hospital.name}`
      );
      mockDbService.addNotification(
        recipient.userId,
        `New blood donation referral created with donor ${donor.name} at ${hospital.name}`
      );

      return newReferral;
    } catch (error) {
      console.error("Error creating referral:", error);
      throw error;
    }
  },

  updateReferralStatus: async (
    referralId: string,
    newStatus: Referral["status"]
  ) => {
    try {
      const referrals = await mockDbService.getReferrals();
      const referralIndex = referrals.findIndex((r) => r.id === referralId);

      if (referralIndex === -1) {
        throw new Error("Referral not found");
      }

      const updatedReferral: Referral = {
        ...referrals[referralIndex],
        status: newStatus,
        updatedAt: new Date(),
      };

      // Convert Dates to ISO strings for storage
      const rawReferrals = referrals.map(ref => ({
        ...ref,
        createdAt: ref.createdAt.toISOString(),
        updatedAt: ref.updatedAt.toISOString(),
        transfusionDetails: ref.transfusionDetails
          ? {
              ...ref.transfusionDetails,
              scheduledDate: ref.transfusionDetails.scheduledDate
                ? ref.transfusionDetails.scheduledDate.toISOString()
                : undefined,
            }
          : undefined,
      }));

      // Update the specific referral
      rawReferrals[referralIndex] = {
        ...updatedReferral,
        createdAt: updatedReferral.createdAt.toISOString(),
        updatedAt: updatedReferral.updatedAt.toISOString(),
        transfusionDetails: updatedReferral.transfusionDetails
          ? {
              ...updatedReferral.transfusionDetails,
              scheduledDate: updatedReferral.transfusionDetails.scheduledDate
                ? updatedReferral.transfusionDetails.scheduledDate.toISOString()
                : undefined,
            }
          : undefined,
      };

      localStorage.setItem("bloodlink_referrals", JSON.stringify(rawReferrals));
      return updatedReferral;
    } catch (error) {
      console.error("Error updating referral status:", error);
      throw error;
    }
  },

  addNotification: async (
    userId: string,
    message: string,
    type?: Notification["type"],
    metadata?: Notification["metadata"]
  ): Promise<void> => {
    try {
      const notifications = JSON.parse(
        localStorage.getItem("bloodlink_notifications") || "[]"
      );

      const newNotification: Notification = {
        id: `notification-${Date.now()}`,
        message,
        read: false,
        createdAt: new Date(),
        type,
        metadata,
      };

      notifications.push(newNotification);
      localStorage.setItem("bloodlink_notifications", JSON.stringify(notifications));
    } catch (error) {
      console.error("Error adding notification:", error);
      toast.error("Failed to create notification");
    }
  },

  addAdminUpdate: async (
    message: string,
    affectedUsers: { donorId?: string; recipientId?: string; hospitalId?: string },
    status?: string
  ): Promise<void> => {
    try {
      const { donorId, recipientId, hospitalId } = affectedUsers;
      const metadata = { ...affectedUsers, status };

      // If donorId is provided, notify the donor
      if (donorId) {
        const donor = await mockDbService.getDonorById(donorId);
        if (donor) {
          await mockDbService.addNotification(
            donor.userId,
            message,
            "admin_update",
            metadata
          );
        }
      }

      // If recipientId is provided, notify the recipient
      if (recipientId) {
        const recipient = await mockDbService.getRecipientById(recipientId);
        if (recipient) {
          await mockDbService.addNotification(
            recipient.userId,
            message,
            "admin_update",
            metadata
          );
        }
      }
    } catch (error) {
      console.error("Error adding admin update:", error);
      toast.error("Failed to create admin update notification");
    }
  },

  getNotifications: async (): Promise<Notification[]> => {
    try {
      const userId = mockDbService.getCurrentUserId();
      const storedNotifications = JSON.parse(
        localStorage.getItem(`bloodlink_notifications_${userId}`) || "[]"
      ) as Array<{
        id: string;
        message: string;
        read: boolean;
        createdAt: string;
      }>;

      return storedNotifications.map((n) => ({
        ...n,
        createdAt: new Date(n.createdAt),
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  markNotificationAsRead: async (userId: string, notificationId: string) => {
    try {
      const storedNotifications = localStorage.getItem(
        `bloodlink_notifications_${userId}`
      );

      if (!storedNotifications) {
        return false;
      }

      const notifications = JSON.parse(storedNotifications);

      // Update notification
      const updatedNotifications = notifications.map((notification) => {
        if (notification.id === notificationId) {
          return { ...notification, read: true };
        }
        return notification;
      });

      // Save updated notifications
      localStorage.setItem(
        `bloodlink_notifications_${userId}`,
        JSON.stringify(updatedNotifications)
      );

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  },

  getAppointments: async (): Promise<Appointment[]> => {
    try {
      const storedAppointments = localStorage.getItem("bloodlink_appointments");
      if (storedAppointments) {
        const parsedAppointments = JSON.parse(storedAppointments) as Array<{
          id: string;
          userId: string;
          hospitalId: string;
          date: string;
          timeSlot: string;
          status: "scheduled" | "completed" | "cancelled";
          createdAt: string;
          userName?: string;
          donorName?: string;
          hospitalName?: string;
        }>;

        return parsedAppointments.map((appointment) => ({
          ...appointment,
          date: new Date(appointment.date),
          createdAt: new Date(appointment.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return [];
    }
  },

  createAppointment: async (appointmentData: {
    hospitalId: string;
    userId: string;
    date: Date;
    timeSlot: string;
    status: "scheduled" | "completed" | "cancelled";
  }): Promise<Appointment> => {
    try {
      const appointments = await mockDbService.getAppointments();

      // Check for existing appointment at the same time
      const existingAppointment = appointments.find(
        (app) =>
          app.hospitalId === appointmentData.hospitalId &&
          app.date.toDateString() === appointmentData.date.toDateString() &&
          app.timeSlot === appointmentData.timeSlot
      );

      if (existingAppointment) {
        throw new Error("This time slot is already booked");
      }

      const newAppointment: Appointment = {
        id: `appointment-${Date.now()}`,
        ...appointmentData,
        createdAt: new Date(),
      };

      appointments.push(newAppointment);
      localStorage.setItem(
        "bloodlink_appointments",
        JSON.stringify(appointments)
      );

      // Add notification for the donor
      mockDbService.addNotification(
        appointmentData.userId,
        `Appointment scheduled successfully for ${appointmentData.date.toLocaleDateString()} at ${
          appointmentData.timeSlot
        }`
      );

      return newAppointment;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  getReferralsByRecipientId: (recipientId: string): Referral[] => {
    const referralsJson = localStorage.getItem("bloodlink_referrals");
    if (!referralsJson) return [];
    const rawReferrals = JSON.parse(referralsJson) as RawReferral[];
    return rawReferrals
      .filter((referral: RawReferral) => referral.recipientId === recipientId)
      .map((referral: RawReferral) => {
        const mappedReferral: Referral = {
          id: referral.id,
          donorId: referral.donorId,
          recipientId: referral.recipientId,
          hospitalId: referral.hospitalId,
          status: referral.status as
            | "pending"
            | "completed"
            | "cancelled"
            | "matched"
            | "scheduled",
          createdAt: new Date(referral.createdAt),
          updatedAt: new Date(referral.updatedAt),
          donorName: referral.donorName,
          donorBloodType: referral.donorBloodType,
          recipientName: referral.recipientName,
          hospitalName: referral.hospitalName,
          transfusionDetails: referral.transfusionDetails
            ? {
                ...referral.transfusionDetails,
                scheduledDate: referral.transfusionDetails.scheduledDate
                  ? new Date(referral.transfusionDetails.scheduledDate)
                  : undefined,
              }
            : undefined,
        };
        return mappedReferral;
      }) as Referral[];
  },

  getMatchesByRecipientId: (recipientId: string): Match[] => {
    const matches = localStorage.getItem("matches");
    if (!matches) return [];

    const parsedMatches = JSON.parse(matches) as RawMatch[];
    return parsedMatches.filter((match) => match.recipientId === recipientId);
  },

  getReferralsByDonorId: (donorId: string): Referral[] => {
    const referralsJson = localStorage.getItem("referrals");
    if (!referralsJson) return [];
    const referrals = JSON.parse(referralsJson) as Referral[];
    return referrals.filter((referral) => referral.donorId === donorId);
  },
};

// Import at the end to avoid circular dependency issues
import { adminService } from "./adminService";

export default mockDbService;
