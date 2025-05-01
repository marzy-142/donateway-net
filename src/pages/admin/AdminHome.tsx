import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Building2,
  Settings,
  Heart,
  ChartBar,
  Loader2,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminService } from "@/services/adminService";
import HospitalManagement from "@/components/admin/HospitalManagement";
import AnalyticsDisplay from "@/components/admin/AnalyticsDisplay";
import AppointmentsManagement from "@/components/admin/AppointmentsManagement";
import ActiveUsersManagement from "@/components/admin/ActiveUsersManagement";
import type { Appointment } from "@/types";

const AdminHome: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeDonors: 0,
    activeRecipients: 0,
    pendingMatches: 0,
    completedDonations: 0,
  });
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats and analytics
        const analyticsData = await adminService.getAnalyticsData();
        setAnalyticsData(analyticsData);
        setStats({
          activeDonors: analyticsData.stats.activeDonors,
          activeRecipients: analyticsData.stats.activeRecipients,
          pendingMatches: analyticsData.stats.pendingMatches,
          completedDonations: analyticsData.stats.completedDonations,
        });

        // Fetch hospitals
        const allHospitals = await adminService.getAllHospitals();
        setHospitals(allHospitals);

        // Fetch appointments
        const allAppointments = await adminService.getAllAppointments();
        setAppointments(allAppointments);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleUpdateAppointmentStatus = async (
    appointmentId: string,
    status: "scheduled" | "completed" | "cancelled"
  ) => {
    const success = await adminService.updateAppointmentStatus(
      appointmentId,
      status
    );
    if (success) {
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
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
          <h2 className="text-lg font-semibold text-bloodlink-red mb-2">
            Welcome, {user?.name || "Administrator"}
          </h2>
          <p className="text-gray-600">
            Manage and oversee the blood donation system from this central
            dashboard.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="active-users">Active Users</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="p-3 rounded-full mr-4 bg-blue-100 text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Donors</p>
                    <p className="text-2xl font-bold">{stats.activeDonors}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="p-3 rounded-full mr-4 bg-green-100 text-green-600">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Recipients</p>
                    <p className="text-2xl font-bold">{stats.activeRecipients}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="p-3 rounded-full mr-4 bg-yellow-100 text-yellow-600">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Matches</p>
                    <p className="text-2xl font-bold">{stats.pendingMatches}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="p-3 rounded-full mr-4 bg-purple-100 text-purple-600">
                    <ChartBar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed Donations</p>
                    <p className="text-2xl font-bold">
                      {stats.completedDonations}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="active-users">
            <ActiveUsersManagement />
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
            <AnalyticsDisplay
              stats={analyticsData.stats}
              bloodTypeDistribution={analyticsData.bloodTypeDistribution}
              monthlyDonations={analyticsData.monthlyDonations}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminHome;
