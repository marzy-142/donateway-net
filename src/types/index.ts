
export type UserRole = 'donor' | 'recipient' | 'hospital' | 'admin';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
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
  phone: string;
  preferredHospital?: string;
  urgency: 'normal' | 'urgent' | 'critical';
  medicalCondition?: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  phone: string;
  availableBloodTypes: BloodType[];
}

export interface Referral {
  id: string;
  donorId: string;
  recipientId: string;
  hospitalId: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}
