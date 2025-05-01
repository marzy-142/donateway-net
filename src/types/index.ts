export type UserRole = "donor" | "recipient" | "hospital" | "admin";

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  hasCompletedProfile?: boolean;
  avatar?: string;
}

export interface Donor {
  id: string;
  userId: string;
  name: string;
  age: number;
  bloodType: BloodType;
  phone: string;
  email: string;
  address?: string;
  lastDonationDate?: Date;
  isAvailable: boolean;
}

export interface Recipient {
  id: string;
  userId: string;
  name: string;
  bloodType: BloodType;
  urgency: "low" | "medium" | "high" | "critical" | "urgent";
  hospitalName: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  phone: string;
  bloodTypes: BloodType[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RawReferral {
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

export interface Referral {
  id: string;
  donorId: string;
  recipientId: string;
  hospitalId: string;
  status: "pending" | "completed" | "cancelled" | "matched" | "scheduled";
  createdAt: Date;
  updatedAt: Date;
  donorName?: string;
  donorBloodType?: string;
  recipientName?: string;
  hospitalName?: string;
  transfusionDetails?: {
    scheduledDate?: Date;
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

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type?: "system" | "admin_update" | "match" | "referral" | "appointment";
  metadata?: {
    donorId?: string;
    recipientId?: string;
    hospitalId?: string;
    referralId?: string;
    appointmentId?: string;
    status?: string;
  };
}

export interface Appointment {
  id: string;
  userId: string;
  hospitalId: string;
  date: Date;
  timeSlot: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: Date;
  // Add these optional fields
  userName?: string;
  donorName?: string;
  hospitalName?: string;
}

// Add to types.ts
export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  createdAt: Date;
  isActive: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  createdAt: Date;
  isActive: boolean;
  organizerId?: string; // Admin who created it
}

export interface Match {
  id: string;
  donorId: string;
  recipientId: string;
  compatibilityScore: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}
