import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Calendar, Bell, Award, ClipboardCheck, AlertTriangle, Clock, Heart } from 'lucide-react';
import Layout from '@/components/Layout';
import { mockDbService } from '@/services/mockDbService';
import { Donor } from '@/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';

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
        const donors = await mockDbService.getDonors();
        const currentDonor = donors.find(donor => donor.userId === user.id);
        
        if (currentDonor) {
          setDonorData(currentDonor);
          
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

  const donationStats = {
    totalDonations: referrals.filter(r => r.status === 'completed').length,
    lastDonation: donorData?.lastDonationDate ? new Date(donorData.lastDonationDate).toLocaleDateString() : 'No donations yet',
    pendingRequests: referrals.filter(r => r.status === 'pending').length,
    nextEligibleDate: donorData?.lastDonationDate ? 
      new Date(new Date(donorData.lastDonationDate).setMonth(new Date(donorData.lastDonationDate).getMonth() + 3)).toLocaleDateString() 
      : 'Available now'
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="h-8 w-8 text-bloodlink-red" />
              <div>
                <h1 className="text-2xl font-bold">Donor Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.name || 'Donor'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              className="gap-2"
              disabled={!donorData?.isAvailable}
              onClick={() => toast.info("Scheduling system coming soon!")}
            >
              <Calendar className="h-4 w-4" />
              Schedule Donation
            </Button>
          </div>

          {donorData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Donations"
                value={donationStats.totalDonations}
                icon={Heart}
                description="Lives impacted through your contributions"
              />
              <StatsCard
                title="Last Donation"
                value={donationStats.lastDonation}
                icon={Clock}
                description="Your most recent blood donation"
              />
              <StatsCard
                title="Pending Requests"
                value={donationStats.pendingRequests}
                icon={Bell}
                description="Awaiting your response"
              />
              <StatsCard
                title="Next Eligible Date"
                value={donationStats.nextEligibleDate}
                icon={Calendar}
                description="When you can donate again"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>Your Donor Profile</CardTitle>
                <CardDescription>Your current donation status and information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Type</p>
                    <Badge className="mt-1 bg-bloodlink-red">{donorData?.bloodType}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {donorData?.isAvailable ? (
                      <Badge className="bg-green-500">Available to Donate</Badge>
                    ) : (
                      <Badge variant="secondary">Cooling Period</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-bloodlink-red" />
                  Urgent Needs
                </CardTitle>
                <CardDescription>Critical blood type requests</CardDescription>
              </CardHeader>
              <CardContent>
                {donorData && (
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-sm font-medium text-red-800">
                        Your blood type {donorData.bloodType} is currently needed!
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        3 urgent requests in your area
                      </p>
                    </div>
                    <Button className="w-full" variant="destructive">
                      Respond to Request
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {referrals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
                <CardDescription>Your latest donation matches and requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referrals.map(ref => (
                    <div key={ref.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{ref.hospitalName || 'Local Hospital'}</p>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(ref.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        className={ref.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}
                      >
                        {ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DonorHome;
