
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { mockDbService } from '@/services/mockDbService';
import { Donor, Referral, Recipient, Hospital } from '@/types';
import { Calendar, Clock, Heart, Users, Activity, Building2, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const DonorHome: React.FC = () => {
  const { user } = useAuth();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [pendingReferralsCount, setPendingReferralsCount] = useState(0);
  const [completedDonationsCount, setCompletedDonationsCount] = useState(0);
  const [recipientsHelped, setRecipientsHelped] = useState(0);
  const [loading, setLoading] = useState(true);
  const [compatibleRecipients, setCompatibleRecipients] = useState(0);
  
  useEffect(() => {
    const fetchDonorData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch donor data
        const donors = await mockDbService.getDonors();
        const currentDonor = donors.find(d => d.userId === user.id) || null;
        setDonor(currentDonor);
        
        if (currentDonor) {
          // Fetch compatible recipients
          const recipients = await mockDbService.getCompatibleRecipients(currentDonor.bloodType);
          setCompatibleRecipients(recipients.length);
          
          // Fetch referrals
          const allReferrals = await mockDbService.getReferrals();
          const donorReferrals = allReferrals.filter(r => r.donorId === currentDonor.id);
          setReferrals(donorReferrals);
          
          // Count pending and completed referrals
          const pending = donorReferrals.filter(r => r.status === 'pending').length;
          const completed = donorReferrals.filter(r => r.status === 'completed').length;
          
          setPendingReferralsCount(pending);
          setCompletedDonationsCount(completed);
          
          // Count unique recipients helped
          const uniqueRecipients = new Set(
            donorReferrals
              .filter(r => r.status === 'completed')
              .map(r => r.recipientId)
          );
          setRecipientsHelped(uniqueRecipients.size);
        }
      } catch (error) {
        console.error('Error fetching donor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonorData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Please log in to access your donor dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="bg-bloodlink-pink py-8">
        <div className="container px-4 md:px-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-bloodlink-red border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
                <p className="text-gray-600">Your donor dashboard</p>
              </div>
              
              {!donor ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="mb-4">
                      <Heart className="h-12 w-12 text-bloodlink-red mx-auto" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Complete Your Donor Profile</h2>
                    <p className="text-gray-600 mb-6">
                      To start donating and helping recipients, please complete your donor profile with your blood type and other important information.
                    </p>
                    <Link to="/donor/complete-profile">
                      <Button className="bg-bloodlink-red hover:bg-bloodlink-red/80">
                        Complete Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Pending Referrals</p>
                            <h3 className="text-2xl font-bold">{pendingReferralsCount}</h3>
                          </div>
                          <div className="h-12 w-12 bg-bloodlink-red/10 rounded-full flex items-center justify-center">
                            <Clock className="h-6 w-6 text-bloodlink-red" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Donations Completed</p>
                            <h3 className="text-2xl font-bold">{completedDonationsCount}</h3>
                          </div>
                          <div className="h-12 w-12 bg-bloodlink-red/10 rounded-full flex items-center justify-center">
                            <Heart className="h-6 w-6 text-bloodlink-red" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Recipients Helped</p>
                            <h3 className="text-2xl font-bold">{recipientsHelped}</h3>
                          </div>
                          <div className="h-12 w-12 bg-bloodlink-red/10 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-bloodlink-red" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Potential Matches</p>
                            <h3 className="text-2xl font-bold">{compatibleRecipients}</h3>
                          </div>
                          <div className="h-12 w-12 bg-bloodlink-red/10 rounded-full flex items-center justify-center">
                            <Activity className="h-6 w-6 text-bloodlink-red" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Recent Activity</CardTitle>
                          <Link to="/referrals">
                            <Button variant="ghost" className="text-bloodlink-red">
                              View All
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {referrals.length > 0 ? (
                          <div className="space-y-4">
                            {referrals.slice(0, 3).map(referral => (
                              <div key={referral.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  referral.status === 'completed' 
                                    ? 'bg-green-100' 
                                    : referral.status === 'pending'
                                    ? 'bg-yellow-100'
                                    : 'bg-red-100'
                                }`}>
                                  {referral.status === 'completed' ? (
                                    <Heart className="h-5 w-5 text-green-600" />
                                  ) : referral.status === 'pending' ? (
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                  ) : (
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-red-600"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <line x1="18" y1="6" x2="6" y2="18"></line>
                                      <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">
                                    Referral {referral.status === 'completed' ? 'completed' : referral.status === 'pending' ? 'pending' : 'cancelled'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(referral.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Link to={`/referrals/${referral.id}`}>
                                  <Button variant="ghost" size="sm">
                                    Details
                                  </Button>
                                </Link>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500">No referrals yet</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Link to="/matches" className="w-full">
                          <Button className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80">
                            Find New Matches
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                    
                    <Card className="lg:row-span-2">
                      <CardHeader>
                        <CardTitle>Your Information</CardTitle>
                        <CardDescription>Donor profile details</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Droplet className="h-5 w-5 text-bloodlink-red" />
                            <div>
                              <p className="text-sm text-gray-500">Blood Type</p>
                              <p className="font-medium">{donor.bloodType}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-bloodlink-red" />
                            <div>
                              <p className="text-sm text-gray-500">Last Donation</p>
                              <p className="font-medium">
                                {donor.lastDonationDate 
                                  ? new Date(donor.lastDonationDate).toLocaleDateString() 
                                  : 'No donations yet'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-bloodlink-red" />
                            <div>
                              <p className="text-sm text-gray-500">Donor Status</p>
                              <p className="font-medium">
                                {donor.isAvailable ? 'Available' : 'Not Available'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <BarChart3 className="h-5 w-5 text-bloodlink-red" />
                            <div>
                              <p className="text-sm text-gray-500">Compatibility</p>
                              <p className="font-medium">
                                Compatible with {compatibleRecipients} recipients
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Link to="/profile">
                          <Button variant="outline">Update Profile</Button>
                        </Link>
                        <Link to="/donor/schedule">
                          <Button className="bg-bloodlink-red hover:bg-bloodlink-red/80">
                            Schedule Donation
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default DonorHome;
