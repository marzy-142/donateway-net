import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Calendar,
  Bell,
  Clock,
  Award,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockDbService } from "@/services/mockDbService";
import { Donor } from "@/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import SystemUpdates from "@/components/dashboard/SystemUpdates";

const DonorHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [donorData, setDonorData] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonations: 0,
    lastDonation: null as Date | null,
    nextEligibleDate: null as Date | null,
    pendingRequests: 0,
  });

  const [matchedRecipient, setMatchedRecipient] = useState<{
    name: string;
    phone: string;
    bloodType: string;
    hospitalName: string;
  } | null>(null);

  useEffect(() => {
    const fetchDonorData = async () => {
      if (!user) return;

      try {
        const donor = await mockDbService.getDonorByUserId(user.id);
        if (donor) {
          // Check and update donor availability based on last donation date
          await mockDbService.checkAndUpdateDonorAvailability(donor.id);
          // Fetch updated donor data
          const updatedDonor = await mockDbService.getDonorByUserId(user.id);
          setDonorData(updatedDonor);

          // Calculate stats
          const referrals = await mockDbService.getReferralsByUserId(user.id);
          const completedDonations = referrals.filter(
            (r) => r.status === "completed"
          );

          // Find the most recent matched referral
          const matchedReferral = referrals.find((r) => r.status === "matched");
          if (matchedReferral) {
            const recipient = await mockDbService.getRecipientById(
              matchedReferral.recipientId
            );
            if (recipient) {
              setMatchedRecipient({
                name: recipient.name,
                phone: recipient.phone,
                bloodType: recipient.bloodType,
                hospitalName: recipient.hospitalName,
              });
            }
          }

          setStats({
            totalDonations: completedDonations.length,
            lastDonation: updatedDonor?.lastDonationDate
              ? new Date(updatedDonor.lastDonationDate)
              : null,
            nextEligibleDate: updatedDonor?.lastDonationDate
              ? new Date(
                  new Date(updatedDonor.lastDonationDate).setMonth(
                    new Date(updatedDonor.lastDonationDate).getMonth() + 3
                  )
                )
              : null,
            pendingRequests: referrals.filter((r) => r.status === "pending")
              .length,
          });
        }
      } catch (error) {
        console.error("Error fetching donor data:", error);
        toast.error("Failed to load your information");
      } finally {
        setLoading(false);
      }
    };

    fetchDonorData();

    // Set up polling for referral updates
    const pollInterval = setInterval(fetchDonorData, 30000); // Check every 30 seconds

    return () => clearInterval(pollInterval);
  }, [user]);

  const renderStatCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    description: string
  ) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-bloodlink-red/10 rounded-full">{icon}</div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-bloodlink-red"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Donor Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderStatCard(
                <Heart className="h-5 w-5 text-bloodlink-red" />,
                "Total Donations",
                stats.totalDonations,
                "Lives impacted through your contributions"
              )}
              {renderStatCard(
                <Clock className="h-5 w-5 text-bloodlink-red" />,
                "Last Donation",
                stats.lastDonation
                  ? stats.lastDonation.toLocaleDateString()
                  : "No donations yet",
                "Your most recent contribution"
              )}
              {renderStatCard(
                <Calendar className="h-5 w-5 text-bloodlink-red" />,
                "Next Eligible Date",
                stats.nextEligibleDate
                  ? stats.nextEligibleDate.toLocaleDateString()
                  : "Available now",
                "When you can donate again"
              )}
              {renderStatCard(
                <Bell className="h-5 w-5 text-bloodlink-red" />,
                "Pending Requests",
                stats.pendingRequests,
                "Awaiting your response"
              )}
            </div>

            {/* Matched Recipient Information */}
            {matchedRecipient && (
              <Card>
                <CardHeader>
                  <CardTitle>Matched Recipient</CardTitle>
                  <CardDescription>
                    Your matched recipient information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Recipient Name</p>
                      <p className="font-medium">{matchedRecipient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="font-medium">{matchedRecipient.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Blood Type Needed</p>
                      <Badge className="mt-1 bg-bloodlink-red">
                        {matchedRecipient.bloodType}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hospital</p>
                      <p className="font-medium">
                        {matchedRecipient.hospitalName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Donor Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Your Donor Profile</CardTitle>
                <CardDescription>
                  Your current donation status and information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Blood Type</p>
                    <Badge className="mt-1 bg-bloodlink-red">
                      {donorData?.bloodType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    {donorData?.isAvailable ? (
                      <Badge className="bg-green-500">
                        Available to Donate
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Cooling Period</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium">{donorData?.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{donorData?.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Updates */}
            <SystemUpdates userRole="donor" />
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate("/hospitals")}
                  disabled={!donorData?.isAvailable}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Donation
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate("/referrals")}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  View Referrals
                </Button>
              </CardContent>
            </Card>

            {/* Urgent Needs */}
            {donorData?.isAvailable && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-bloodlink-red" />
                    Urgent Needs
                  </CardTitle>
                  <CardDescription>
                    Critical blood type requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-sm font-medium text-red-800">
                        Your blood type {donorData.bloodType} is currently
                        needed!
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Consider scheduling a donation
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DonorHome;
