import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockDbService } from '@/services/mockDbService';
import { Donor } from '@/types';
import { Calendar, CheckCircle, Heart, User, XCircle, Droplet } from 'lucide-react';
import { toast } from 'sonner';

const DonorHome: React.FC = () => {
  const { user } = useAuth();
  const [donorProfile, setDonorProfile] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableDonors, setAvailableDonors] = useState<Donor[]>([]);

  useEffect(() => {
    const fetchDonorData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const donors = await mockDbService.getDonors();
        const donor = donors.find(d => d.userId === user.id) || null;
        setDonorProfile(donor);

        // Fetch available donors with the same blood type
        if (donor) {
          const compatibleDonors = donors.filter(
            d => d.bloodType === donor.bloodType && d.isAvailable && d.id !== donor.id
          );
          setAvailableDonors(compatibleDonors);
        }
      } catch (error) {
        console.error('Error fetching donor data:', error);
        toast.error('Failed to load donor data');
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
          <p>Please log in to view this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-bloodlink-pink py-8">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-12">
            {/* Donor Profile Card */}
            <Card className="md:col-span-4 lg:col-span-3">
              <CardHeader>
                <div className="flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-bloodlink-red/20 flex items-center justify-center">
                    <User className="h-12 w-12 text-bloodlink-red" />
                  </div>
                </div>
                <CardTitle className="text-center mt-2">{user.name}</CardTitle>
              </CardHeader>

              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-bloodlink-red border-t-transparent"></div>
                  </div>
                ) : donorProfile ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Heart className="h-5 w-5 text-bloodlink-red" />
                      <span>Donor since {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <Droplet className="h-5 w-5 text-bloodlink-red" />
                      <span>Blood Type: {donorProfile.bloodType}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-5 w-5 text-bloodlink-red" />
                      <span>
                        Last donation:{' '}
                        {donorProfile.lastDonationDate
                          ? new Date(donorProfile.lastDonationDate).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      {donorProfile.isAvailable ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span>Available for donation</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span>Not available</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Please complete your donor profile.</p>
                    <Button className="mt-4 bg-bloodlink-red hover:bg-bloodlink-red/80">
                      Complete Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Donors List */}
            <div className="md:col-span-8 lg:col-span-9">
              <Card>
                <CardHeader>
                  <CardTitle>Compatible Donors Available</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-bloodlink-red border-t-transparent"></div>
                    </div>
                  ) : availableDonors.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {availableDonors.map(donor => (
                        <div key={donor.id} className="p-4 bg-white rounded-lg shadow">
                          <h3 className="text-lg font-semibold">{donor.name}</h3>
                          <p className="text-gray-600">Blood Type: {donor.bloodType}</p>
                          <p className="text-gray-600">Phone: {donor.phone}</p>
                          {/* Add more donor details as needed */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No compatible donors are currently available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DonorHome;
