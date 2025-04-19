import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, AlertTriangle, Settings, Heart, ChartBar, Calendar, Award, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminService } from '@/services/adminService';
import UsersManagement from '@/components/admin/UsersManagement';
import HospitalManagement from '@/components/admin/HospitalManagement';
import SystemAlerts from '@/components/admin/SystemAlerts';
import AnalyticsDisplay from '@/components/admin/AnalyticsDisplay';
import EventsManagement from '@/components/admin/EventsManagement';
import AppointmentsManagement from '@/components/admin/AppointmentsManagement';

const AdminHome: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeDonors: 0,
    activeRecipients: 0,
    pendingMatches: 0,
    completedDonations: 0
  });
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const analytics = await adminService.getAnalyticsData();
        setAnalyticsData(analytics);
        setStats({
          activeDonors: analytics.stats.activeDonors,
          activeRecipients: analytics.stats.activeRecipients,
          pendingMatches: analytics.stats.pendingMatches,
          completedDonations: analytics.stats.completedDonations
        });
        
        const usersData = await adminService.getAllUsers();
        setUsers(usersData);
        
        const hospitalsData = await adminService.getAllHospitals();
        setHospitals(hospitalsData);
        
        const eventsData = await adminService.getUpcomingEvents();
        setEvents(eventsData);
        
        const alertsData = await adminService.getSystemAlerts();
        setAlerts(alertsData);
        
        const appointmentsData = await adminService.getAllAppointments();
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    const success = await adminService.updateAppointmentStatus(appointmentId, status);
    if (success) {
      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-bloodlink-red" />
          <span className="ml-2">Loading dashboard data...</span>
        </div>
      </Layout>
    );
  }

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="p-3 rounded-full mr-4 bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.activeDonors}</p>
                <p className="text-sm text-gray-500">Active Donors</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="p-3 rounded-full mr-4 bg-red-100 text-red-600">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.activeRecipients}</p>
                <p className="text-sm text-gray-500">Active Recipients</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="p-3 rounded-full mr-4 bg-yellow-100 text-yellow-600">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.pendingMatches}</p>
                <p className="text-sm text-gray-500">Pending Matches</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="p-3 rounded-full mr-4 bg-green-100 text-green-600">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.completedDonations}</p>
                <p className="text-sm text-gray-500">Completed Donations</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
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
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab('users')}>View Users</Button>
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
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab('hospitals')}>View Hospitals</Button>
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
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab('analytics')}>View Analytics</Button>
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
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab('events')}>Manage Events</Button>
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
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab('alerts')}>View Alerts</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <UsersManagement users={users} />
          </TabsContent>
          
          <TabsContent value="hospitals">
            <HospitalManagement hospitals={hospitals} />
          </TabsContent>
          
          <TabsContent value="appointments">
            <AppointmentsManagement 
              appointments={appointments} 
              onUpdateStatus={handleUpdateAppointmentStatus}
            />
          </TabsContent>
          
          <TabsContent value="analytics">
            {analyticsData && (
              <AnalyticsDisplay 
                stats={analyticsData.stats}
                bloodTypeDistribution={analyticsData.bloodTypeDistribution}
                monthlyDonations={analyticsData.monthlyDonations}
              />
            )}
          </TabsContent>
          
          <TabsContent value="events">
            <EventsManagement events={events} />
          </TabsContent>
          
          <TabsContent value="alerts">
            <SystemAlerts alerts={alerts} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminHome;
