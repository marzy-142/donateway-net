
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, AlertTriangle, Settings } from 'lucide-react';
import Layout from '@/components/Layout';

const AdminHome: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Settings className="h-8 w-8 mr-2 text-bloodlink-red" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-bloodlink-red" />
                User Management
              </CardTitle>
              <CardDescription>Manage all users</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Add, remove, and update users of all types in the system.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-bloodlink-red" />
                Hospital Management
              </CardTitle>
              <CardDescription>Manage hospital records</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Add new hospitals and manage existing hospital information.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-bloodlink-red" />
                System Alerts
              </CardTitle>
              <CardDescription>Critical notifications</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>View and respond to critical blood shortage alerts and system issues.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminHome;
