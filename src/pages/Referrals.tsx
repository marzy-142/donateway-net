
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { mockDbService } from '@/services/mockDbService';
import { useAuth } from '@/contexts/AuthContext';
import { Referral, Donor, Recipient, Hospital } from '@/types';
import { Search, Filter, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Referrals: React.FC = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [donors, setDonors] = useState<Record<string, Donor>>({});
  const [recipients, setRecipients] = useState<Record<string, Recipient>>({});
  const [hospitals, setHospitals] = useState<Record<string, Hospital>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch referrals
        const referralsData = await mockDbService.getReferrals();
        setReferrals(referralsData);
        
        // Fetch donors and create a map for easy lookup
        const donorsData = await mockDbService.getDonors();
        const donorsMap: Record<string, Donor> = {};
        donorsData.forEach(donor => {
          donorsMap[donor.id] = donor;
        });
        setDonors(donorsMap);
        
        // Fetch recipients and create a map for easy lookup
        const recipientsData = await mockDbService.getRecipients();
        const recipientsMap: Record<string, Recipient> = {};
        recipientsData.forEach(recipient => {
          recipientsMap[recipient.id] = recipient;
        });
        setRecipients(recipientsMap);
        
        // Fetch hospitals and create a map for easy lookup
        const hospitalsData = await mockDbService.getHospitals();
        const hospitalsMap: Record<string, Hospital> = {};
        hospitalsData.forEach(hospital => {
          hospitalsMap[hospital.id] = hospital;
        });
        setHospitals(hospitalsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load referrals');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (referralId: string) => {
    try {
      await mockDbService.updateReferralStatus(referralId, 'cancelled');
      
      setReferrals(prevReferrals => 
        prevReferrals.map(ref => 
          ref.id === referralId ? { ...ref, status: 'cancelled' } : ref
        )
      );
      
      toast.success('Referral cancelled successfully');
    } catch (error) {
      console.error('Error cancelling referral:', error);
      toast.error('Failed to cancel referral');
    }
  };

  const filteredReferrals = referrals.filter(referral => {
    const donorName = donors[referral.donorId]?.name.toLowerCase() || '';
    const recipientName = recipients[referral.recipientId]?.name.toLowerCase() || '';
    const hospitalName = hospitals[referral.hospitalId]?.name.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return (
      donorName.includes(searchLower) ||
      recipientName.includes(searchLower) ||
      hospitalName.includes(searchLower)
    );
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="bg-bloodlink-pink py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-red-900 mb-2">Referral Insights</h1>
              <p className="text-gray-600">
                Comprehensive overview of medical referrals, tracking patient journeys with precision and care.
              </p>
            </div>
            
            <Button 
              variant="destructive" 
              size="icon" 
              className="bg-transparent border border-bloodlink-red text-bloodlink-red hover:bg-bloodlink-red/10 rounded-full"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search referrals by donor, recipient, or hospital"
                    className="pl-9 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Button variant="outline" className="sm:w-auto w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-bloodlink-red border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReferrals.length > 0 ? (
                filteredReferrals.map(referral => {
                  const donor = donors[referral.donorId];
                  const recipient = recipients[referral.recipientId];
                  const hospital = hospitals[referral.hospitalId];
                  
                  return (
                    <Card key={referral.id} className="overflow-hidden border-l-4 border-l-bloodlink-red">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2">
                            <h2 className="text-xl font-bold">Referral Details</h2>
                            
                            <div>
                              <span className="text-bloodlink-red font-semibold">Donor:</span>{' '}
                              {donor?.name || 'Unknown Donor'}
                            </div>
                            
                            <div>
                              <span className="text-bloodlink-red font-semibold">Recipient:</span>{' '}
                              {recipient?.name || 'Unknown Recipient'}
                            </div>
                            
                            <div>
                              <span className="text-bloodlink-red font-semibold">Hospital:</span>{' '}
                              {hospital?.name || 'Unknown Hospital'}
                            </div>
                            
                            <div className="text-gray-500 text-sm">
                              {formatDate(referral.createdAt)}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 justify-center">
                            <div className={`text-sm font-medium rounded-full px-3 py-1 text-center ${
                              referral.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : referral.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                            </div>
                            
                            {referral.status === 'pending' && (
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="mt-2"
                                onClick={() => handleDelete(referral.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-600">No referrals found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Referrals;
