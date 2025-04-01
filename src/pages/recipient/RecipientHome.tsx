
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet } from 'lucide-react';
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle>Request Blood</CardTitle>
              <CardDescription>Submit a new blood request</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Create a new blood request for your medical needs.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle>My Requests</CardTitle>
              <CardDescription>View your current blood requests</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Manage and track the status of your existing blood requests.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle>Find Donors</CardTitle>
              <CardDescription>Search for compatible donors</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Find potential donors matching your blood type requirements.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RecipientHome;
