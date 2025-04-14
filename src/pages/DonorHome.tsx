
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Calendar, Bell, Award, ClipboardCheck, AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';
import { mockDbService } from '@/services/mockDbService';
import { Donor } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const DonorHome: React.FC = () => {
  const { user } = useAuth();
  const [donorData, setDonorData] = useState<Donor | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonorData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch donor profile
        const donors = await mockDbService.getDonors();
        const currentDonor = donors.find(donor => donor.userId === user.id);
        
        if (currentDonor) {
          setDonorData(currentDonor);
          
          // Fetch referrals for this donor
          const allReferrals = await mockDbService.getReferrals();
          const myReferrals = allReferrals.filter(ref => ref.donorId === currentDonor.id);
          setReferrals(myReferrals);
        }
      } catch (error) {
        console.error("Error fetching donor data:", error);
        toast({
          title: "Error",
          description: "Failed to load your donor information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDonorData();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center items-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bloodlink-red"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Droplet className="h-8 w-8 mr-2 text-bloodlink-red" />
          <h1 className="text-2xl font-bold">Donor Dashboard</h1>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-bloodlink-red mb-2">Welcome, {user?.name || 'Donor'}</h2>
          <p className="text-gray-600">Thank you for your commitment to saving lives through blood donation.</p>
          
          {donorData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-100">
              <h3 className="font-medium text-bloodlink-red">Your Donor Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-500">Blood Type</p>
                  <p className="font-medium">{donorData.bloodType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium flex items-center">
                    {donorData.isAvailable ? (
                      <Badge className="bg-green-500">Available</Badge>
                    ) : (
                      <Badge className="bg-amber-500">Not Available</Badge>
                    )}
                  </p>
                </div>
                {donorData.lastDonationDate && (
                  <div>
                    <p className="text-sm text-gray-500">Last Donation</p>
                    <p className="font-medium">{new Date(donorData.lastDonationDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {referrals.length > 0 && (
            <div className="mt-4 p-4 bg-bloodlink-pink/10 rounded-md border border-bloodlink-pink">
              <h3 className="font-medium text-bloodlink-red flex items-center">
                <Bell className="h-4 w-4 mr-1" />
                Referral Notifications
              </h3>
              {referrals.map(ref => (
                <div key={ref.id} className="mt-2 p-2 bg-white rounded border border-gray-200">
                  <p className="text-sm">
                    <strong>Status:</strong> {ref.status === 'approved' ? 
                      <span className="text-green-600 font-medium">Approved</span> : 
                      <span className="text-amber-600 font-medium">Pending</span>
                    }
                  </p>
                  <p className="text-sm">
                    <strong>Hospital:</strong> {ref.hospitalName || 'Local Hospital'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(ref.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-bloodlink-red" />
                Schedule Donation
              </CardTitle>
              <CardDescription>Book your next appointment</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Choose a convenient time and location for your next blood donation.</p>
              <button className="mt-4 px-3 py-1 bg-bloodlink-red text-white text-sm rounded hover:bg-bloodlink-red/90">
                Check Availability
              </button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <ClipboardCheck className="h-5 w-5 mr-2 text-bloodlink-red" />
                Donation Status
              </CardTitle>
              <CardDescription>Track your donations</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>View the status of your recent donations and see if they've been matched to recipients.</p>
              {referrals.length > 0 ? (
                <p className="mt-2 text-sm font-medium text-bloodlink-red">
                  You have {referrals.filter(r => r.status === 'pending').length} pending referrals
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No active referrals</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-bloodlink-red" />
                Urgent Needs
              </CardTitle>
              <CardDescription>Critical blood needs</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Critical blood type needs in your area that match your blood type.</p>
              {donorData && (
                <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-sm font-medium text-red-700">
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                    {donorData.bloodType} urgently needed at City Hospital
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-bloodlink-red" />
                Your Impact
              </CardTitle>
              <CardDescription>Lives you've helped</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>See the impact of your donations and how many lives you've potentially saved.</p>
              <div className="mt-3">
                <p className="text-2xl font-bold text-bloodlink-red">{referrals.filter(r => r.status === 'completed').length}</p>
                <p className="text-sm text-gray-600">Successful donations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DonorHome;
