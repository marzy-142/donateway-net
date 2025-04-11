
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, AlertTriangle, Settings, Heart, ChartBar, Calendar, Award } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

const AdminHome: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Donors', value: 124, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Recipients', value: 57, icon: Heart, color: 'bg-red-100 text-red-600' },
    { label: 'Pending Matches', value: 18, icon: Heart, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Completed Donations', value: 203, icon: Award, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Settings className="h-8 w-8 mr-2 text-bloodlink-red" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div>
            <Link to="/matches">
              <Button className="bg-bloodlink-red hover:bg-bloodlink-red/80">
                Manage Matches
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-bloodlink-red mb-2">Welcome, {user?.name || 'Administrator'}</h2>
          <p className="text-gray-600">Manage and oversee the blood donation system from this central dashboard.</p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex items-center">
                <div className={`p-3 rounded-full mr-4 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
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
              <p className="mb-4">Add, remove, and update users of all types in the system.</p>
              <Button className="w-full" variant="outline">View Users</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-bloodlink-red" />
                Blood Matching
              </CardTitle>
              <CardDescription>Manage donor-recipient matches</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">Review and approve matches between donors and recipients.</p>
              <Link to="/matches">
                <Button className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80">View Matches</Button>
              </Link>
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
              <p className="mb-4">Add new hospitals and manage existing hospital information.</p>
              <Button className="w-full" variant="outline">View Hospitals</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <ChartBar className="h-5 w-5 mr-2 text-bloodlink-red" />
                Analytics
              </CardTitle>
              <CardDescription>System statistics</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">View detailed analytics and statistics about the blood donation system.</p>
              <Button className="w-full" variant="outline">View Analytics</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-bloodlink-red" />
                Events
              </CardTitle>
              <CardDescription>Blood donation drives</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">Schedule and manage blood donation drives and events.</p>
              <Button className="w-full" variant="outline">Manage Events</Button>
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
              <p className="mb-4">View and respond to critical blood shortage alerts and system issues.</p>
              <Button className="w-full" variant="outline">View Alerts</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminHome;
