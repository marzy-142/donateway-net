
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Building2, Users, Thermometer } from 'lucide-react';
import Layout from '@/components/Layout';

const HospitalHome: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Building2 className="h-8 w-8 mr-2 text-bloodlink-red" />
          <h1 className="text-2xl font-bold">Hospital Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Droplet className="h-5 w-5 mr-2 text-bloodlink-red" />
                Blood Inventory
              </CardTitle>
              <CardDescription>Manage your blood stock</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>View and update your hospital's blood inventory levels.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-bloodlink-red" />
                Donor Management
              </CardTitle>
              <CardDescription>Manage donor appointments</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Schedule and manage blood donation appointments.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Thermometer className="h-5 w-5 mr-2 text-bloodlink-red" />
                Emergency Requests
              </CardTitle>
              <CardDescription>Urgent blood needs</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Create and broadcast emergency blood requests to donors.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default HospitalHome;
