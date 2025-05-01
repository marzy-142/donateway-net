import { toast } from "sonner";
import { mockDbService } from "./mockDbService";
import {
  Donor,
  Hospital,
  Recipient,
  User,
  BloodType,
  Appointment,
  SystemAlert,
  Event,
  Referral,
} from "@/types";

export const adminService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const users: User[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key?.startsWith("bloodlink_user_")) {
          try {
            const userId = key.replace("bloodlink_user_", "");
            const userData = JSON.parse(localStorage.getItem(key) || "{}");

            if (userData && userData.email && userData.name) {
              const user: User = {
                id: userId,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                createdAt: new Date(userData.createdAt || Date.now()),
                hasCompletedProfile: userData.hasCompletedProfile || false,
                avatar: userData.avatar,
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
      const referrals = await mockDbService.getReferrals();

      if (!donors.length || !recipients.length) {
        return [];
      }

      // Get IDs of donors and recipients who have completed referrals
      const completedDonorIds = new Set(
        referrals
          .filter(ref => ref.status === "completed")
          .map(ref => ref.donorId)
      );
      const completedRecipientIds = new Set(
        referrals
          .filter(ref => ref.status === "completed")
          .map(ref => ref.recipientId)
      );

      // Filter out donors who are unavailable or have completed referrals
      const availableDonors = donors.filter(
        donor => donor.isAvailable && !completedDonorIds.has(donor.id)
      );

      // Filter out recipients who have completed referrals
      const availableRecipients = recipients.filter(
        recipient => !completedRecipientIds.has(recipient.id)
      );

      if (!availableDonors.length || !availableRecipients.length) {
        return [];
      }

      const matches = [];

      for (const donor of availableDonors) {
        const compatibleRecipients = availableRecipients.filter((recipient) =>
          this.isBloodCompatible(donor.bloodType, recipient.bloodType)
        );

        for (const recipient of compatibleRecipients) {
          matches.push({
            id: `match-${donor.id}-${recipient.id}`,
            donor: donor,
            recipient: recipient,
            status: "pending",
            matchDate: new Date(),
            compatibilityScore: this.calculateCompatibilityScore(
              donor,
              recipient
            ),
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

    if (recipient.urgency === "critical") {
      score += 25;
    } else if (recipient.urgency === "urgent") {
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

  async createSystemAlert(alertData: {
    title: string;
    message: string;
    severity: "low" | "medium" | "high";
  }): Promise<boolean> {
    try {
      const alerts = JSON.parse(
        localStorage.getItem("bloodlink_alerts") || "[]"
      );
      const newAlert = {
        id: `alert-${Date.now()}`,
        ...alertData,
        createdAt: new Date(),
        isActive: true,
      };
      alerts.push(newAlert);
      localStorage.setItem("bloodlink_alerts", JSON.stringify(alerts));

      // Notify all users
      const users = await this.getAllUsers();
      for (const currentUser of users) {
        await mockDbService.addNotification(
          currentUser.id,
          `System Alert: ${alertData.title} - ${alertData.message}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error creating system alert:", error);
      toast.error("Failed to create alert");
      return false;
    }
  },

  async getSystemAlerts(): Promise<SystemAlert[]> {
    try {
      const alerts = JSON.parse(
        localStorage.getItem("bloodlink_alerts") || "[]"
      );
      return alerts
        .filter((alert: SystemAlert) => alert.isActive)
        .map((alert: SystemAlert) => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
        }));
    } catch (error) {
      console.error("Error fetching system alerts:", error);
      toast.error("Failed to load alerts");
      return [];
    }
  },

  async createEvent(eventData: {
    title: string;
    description: string;
    date: Date;
    location: string;
  }): Promise<boolean> {
    try {
      const events = JSON.parse(
        localStorage.getItem("bloodlink_events") || "[]"
      );
      const newEvent = {
        id: `event-${Date.now()}`,
        ...eventData,
        createdAt: new Date(),
        isActive: true,
        organizerId: user?.id, // From auth context
      };
      events.push(newEvent);
      localStorage.setItem("bloodlink_events", JSON.stringify(events));

      // Notify all donors
      const donors = await mockDbService.getDonors();
      donors.forEach((donor) => {
        mockDbService.addNotification(
          donor.userId,
          `New Event: ${
            eventData.title
          } on ${eventData.date.toLocaleDateString()}`
        );
      });

      return true;
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
      return false;
    }
  },

  async getUpcomingEvents(): Promise<Event[]> {
    try {
      const events = JSON.parse(
        localStorage.getItem("bloodlink_events") || "[]"
      );
      const now = new Date();
      return events
        .filter((event: any) => new Date(event.date) > now && event.isActive)
        .map((event: any) => ({
          ...event,
          date: new Date(event.date),
          createdAt: new Date(event.createdAt),
        }));
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  },

  async getAnalyticsData() {
    try {
      const donors = await mockDbService.getDonors();
      const recipients = await mockDbService.getRecipients();
      const hospitals = await mockDbService.getHospitals();
      const referrals = await mockDbService.getReferrals();

      const activeDonors = donors.filter((donor) => donor.isAvailable).length;
      
      // Get IDs of recipients who have completed or cancelled referrals
      const inactiveRecipientIds = new Set(
        referrals
          .filter(ref => ref.status === "completed" || ref.status === "cancelled")
          .map(ref => ref.recipientId)
      );
      
      // A recipient is active if they:
      // 1. Have no referrals (newly registered)
      // 2. Have only pending or scheduled referrals
      const activeRecipients = recipients.filter(recipient => 
        !inactiveRecipientIds.has(recipient.id)
      ).length;
      
      const completedDonations = referrals.filter(
        (ref) => ref.status === "completed"
      ).length;
      const pendingMatches = referrals.filter(
        (ref) => ref.status === "pending"
      ).length;

      const bloodTypeDistribution: Record<BloodType, number> = {
        "A+": 0,
        "A-": 0,
        "B+": 0,
        "B-": 0,
        "AB+": 0,
        "AB-": 0,
        "O+": 0,
        "O-": 0,
      };

      donors.forEach((donor) => {
        bloodTypeDistribution[donor.bloodType]++;
      });

      const monthlyDonations = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString("default", { month: "short" });
        const donations = referrals.filter((ref) => {
          const refDate = new Date(ref.createdAt);
          return (
            refDate.getMonth() === date.getMonth() &&
            refDate.getFullYear() === date.getFullYear() &&
            ref.status === "completed"
          );
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
        monthlyDonations,
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
          totalHospitals: 0,
        },
        bloodTypeDistribution: {},
        monthlyDonations: [],
      };
    }
  },

  isBloodCompatible(donorType: BloodType, recipientType: BloodType): boolean {
    const compatibility: Record<BloodType, BloodType[]> = {
      "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
      "O+": ["O+", "A+", "B+", "AB+"],
      "A-": ["A-", "A+", "AB-", "AB+"],
      "A+": ["A+", "AB+"],
      "B-": ["B-", "B+", "AB-", "AB+"],
      "B+": ["B+", "AB+"],
      "AB-": ["AB-", "AB+"],
      "AB+": ["AB+"],
    };

    return compatibility[donorType].includes(recipientType);
  },

  async createReferral(
    donorId: string,
    recipientId: string,
    hospitalId: string
  ) {
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
        status: "pending",
      });

      toast.success("Referral created successfully!");
      return referral;
    } catch (error) {
      console.error("Error creating referral:", error);
      toast.error(`Failed to create referral: ${(error as Error).message}`);
      throw error;
    }
  },

  async updateReferralStatus(referralId: string, newStatus: "pending" | "completed" | "cancelled"): Promise<boolean> {
    try {
      const referral = await mockDbService.getReferrals().then(referrals =>
        referrals.find(r => r.id === referralId)
      );
      
      if (referral) {
        await mockDbService.updateReferralStatus(referralId, newStatus);
        
        // Send targeted notifications to affected users
        await mockDbService.addAdminUpdate(
          `Referral status updated to: ${newStatus}`,
          {
            donorId: referral.donorId,
            recipientId: referral.recipientId,
            hospitalId: referral.hospitalId,
          },
          newStatus
        );
      }
      
      return true;
    } catch (error) {
      console.error("Error updating referral status:", error);
      toast.error("Failed to update referral status");
      return false;
    }
  },

  async updateReferralDetails(
    referralId: string,
    transfusionDetails: NonNullable<Referral["transfusionDetails"]>
  ): Promise<boolean> {
    try {
      const referrals = await mockDbService.getReferrals();
      const referralIndex = referrals.findIndex((r) => r.id === referralId);

      if (referralIndex === -1) {
        toast.error("Referral not found");
        return false;
      }

      const currentReferral = referrals[referralIndex];
      const updatedReferral: Referral = {
        ...currentReferral,
        transfusionDetails,
        status: "scheduled",
        updatedAt: new Date(),
      };

      referrals[referralIndex] = updatedReferral;
      localStorage.setItem("bloodlink_referrals", JSON.stringify(referrals));

      // Create detailed notification message
      const detailsMessage = `Blood transfusion scheduled at ${updatedReferral.hospitalName}
Location: ${transfusionDetails.hospitalLocation}
Date: ${transfusionDetails.scheduledDate ? new Date(transfusionDetails.scheduledDate).toLocaleDateString() : 'TBD'}
Time: ${transfusionDetails.scheduledTime || 'TBD'}
Room: ${transfusionDetails.roomNumber || 'TBD'}
Department: ${transfusionDetails.department || 'TBD'}
Duration: ${transfusionDetails.estimatedDuration || 'TBD'}
Contact Person: ${transfusionDetails.hospitalContactPerson}
Contact Number: ${transfusionDetails.hospitalContactNumber}`;

      // Send notifications with detailed information
      await mockDbService.addAdminUpdate(
        detailsMessage,
        {
          donorId: updatedReferral.donorId,
          recipientId: updatedReferral.recipientId,
          hospitalId: updatedReferral.hospitalId,
        },
        "scheduled"
      );

      // Send preparation instructions to donor
      if (transfusionDetails.preparationInstructions?.length) {
        const prepMessage = `Important preparation instructions for your blood donation:
${transfusionDetails.preparationInstructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}`;
        
        await mockDbService.addNotification(
          updatedReferral.donorId,
          prepMessage,
          "admin_update",
          { donorId: updatedReferral.donorId }
        );
      }

      // Send required documents information
      if (transfusionDetails.requiredDocuments?.length) {
        const docsMessage = `Please bring the following documents:
${transfusionDetails.requiredDocuments.map((doc, i) => `${i + 1}. ${doc}`).join('\n')}`;
        
        await mockDbService.addNotification(
          updatedReferral.donorId,
          docsMessage,
          "admin_update",
          { donorId: updatedReferral.donorId }
        );
      }

      // Send special instructions if any
      if (transfusionDetails.specialInstructions) {
        await mockDbService.addNotification(
          updatedReferral.donorId,
          `Special Instructions: ${transfusionDetails.specialInstructions}`,
          "admin_update",
          { donorId: updatedReferral.donorId }
        );
      }

      toast.success("Referral details updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating referral details:", error);
      toast.error("Failed to update referral details");
      return false;
    }
  },

  async updateAppointmentStatus(
    appointmentId: string,
    status: "scheduled" | "completed" | "cancelled"
  ): Promise<boolean> {
    try {
      const appointments = await mockDbService.getAppointments();
      const appointment = appointments.find(a => a.id === appointmentId);

      if (appointment) {
        await mockDbService.updateAppointmentStatus(appointmentId, status);
        
        // Send targeted notifications to affected users
        await mockDbService.addAdminUpdate(
          `Appointment status updated to: ${status}`,
          {
            donorId: appointment.userId, // In this case, userId is the donorId
            hospitalId: appointment.hospitalId,
          },
          status
        );
      }

      return true;
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
      return false;
    }
  },

  async getAllAppointments(): Promise<Appointment[]> {
    try {
      // Fetch all data in parallel
      const [appointments, users, hospitals, donors] = await Promise.all([
        mockDbService.getAppointments(),
        this.getAllUsers(),
        this.getAllHospitals(),
        mockDbService.getDonors(),
      ]);

      return appointments
        .map((appointment) => {
          const user = users.find((u) => u.id === appointment.userId);
          const hospital = hospitals.find(
            (h) => h.id === appointment.hospitalId
          );
          const donor = donors.find((d) => d.userId === appointment.userId);

          return {
            ...appointment,
            userName: user?.name,
            donorName: donor?.name || user?.name, // Prefer donor name if available
            hospitalName: hospital?.name,
          };
        })
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
      return [];
    }
  },
};

export default adminService;
