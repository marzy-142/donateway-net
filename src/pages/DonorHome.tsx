
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Calendar, Bell, Award, ClipboardCheck } from 'lucide-react';
import Layout from '@/components/Layout';

const DonorHome: React.FC = () => {
  const { user } = useAuth();

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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-bloodlink-red" />
                Donation Alerts
              </CardTitle>
              <CardDescription>Urgent donation needs</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Get notified about urgent blood donation needs matching your blood type.</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DonorHome;
