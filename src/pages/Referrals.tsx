import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { mockDbService } from '@/services/mockDbService';
import { adminService } from '@/services/adminService';
import { useAuth } from '@/contexts/AuthContext';
import { Referral, Donor, Recipient, Hospital } from '@/types';
import { Search, Filter, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const Referrals: React.FC = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [donors, setDonors] = useState<Record<string, Donor>>({});
  const [recipients, setRecipients] = useState<Record<string, Recipient>>({});
  const [hospitals, setHospitals] = useState<Record<string, Hospital>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let referralsData;
        
        if (user?.role === 'admin') {
          referralsData = await mockDbService.getReferrals();
        } else if (user) {
          referralsData = await mockDbService.getReferralsByUserId(user.id);
        } else {
          referralsData = [];
        }
        
        setReferrals(referralsData);
        
        const donorsData = await mockDbService.getDonors();
        const donorsMap: Record<string, Donor> = {};
        donorsData.forEach(donor => {
          donorsMap[donor.id] = donor;
        });
        setDonors(donorsMap);
        
        const recipientsData = await mockDbService.getRecipients();
        const recipientsMap: Record<string, Recipient> = {};
        recipientsData.forEach(recipient => {
          recipientsMap[recipient.id] = recipient;
        });
        setRecipients(recipientsMap);
        
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

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCancel = async (referralId: string) => {
    try {
      await adminService.updateReferralStatus(referralId, 'cancelled');
      
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
  
  const handleComplete = async (referralId: string) => {
    try {
      await adminService.updateReferralStatus(referralId, 'completed');
      
      setReferrals(prevReferrals => 
        prevReferrals.map(ref => 
          ref.id === referralId ? { ...ref, status: 'completed' } : ref
        )
      );
      
      toast.success('Referral marked as completed');
    } catch (error) {
      console.error('Error completing referral:', error);
      toast.error('Failed to complete referral');
    }
  };

  const filteredReferrals = referrals.filter(referral => {
    const donorName = donors[referral.donorId]?.name.toLowerCase() || referral.donorName?.toLowerCase() || '';
    const recipientName = recipients[referral.recipientId]?.name.toLowerCase() || referral.recipientName?.toLowerCase() || '';
    const hospitalName = hospitals[referral.hospitalId]?.name.toLowerCase() || referral.hospitalName?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      donorName.includes(searchLower) ||
      recipientName.includes(searchLower) ||
      hospitalName.includes(searchLower);
      
    if (filterStatus) {
      return matchesSearch && referral.status === filterStatus;
    }
    
    return matchesSearch;
  });
  
  const getReferralStatusIcon = (status: string) => {
    switch(status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Please log in to view referrals</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="bg-bloodlink-pink py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-red-900 mb-2">Referral Insights</h1>
              <p className="text-gray-600">
                {user.role === 'donor' && "Track your blood donation referrals and help save lives."}
                {user.role === 'recipient' && "View your blood donation referrals that match your needs."}
                {user.role === 'admin' && "Comprehensive overview of all medical referrals, tracking patient journeys with precision and care."}
              </p>
            </div>
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
                
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline"
                    className={`${!filterStatus ? 'bg-bloodlink-red/10 border-bloodlink-red text-bloodlink-red' : ''}`}
                    onClick={() => setFilterStatus(null)}
                  >
                    All
                  </Button>
                  <Button 
                    variant="outline"
                    className={`${filterStatus === 'pending' ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : ''}`}
                    onClick={() => setFilterStatus('pending')}
                  >
                    <Clock className="h-4 w-4 mr-2" /> Pending
                  </Button>
                  <Button 
                    variant="outline"
                    className={`${filterStatus === 'completed' ? 'bg-green-100 border-green-400 text-green-700' : ''}`}
                    onClick={() => setFilterStatus('completed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Completed
                  </Button>
                  <Button 
                    variant="outline"
                    className={`${filterStatus === 'cancelled' ? 'bg-red-100 border-red-400 text-red-700' : ''}`}
                    onClick={() => setFilterStatus('cancelled')}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" /> Cancelled
                  </Button>
                </div>
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
                  
                  const donorName = donor?.name || referral.donorName || 'Unknown Donor';
                  const recipientName = recipient?.name || referral.recipientName || 'Unknown Recipient';
                  const hospitalName = hospital?.name || referral.hospitalName || 'Unknown Hospital';
                  
                  const donorBloodType = donor?.bloodType || '?';
                  const recipientBloodType = recipient?.bloodType || '?';
                  
                  return (
                    <Card key={referral.id} className={`overflow-hidden border-l-4 ${
                      referral.status === 'pending' ? 'border-l-yellow-500' :
                      referral.status === 'completed' ? 'border-l-green-500' :
                      'border-l-red-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2">
                            <h2 className="text-xl font-bold">Referral Details</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-bloodlink-red font-semibold">Donor:</span>{' '}
                                {donorName} 
                                <span className="ml-2 px-2 py-1 bg-bloodlink-pink text-bloodlink-red rounded-full text-xs font-semibold">
                                  {donorBloodType}
                                </span>
                              </div>
                              
                              <div>
                                <span className="text-bloodlink-red font-semibold">Recipient:</span>{' '}
                                {recipientName}
                                <span className="ml-2 px-2 py-1 bg-bloodlink-pink text-bloodlink-red rounded-full text-xs font-semibold">
                                  {recipientBloodType}
                                </span>
                              </div>
                              
                              <div>
                                <span className="text-bloodlink-red font-semibold">Hospital:</span>{' '}
                                {hospitalName}
                              </div>
                              
                              <div className="text-gray-500 text-sm">
                                Created: {formatDate(new Date(referral.createdAt))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 justify-center">
                            <div className={`flex items-center gap-2 text-sm font-medium rounded-full px-3 py-1 text-center ${
                              referral.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : referral.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {getReferralStatusIcon(referral.status)}
                              {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                            </div>
                            
                            {user.role === 'admin' && referral.status === 'pending' && (
                              <div className="flex gap-2 mt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-green-500 text-green-700 hover:bg-green-50"
                                  onClick={() => handleComplete(referral.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete
                                </Button>
                                
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleCancel(referral.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  {filterStatus ? (
                    <p className="text-gray-600">No {filterStatus} referrals found</p>
                  ) : (
                    <p className="text-gray-600">No referrals found</p>
                  )}
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
