import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Droplet,
  CheckCircle,
  AlertTriangle,
  Search,
  Award,
  Info,
  PhoneCall,
  Bell,
  Hospital,
  Map,
  Calendar,
} from "lucide-react";
import Layout from "@/components/Layout";
import { mockDbService } from "@/services/mockDbService";
import { Recipient, Referral } from "@/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SystemUpdates from "@/components/dashboard/SystemUpdates";

const RecipientHome: React.FC = () => {
  const { user } = useAuth();
  const [recipientData, setRecipientData] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [matchedDonor, setMatchedDonor] = useState<{
    name: string;
    phone: string;
    bloodType: string;
  } | null>(null);
  const [completedDonations, setCompletedDonations] = useState<Referral[]>([]);

  useEffect(() => {
    const fetchRecipientData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const recipient = await mockDbService.getRecipientByUserId(user.id);
        if (recipient) {
          setRecipientData(recipient);

          const referrals = await mockDbService.getReferralsByRecipientId(
            recipient.id
          );

          // Set completed donations
          const completed = referrals.filter((r) => r.status === "completed");
          setCompletedDonations(completed);

          // Find the most recent matched referral
          const matchedReferral = referrals.find((r) => r.status === "matched");
          if (matchedReferral) {
            const donor = await mockDbService.getDonorById(
              matchedReferral.donorId
            );
            if (donor) {
              setMatchedDonor({
                name: donor.name,
                phone: donor.phone,
                bloodType: donor.bloodType,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching recipient data:", error);
        toast.error("Failed to load your information");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipientData();
  }, [user]);

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Recipient Profile */}
            <Card className="border-2 border-bloodlink-red/20">
              <CardHeader className="bg-gradient-to-r from-bloodlink-pink/5 to-bloodlink-darkpink/5">
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Droplet className="h-5 w-5 text-bloodlink-red" />
                  Your Recipient Profile
                </CardTitle>
                <CardDescription className="text-center">
                  Your blood request information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-center">
                    <p className="text-sm text-gray-500">Blood Type Needed</p>
                    <Badge className="bg-bloodlink-red text-lg px-4 py-1">
                      {recipientData?.bloodType}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-sm text-gray-500">Urgency Level</p>
                    <Badge
                      className={`text-lg px-4 py-1 ${
                        recipientData?.urgencyLevel === "high"
                          ? "bg-red-500"
                          : recipientData?.urgencyLevel === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      {recipientData?.urgencyLevel?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-sm text-gray-500">Hospital</p>
                    <p className="font-medium text-lg">
                      {recipientData?.hospitalName}
                    </p>
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium text-lg">
                      {recipientData?.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Matched Donor Information */}
            {matchedDonor && (
              <Card className="border-2 border-green-200">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <CardTitle className="flex items-center gap-2 justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Current Match
                  </CardTitle>
                  <CardDescription className="text-center">
                    Your matched donor information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-gray-500">Donor Name</p>
                      <p className="font-medium text-lg">{matchedDonor.name}</p>
                    </div>
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="font-medium text-lg">
                        {matchedDonor.phone}
                      </p>
                    </div>
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-gray-500">Blood Type</p>
                      <Badge className="bg-bloodlink-red text-lg px-4 py-1">
                        {matchedDonor.bloodType}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed Donations Section */}
            {completedDonations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 justify-center">
                    <Award className="h-5 w-5 text-bloodlink-red" />
                    Completed Donations
                  </CardTitle>
                  <CardDescription className="text-center">
                    History of your received blood donations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completedDonations.map((donation) => (
                      <div
                        key={donation.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-bloodlink-red text-lg">
                              Donation #{donation.id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Completed on{" "}
                              {new Date(donation.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Completed
                          </span>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">Donor</p>
                          <p className="font-medium">
                            {donation.donorName || "Unknown"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Urgent Status */}
            {recipientData?.urgencyLevel === "high" && (
              <Card className="border-2 border-red-200">
                <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
                  <CardTitle className="flex items-center gap-2 justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Urgent Status
                  </CardTitle>
                  <CardDescription className="text-center">
                    Your request has been marked as urgent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-sm font-medium text-red-800 text-center">
                      Your blood type {recipientData.bloodType} request is
                      urgent!
                    </p>
                    <p className="text-xs text-red-600 mt-1 text-center">
                      We are actively searching for compatible donors
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Nearby Donation Centers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Map className="h-5 w-5 text-bloodlink-red" />
                  Nearby Donation Centers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">City Blood Bank</p>
                      <p className="text-xs text-gray-500">0.8 miles away</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">Memorial Hospital</p>
                      <p className="text-xs text-gray-500">1.3 miles away</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Community Clinic</p>
                      <p className="text-xs text-gray-500">2.1 miles away</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <PhoneCall className="h-5 w-5 text-bloodlink-red" />
                  Important Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Hospital className="h-4 w-4 text-bloodlink-red" />
                      <span className="font-medium">Hospital Reception</span>
                    </div>
                    <span className="text-sm">555-123-4567</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-bloodlink-red" />
                      <span className="font-medium">Blood Bank</span>
                    </div>
                    <span className="text-sm">555-987-6543</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-bloodlink-red" />
                      <span className="font-medium">BloodLink Support</span>
                    </div>
                    <span className="text-sm">555-456-7890</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blood Type Compatibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Droplet className="h-5 w-5 text-bloodlink-red" />
                  Compatible Blood Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                  <p className="text-sm font-medium text-center mb-2">
                    Your blood type {recipientData?.bloodType} can receive from:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {recipientData?.bloodType === "A+" ? (
                      <>
                        <Badge className="bg-bloodlink-red">A+</Badge>
                        <Badge className="bg-bloodlink-red">A-</Badge>
                        <Badge className="bg-bloodlink-red">O+</Badge>
                        <Badge className="bg-bloodlink-red">O-</Badge>
                      </>
                    ) : recipientData?.bloodType === "A-" ? (
                      <>
                        <Badge className="bg-bloodlink-red">A-</Badge>
                        <Badge className="bg-bloodlink-red">O-</Badge>
                      </>
                    ) : recipientData?.bloodType === "B+" ? (
                      <>
                        <Badge className="bg-bloodlink-red">B+</Badge>
                        <Badge className="bg-bloodlink-red">B-</Badge>
                        <Badge className="bg-bloodlink-red">O+</Badge>
                        <Badge className="bg-bloodlink-red">O-</Badge>
                      </>
                    ) : recipientData?.bloodType === "B-" ? (
                      <>
                        <Badge className="bg-bloodlink-red">B-</Badge>
                        <Badge className="bg-bloodlink-red">O-</Badge>
                      </>
                    ) : recipientData?.bloodType === "AB+" ? (
                      <>
                        <Badge className="bg-bloodlink-red">All Types</Badge>
                      </>
                    ) : recipientData?.bloodType === "AB-" ? (
                      <>
                        <Badge className="bg-bloodlink-red">A-</Badge>
                        <Badge className="bg-bloodlink-red">B-</Badge>
                        <Badge className="bg-bloodlink-red">AB-</Badge>
                        <Badge className="bg-bloodlink-red">O-</Badge>
                      </>
                    ) : recipientData?.bloodType === "O+" ? (
                      <>
                        <Badge className="bg-bloodlink-red">O+</Badge>
                        <Badge className="bg-bloodlink-red">O-</Badge>
                      </>
                    ) : recipientData?.bloodType === "O-" ? (
                      <>
                        <Badge className="bg-bloodlink-red">O-</Badge>
                      </>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Updates */}
            <div>
              <SystemUpdates userRole="recipient" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecipientHome;
