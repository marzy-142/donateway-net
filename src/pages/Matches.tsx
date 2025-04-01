
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockDbService } from '@/services/mockDbService';
import { useAuth } from '@/contexts/AuthContext';
import { Donor, Recipient, Hospital } from '@/types';
import { Search, Heart } from 'lucide-react';
import { toast } from 'sonner';

const Matches: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [compatibleRecipients, setCompatibleRecipients] = useState<Recipient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const donorsData = await mockDbService.getDonors();
        setDonors(donorsData);
        
        const hospitalsData = await mockDbService.getHospitals();
        setHospitals(hospitalsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchCompatibleRecipients = async (donorId: string) => {
    try {
      const donor = donors.find(d => d.id === donorId);
      if (!donor) return;
      
      setSelectedDonor(donor);
      
      const recipients = await mockDbService.getCompatibleRecipients(donor.bloodType);
      setCompatibleRecipients(recipients);
    } catch (error) {
      console.error('Error fetching compatible recipients:', error);
    }
  };

  const handleDonorSelect = (donorId: string) => {
    fetchCompatibleRecipients(donorId);
  };

  const handleRecipientSelect = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
  };

  const handleReferralSubmit = async () => {
    if (!selectedDonor || !selectedRecipient || !selectedHospital) {
      toast.error('Please select a donor, recipient, and hospital');
      return;
    }
    
    try {
      await mockDbService.createReferral({
        donorId: selectedDonor.id,
        recipientId: selectedRecipient.id,
        hospitalId: selectedHospital,
        status: 'pending'
      });
      
      toast.success('Referral created successfully');
      navigate('/referrals');
    } catch (error) {
      console.error('Error creating referral:', error);
      toast.error('Failed to create referral');
    }
  };

  const filteredDonors = donors.filter(donor => 
    donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.bloodType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDonors = [...filteredDonors].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'bloodType') {
      return a.bloodType.localeCompare(b.bloodType);
    }
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="bg-bloodlink-pink py-8">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-red-900 mb-2">Donor Matching</h1>
            <p className="text-gray-600">
              Precision matching of donors and recipients, connecting lives with care.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Donors Column */}
            <div className="md:w-1/2 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search donors or recipients"
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Sort by Name" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="bloodType">Sort by Blood Type</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <h2 className="text-xl font-bold text-red-800">Available Donors</h2>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-bloodlink-red border-t-transparent"></div>
                  </div>
                ) : (
                  sortedDonors.map(donor => (
                    <Card 
                      key={donor.id}
                      className={`border-2 ${selectedDonor?.id === donor.id ? 'border-bloodlink-red' : 'border-transparent'} cursor-pointer hover:border-bloodlink-red/50 transition-colors`}
                      onClick={() => handleDonorSelect(donor.id)}
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg">{donor.name}</h3>
                          <p className="text-gray-600">Blood Type: {donor.bloodType}</p>
                        </div>
                        <Heart 
                          className={`h-6 w-6 ${selectedDonor?.id === donor.id ? 'text-bloodlink-red fill-bloodlink-red' : 'text-gray-400'}`} 
                        />
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
            
            {/* Recipients Column */}
            <div className="md:w-1/2 space-y-4">
              <h2 className="text-xl font-bold text-red-800">Recipient Matches</h2>
              
              {selectedDonor ? (
                <>
                  {compatibleRecipients.length > 0 ? (
                    <div className="space-y-4">
                      {compatibleRecipients.map(recipient => (
                        <Card 
                          key={recipient.id}
                          className={`border-2 ${selectedRecipient?.id === recipient.id ? 'border-bloodlink-red' : 'border-transparent'} cursor-pointer hover:border-bloodlink-red/50 transition-colors`}
                          onClick={() => handleRecipientSelect(recipient)}
                        >
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg">{recipient.name}</h3>
                            <p className="text-gray-600">Blood Type: {recipient.bloodType}</p>
                            <p className="text-gray-600">Urgency: {recipient.urgency}</p>
                            {recipient.preferredHospital && (
                              <p className="text-gray-600">Preferred Hospital: {recipient.preferredHospital}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                      <p className="text-gray-600">No compatible recipients found</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-600">Select a donor to view compatible recipients</p>
                </div>
              )}
              
              {selectedDonor && selectedRecipient && (
                <Card className="mt-6">
                  <CardContent className="p-4">
                    <h2 className="text-xl font-bold mb-4">Refer Donor/Recipient</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Donor:</label>
                        <p className="font-semibold">{selectedDonor.name}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Recipient:</label>
                        <p className="font-semibold">{selectedRecipient.name}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium block mb-1">Select a hospital:</label>
                        <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a hospital" />
                          </SelectTrigger>
                          <SelectContent>
                            {hospitals.map(hospital => (
                              <SelectItem key={hospital.id} value={hospital.id}>
                                {hospital.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80"
                        onClick={handleReferralSubmit}
                      >
                        Send Referral
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Matches;
