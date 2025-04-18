import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, ClipboardList, Hospital, Bell, Calendar, Clock, Users, Activity } from 'lucide-react';
import Layout from '@/components/Layout';
import { mockDbService } from '@/services/mockDbService';
import { Recipient } from '@/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';

const RecipientHome: React.FC = () => {
  const { user } = useAuth();
  const [recipientData, setRecipientData] = useState<Recipient | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipientData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const recipients = await mockDbService.getRecipients();
        const currentRecipient = recipients.find(recipient => recipient.userId === user.id);
        
        if (currentRecipient) {
          setRecipientData(currentRecipient);
          
          const allReferrals = await mockDbService.getReferrals();
          const myReferrals = allReferrals.filter(ref => ref.recipientId === currentRecipient.id);
          setReferrals(myReferrals);
        }
      } catch (error) {
        console.error("Error fetching recipient data:", error);
        toast({
          title: "Error",
          description: "Failed to load your recipient information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipientData();
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

  const stats = {
    potentialDonors: referrals.length,
    matchedDonors: referrals.filter(r => r.status === 'approved').length,
    daysWaiting: recipientData ? 
      Math.floor((new Date().getTime() - new Date(recipientData.createdAt || new Date()).getTime()) / (1000 * 3600 * 24)) : 0,
    status: recipientData?.urgency || 'normal'
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="h-8 w-8 text-bloodlink-red" />
              <div>
                <h1 className="text-2xl font-bold">Recipient Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome, {user?.name || 'Recipient'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => toast.info("Support team will contact you soon")}
            >
              <Hospital className="h-4 w-4" />
              Contact Support
            </Button>
          </div>

          {recipientData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Potential Donors"
                value={stats.potentialDonors}
                icon={Users}
                description="Compatible donors found"
              />
              <StatsCard
                title="Matched Donors"
                value={stats.matchedDonors}
                icon={Activity}
                description="Approved matches ready to help"
              />
              <StatsCard
                title="Days Waiting"
                value={stats.daysWaiting}
                icon={Clock}
                description="Time since request created"
              />
              <StatsCard
                title="Current Status"
                value={stats.status.toUpperCase()}
                icon={AlertTriangle}
                description="Your request priority level"
                className={`${
                  stats.status === 'critical' ? 'bg-red-50' :
                  stats.status === 'urgent' ? 'bg-amber-50' : ''
                }`}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Your Blood Request</CardTitle>
                <CardDescription>Current status and requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Type Needed</p>
                    <Badge className="mt-1 bg-bloodlink-red">{recipientData?.bloodType}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Urgency Level</p>
                    <Badge className={`mt-1 ${
                      recipientData?.urgency === 'critical' ? 'bg-red-500' :
                      recipientData?.urgency === 'urgent' ? 'bg-amber-500' :
                      'bg-green-500'
                    }`}>
                      {recipientData?.urgency.charAt(0).toUpperCase() + recipientData?.urgency.slice(1)}
                    </Badge>
                  </div>
                  {recipientData?.preferredHospital && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Preferred Hospital</p>
                      <p className="font-medium mt-1">{recipientData.preferredHospital}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-bloodlink-red" />
                  Latest Updates
                </CardTitle>
                <CardDescription>Recent activity on your request</CardDescription>
              </CardHeader>
              <CardContent>
                {referrals.some(r => r.status === 'approved') ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        Donor match found!
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Schedule your appointment now
                      </p>
                    </div>
                    <Button className="w-full" variant="default">
                      Schedule Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      We're actively searching for donors
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      You'll be notified when we find a match
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {referrals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Donation Matches</CardTitle>
                <CardDescription>Your matched donors and appointment status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referrals.map(ref => (
                    <div key={ref.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{ref.donorName || 'Anonymous Donor'}</p>
                        <p className="text-sm text-muted-foreground">
                          At: {ref.hospitalName || 'Local Hospital'}
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

export default RecipientHome;
