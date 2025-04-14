
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, ClipboardList, Hospital, Bell, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';
import { mockDbService } from '@/services/mockDbService';
import { Recipient } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
        // Fetch recipient profile
        const recipients = await mockDbService.getRecipients();
        const currentRecipient = recipients.find(recipient => recipient.userId === user.id);
        
        if (currentRecipient) {
          setRecipientData(currentRecipient);
          
          // Fetch referrals for this recipient
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

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Droplet className="h-8 w-8 mr-2 text-bloodlink-red" />
          <h1 className="text-2xl font-bold">Recipient Dashboard</h1>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-bloodlink-red mb-2">Welcome, {user?.name || 'Recipient'}</h2>
          <p className="text-gray-600">We're here to help you throughout your blood request journey.</p>
          
          {recipientData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-100">
              <h3 className="font-medium text-bloodlink-red">Your Recipient Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-500">Blood Type Needed</p>
                  <Badge className="mt-1 bg-red-500">{recipientData.bloodType}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Urgency Level</p>
                  <Badge className={`mt-1 ${
                    recipientData.urgency === 'critical' ? 'bg-red-600' : 
                    recipientData.urgency === 'urgent' ? 'bg-amber-500' : 'bg-green-500'
                  }`}>
                    {recipientData.urgency.charAt(0).toUpperCase() + recipientData.urgency.slice(1)}
                  </Badge>
                </div>
                {recipientData.preferredHospital && (
                  <div>
                    <p className="text-sm text-gray-500">Preferred Hospital</p>
                    <p className="font-medium">{recipientData.preferredHospital}</p>
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
                    <strong>Matched Donor:</strong> {ref.donorName || 'Pending match'}
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
                <ClipboardList className="h-5 w-5 mr-2 text-bloodlink-red" />
                Request Status
              </CardTitle>
              <CardDescription>View your blood requests</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Track the status of your blood requests and potential matches.</p>
              {referrals.length > 0 ? (
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Request status:</span>
                    <Badge className={`${
                      referrals.some(r => r.status === 'approved') ? 'bg-green-500' : 'bg-amber-500'
                    }`}>
                      {referrals.some(r => r.status === 'approved') ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No active requests</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Hospital className="h-5 w-5 mr-2 text-bloodlink-red" />
                Hospital Assignment
              </CardTitle>
              <CardDescription>Hospital information</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>View assigned hospital details for your blood transfusion.</p>
              {recipientData?.preferredHospital ? (
                <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm font-medium">{recipientData.preferredHospital}</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No hospital assigned yet</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-bloodlink-red" />
                Notifications
              </CardTitle>
              <CardDescription>Important updates</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Receive important notifications about your blood request and matches.</p>
              {referrals.some(r => r.status === 'approved') ? (
                <div className="mt-3 p-2 bg-green-50 border border-green-100 rounded-md">
                  <p className="text-sm font-medium text-green-700">
                    <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    A donor match has been approved!
                  </p>
                </div>
              ) : (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-sm font-medium text-blue-700">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    We're matching you with donors
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-bloodlink-red" />
                Schedule Appointment
              </CardTitle>
              <CardDescription>Book transfusion appointment</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Schedule an appointment for your blood transfusion when a match is found.</p>
              <button 
                className={`mt-4 px-3 py-1 text-white text-sm rounded ${
                  referrals.some(r => r.status === 'approved') 
                  ? 'bg-bloodlink-red hover:bg-bloodlink-red/90' 
                  : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={!referrals.some(r => r.status === 'approved')}
              >
                {referrals.some(r => r.status === 'approved') ? 'Schedule Now' : 'Awaiting Match'}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RecipientHome;
