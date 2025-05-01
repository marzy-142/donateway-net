import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Donor, Recipient, Hospital, BloodType } from '@/types';
import { mockDbService } from '@/services/mockDbService';
import { emailService } from '@/services/emailService';
import { toast } from 'sonner';
import { Search, Filter, User } from 'lucide-react';

export const DonorMatching = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('urgency');
  const [isReferralDialogOpen, setIsReferralDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedDonors, fetchedHospitals] = await Promise.all([
          mockDbService.getDonors(),
          mockDbService.getHospitals()
        ]);
        setDonors(fetchedDonors);
        setHospitals(fetchedHospitals);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadRecipients = async () => {
      if (selectedDonor) {
        try {
          const compatibleRecipients = await mockDbService.getCompatibleRecipients(selectedDonor.bloodType);
          setRecipients(compatibleRecipients);
        } catch (error) {
          console.error('Error loading compatible recipients:', error);
          toast.error('Failed to load compatible recipients');
        }
      }
    };
    loadRecipients();
  }, [selectedDonor]);

  const handleCreateReferral = async () => {
    if (!selectedDonor || !selectedRecipient || !selectedHospital) {
      toast.error('Please select all required fields');
      return;
    }

    try {
      // Get detailed donor and recipient information
      const [donorDetails, recipientDetails, hospital] = await Promise.all([
        mockDbService.getDonorById(selectedDonor.id),
        mockDbService.getRecipientById(selectedRecipient.id),
        mockDbService.getHospitalById(selectedHospital)
      ]);

      if (!donorDetails || !recipientDetails || !hospital) {
        throw new Error('Failed to fetch complete details');
      }

      // Create the referral
      const referral = await mockDbService.createReferral({
        donorId: donorDetails.id,
        recipientId: recipientDetails.id,
        hospitalId: selectedHospital,
        status: 'pending'
      });

      // Send email notifications with complete details
      await Promise.all([
        // Notify donor
        emailService.sendReferralNotification({
          to: donorDetails.email, // Using actual donor email
          donorName: donorDetails.name,
          recipientName: recipientDetails.name,
          hospitalName: hospital.name,
          bloodType: recipientDetails.bloodType,
          urgencyLevel: recipientDetails.urgencyLevel,
          appointmentDate: 'To be scheduled',
          additionalNotes: `
Donor Details:
- Blood Type: ${donorDetails.bloodType}
- Last Donation: ${donorDetails.lastDonationDate ? new Date(donorDetails.lastDonationDate).toLocaleDateString() : 'Never'}
- Phone: ${donorDetails.phone}
- Email: ${donorDetails.email}

Recipient Details:
- Blood Type Needed: ${recipientDetails.bloodType}
- Urgency Level: ${recipientDetails.urgencyLevel}
- Hospital: ${recipientDetails.hospitalName}
- Phone: ${recipientDetails.phone}

Hospital Details:
- Name: ${hospital.name}
- Location: ${hospital.location}
- Phone: ${hospital.phone}

You have been matched with a recipient who needs your blood type. Please log in to your account to schedule the donation appointment.`
        }),
        // Notify recipient
        emailService.sendReferralNotification({
          to: recipientDetails.email, // Using actual recipient email
          donorName: donorDetails.name,
          recipientName: recipientDetails.name,
          hospitalName: hospital.name,
          bloodType: recipientDetails.bloodType,
          urgencyLevel: recipientDetails.urgencyLevel,
          appointmentDate: 'To be scheduled',
          additionalNotes: `
Donor Details:
- Name: ${donorDetails.name}
- Blood Type: ${donorDetails.bloodType}
- Phone: ${donorDetails.phone}

Recipient Details:
- Blood Type Needed: ${recipientDetails.bloodType}
- Urgency Level: ${recipientDetails.urgencyLevel}
- Phone: ${recipientDetails.phone}
- Email: ${recipientDetails.email}

Hospital Details:
- Name: ${hospital.name}
- Location: ${hospital.location}
- Phone: ${hospital.phone}

A compatible donor has been found for you! The donor will be notified and can schedule an appointment. Please log in to your account to view the referral details.`
        })
      ]);

      toast.success('Referral created and notifications sent');
      setIsReferralDialogOpen(false);
      setSelectedHospital('');
      setSelectedRecipient(null);
    } catch (error) {
      console.error('Error creating referral:', error);
      toast.error('Failed to create referral');
    }
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBloodType = bloodTypeFilter === 'All' || donor.bloodType === bloodTypeFilter;
    return matchesSearch && matchesBloodType;
  });

  const sortedRecipients = [...recipients].sort((a, b) => {
    if (sortBy === 'urgency') {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Donors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search donors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by blood type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                {Object.values(BloodType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDonors.map((donor) => (
              <Card key={donor.id} className={`cursor-pointer transition-colors ${selectedDonor?.id === donor.id ? 'border-bloodlink-red' : ''}`}
                onClick={() => setSelectedDonor(donor)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-bloodlink-red" />
                    <div>
                      <p className="font-medium">{donor.name}</p>
                      <p className="text-sm text-muted-foreground">Blood Type: {donor.bloodType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedDonor && (
        <Card>
          <CardHeader>
            <CardTitle>Recipient Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgency">Sort by Urgency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedRecipients.map((recipient) => (
                <Card key={recipient.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{recipient.name}</p>
                          <p className="text-sm text-muted-foreground">Blood Type: {recipient.bloodType}</p>
                          <p className="text-sm text-muted-foreground">Hospital: {recipient.hospitalName}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          recipient.urgencyLevel === 'high' ? 'bg-red-100 text-red-800' :
                          recipient.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {recipient.urgencyLevel.toUpperCase()}
                        </span>
                      </div>
                      <Button
                        className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80"
                        onClick={() => {
                          setSelectedRecipient(recipient);
                          setIsReferralDialogOpen(true);
                        }}
                      >
                        Create Referral
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isReferralDialogOpen} onOpenChange={setIsReferralDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Referral</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selected Donor</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p><strong>Name:</strong> {selectedDonor?.name}</p>
                <p><strong>Blood Type:</strong> {selectedDonor?.bloodType}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Selected Recipient</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p><strong>Name:</strong> {selectedRecipient?.name}</p>
                <p><strong>Blood Type:</strong> {selectedRecipient?.bloodType}</p>
                <p><strong>Urgency:</strong> {selectedRecipient?.urgencyLevel}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital">Select Hospital</Label>
              <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80"
              onClick={handleCreateReferral}
            >
              Create Referral & Send Notifications
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
