
import { Donor, Recipient, Hospital, Referral, BloodType } from '@/types';

// Mock donors data
const mockDonors: Donor[] = [
  {
    id: '1',
    userId: '2',
    name: 'John Villaces',
    age: 28,
    bloodType: 'A+',
    phone: '123-456-7890',
    email: 'john.villaces@example.com',
    isAvailable: true,
  },
  {
    id: '2',
    userId: '5',
    name: 'John Donor',
    age: 35,
    bloodType: 'A+',
    phone: '234-567-8901',
    email: 'john.donor@example.com',
    isAvailable: true,
  },
  {
    id: '3',
    userId: '6',
    name: 'Mariella Doreen Lagura Cañete',
    age: 42,
    bloodType: 'A+',
    phone: '345-678-9012',
    email: 'mariella.canete@example.com',
    isAvailable: true,
  },
  {
    id: '4',
    userId: '7',
    name: 'Miki',
    age: 29,
    bloodType: 'A+',
    phone: '456-789-0123',
    email: 'miki@example.com',
    isAvailable: true,
  },
  {
    id: '5',
    userId: '8',
    name: 'im_semi',
    age: 31,
    bloodType: 'AB+',
    phone: '567-890-1234',
    email: 'im_semi@example.com',
    isAvailable: true,
  },
];

// Mock recipients data
const mockRecipients: Recipient[] = [
  {
    id: '1',
    userId: '3',
    name: 'Mary Patient',
    bloodType: 'A+',
    phone: '987-654-3210',
    preferredHospital: 'City General Hospital',
    urgency: 'normal',
  },
  {
    id: '2',
    userId: '9',
    name: 'jinjja',
    bloodType: 'AB+',
    phone: '876-543-2109',
    preferredHospital: 'Saint Mary\'s Medical Center',
    urgency: 'urgent',
  },
  {
    id: '3',
    userId: '10',
    name: 'sfadfasf',
    bloodType: 'O+',
    phone: '765-432-1098',
    preferredHospital: 'HealthFirst Medical Center',
    urgency: 'critical',
  },
];

// Mock hospitals data
const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'City General Hospital',
    location: 'Metro City',
    phone: '123-456-7890',
    availableBloodTypes: ['A+', 'B+', 'O+', 'AB+'],
  },
  {
    id: '2',
    name: 'Saint Mary\'s Medical Center',
    location: 'Green Valley',
    phone: '987-654-3210',
    availableBloodTypes: ['A-', 'B-', 'O-', 'AB-'],
  },
  {
    id: '3',
    name: 'Red Cross Blood Bank',
    location: 'Downtown',
    phone: '555-888-7777',
    availableBloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  {
    id: '4',
    name: 'HealthFirst Medical Center',
    location: 'Riverside',
    phone: '444-333-2222',
    availableBloodTypes: ['A+', 'B+', 'O+'],
  },
];

// Mock referrals data
const mockReferrals: Referral[] = [
  {
    id: '1',
    donorId: '1',
    recipientId: '3',
    hospitalId: '4',
    status: 'pending',
    createdAt: new Date(2023, 2, 25, 10, 55, 2),
  },
];

// Blood compatibility chart (which blood types can donate to which)
const bloodCompatibility: Record<BloodType, BloodType[]> = {
  'A+': ['A+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'O+': ['A+', 'B+', 'AB+', 'O+'],
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
};

// Mock database service with methods to interact with the data
export const mockDbService = {
  // Donor methods
  getDonors: () => Promise.resolve([...mockDonors]),
  getDonorById: (id: string) => Promise.resolve(mockDonors.find(d => d.id === id) || null),
  createDonor: (donor: Omit<Donor, 'id'>) => {
    const newDonor = { ...donor, id: `${mockDonors.length + 1}` };
    mockDonors.push(newDonor);
    return Promise.resolve(newDonor);
  },
  updateDonor: (id: string, data: Partial<Donor>) => {
    const index = mockDonors.findIndex(d => d.id === id);
    if (index === -1) return Promise.reject(new Error('Donor not found'));
    mockDonors[index] = { ...mockDonors[index], ...data };
    return Promise.resolve(mockDonors[index]);
  },
  
  // Recipient methods
  getRecipients: () => Promise.resolve([...mockRecipients]),
  getRecipientById: (id: string) => Promise.resolve(mockRecipients.find(r => r.id === id) || null),
  createRecipient: (recipient: Omit<Recipient, 'id'>) => {
    const newRecipient = { ...recipient, id: `${mockRecipients.length + 1}` };
    mockRecipients.push(newRecipient);
    return Promise.resolve(newRecipient);
  },
  updateRecipient: (id: string, data: Partial<Recipient>) => {
    const index = mockRecipients.findIndex(r => r.id === id);
    if (index === -1) return Promise.reject(new Error('Recipient not found'));
    mockRecipients[index] = { ...mockRecipients[index], ...data };
    return Promise.resolve(mockRecipients[index]);
  },
  
  // Hospital methods
  getHospitals: () => Promise.resolve([...mockHospitals]),
  getHospitalById: (id: string) => Promise.resolve(mockHospitals.find(h => h.id === id) || null),
  
  // Referral methods
  getReferrals: () => Promise.resolve([...mockReferrals]),
  createReferral: (referral: Omit<Referral, 'id' | 'createdAt'>) => {
    const newReferral = { 
      ...referral, 
      id: `${mockReferrals.length + 1}`, 
      createdAt: new Date()
    };
    mockReferrals.push(newReferral);
    return Promise.resolve(newReferral);
  },
  updateReferralStatus: (id: string, status: Referral['status']) => {
    const index = mockReferrals.findIndex(r => r.id === id);
    if (index === -1) return Promise.reject(new Error('Referral not found'));
    mockReferrals[index] = { ...mockReferrals[index], status };
    return Promise.resolve(mockReferrals[index]);
  },
  
  // Blood compatibility method
  getCompatibleRecipients: (donorBloodType: BloodType) => {
    const compatibleBloodTypes = bloodCompatibility[donorBloodType];
    const compatibleRecipients = mockRecipients.filter(
      recipient => compatibleBloodTypes.includes(recipient.bloodType)
    );
    return Promise.resolve(compatibleRecipients);
  },
  
  getCompatibleDonors: (recipientBloodType: BloodType) => {
    const compatibleDonors = mockDonors.filter(donor => 
      bloodCompatibility[donor.bloodType].includes(recipientBloodType)
    );
    return Promise.resolve(compatibleDonors);
  }
};
