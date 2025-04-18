import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockDbService } from '@/services/mockDbService';
import { useAuth } from '@/contexts/AuthContext';
import { Donor, Recipient, Hospital } from '@/types';
import { Search, Heart, Eye, UserCheck, Filter, Clipboard, Bell } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

const Matches: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [compatibleRecipients, setCompatibleRecipients] = useState<Recipient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleViewMatchDetails = (donorId: string) => {
    navigate(`/matches/${donorId}`);
  };

  const handleReferralSubmit = async () => {
    if (!selectedDonor || !selectedRecipient || !selectedHospital) {
      toast.error('Please select a donor, recipient, and hospital');
      return;
    }
    
    setSubmitting(true);
    try {
      await mockDbService.createReferral({
        donorId: selectedDonor.id,
        recipientId: selectedRecipient.id,
        hospitalId: selectedHospital,
        status: 'pending'
      });
      
      toast.success('Referral created successfully');
      toast.success('Notifications sent to donor and recipient');
      
      setSelectedDonor(null);
      setSelectedRecipient(null);
      setSelectedHospital('');
      setCompatibleRecipients([]);
      
      navigate('/referrals');
    } catch (error) {
      console.error('Error creating referral:', error);
      toast.error('Failed to create referral');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.bloodType.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    return matchesSearch && donor.bloodType === filterBy;
  });

  const sortedDonors = [...filteredDonors].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'bloodType') {
      return a.bloodType.localeCompare(b.bloodType);
    }
    return 0;
  });

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-900 mb-2">Donor Matching</h1>
          <p className="text-gray-600">
            Precision matching of donors and recipients, connecting lives with care.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search donors"
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="w-[120px]" aria-label="Filter by blood type">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="All Types" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Sort by Name" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="bloodType">Sort by Blood Type</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    className={`border-2 ${selectedDonor?.id === donor.id ? 'border-bloodlink-red' : 'border-transparent'} hover:border-bloodlink-red/50 transition-colors`}
                  >
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="cursor-pointer" onClick={() => handleDonorSelect(donor.id)}>
                        <h3 className="font-semibold text-lg">{donor.name}</h3>
                        <p className="text-gray-600">Blood Type: {donor.bloodType}</p>
                        <p className="text-gray-600 text-sm">Age: {donor.age}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center" 
                          onClick={() => handleDonorSelect(donor.id)}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${selectedDonor?.id === donor.id ? 'text-bloodlink-red fill-bloodlink-red' : 'text-gray-400'}`} />
                          Match
                        </Button>
                        <Button 
                          size="sm"
                          className="flex items-center bg-bloodlink-red hover:bg-bloodlink-red/80" 
                          onClick={() => handleViewMatchDetails(donor.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              {!loading && sortedDonors.length === 0 && (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-600">No donors found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-xl font-bold text-red-800">Recipient Matches</h2>
            
            {selectedDonor ? (
              <>
                <Card className="border-2 border-bloodlink-red/30 bg-bloodlink-pink/10">
                  <CardContent className="p-4">
                    <h3 className="font-semibold">Selected Donor</h3>
                    <div className="flex items-center mt-2">
                      <div className="p-2 bg-bloodlink-red/10 rounded-full mr-3">
                        <UserCheck className="h-5 w-5 text-bloodlink-red" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedDonor.name}</p>
                        <p className="text-sm text-gray-600">Blood Type: {selectedDonor.bloodType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {compatibleRecipients.length > 0 ? (
                  <div className="space-y-4">
                    {compatibleRecipients.map(recipient => (
                      <Card 
                        key={recipient.id}
                        className={`border-2 ${selectedRecipient?.id === recipient.id ? 'border-bloodlink-red' : 'border-transparent'} cursor-pointer hover:border-bloodlink-red/50 transition-colors`}
                        onClick={() => handleRecipientSelect(recipient)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{recipient.name}</h3>
                              <p className="text-gray-600">Blood Type: {recipient.bloodType}</p>
                              <div className="mt-1">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  recipient.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                                  recipient.urgency === 'urgent' ? 'bg-orange-100 text-orange-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {recipient.urgency.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            {recipient.preferredHospital && (
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Preferred Hospital</p>
                                <p className="text-sm font-medium">{recipient.preferredHospital}</p>
                              </div>
                            )}
                          </div>
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
                  <div className="flex items-center mb-4">
                    <Clipboard className="h-5 w-5 mr-2 text-bloodlink-red" />
                    <h2 className="text-xl font-bold">Create Referral</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Donor:</label>
                        <p className="font-semibold">{selectedDonor.name}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Recipient:</label>
                        <p className="font-semibold">{selectedRecipient.name}</p>
                      </div>
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
                      className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80 flex items-center justify-center gap-2"
                      onClick={handleReferralSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Bell className="h-4 w-4" />
                          Create Referral & Notify
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Matches;
