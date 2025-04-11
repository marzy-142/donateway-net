
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, ClipboardList, Hospital, Bell, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';

const RecipientHome: React.FC = () => {
  const { user } = useAuth();

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
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RecipientHome;
