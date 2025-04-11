
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { mockDbService } from '@/services/mockDbService';
import { Donor, Recipient, Hospital } from '@/types';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Droplet, UserRound, Building2, Calendar, Activity } from 'lucide-react';

const ViewMatch: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  
  useEffect(() => {
    const fetchMatchData = async () => {
      if (!matchId) return;
      
      setLoading(true);
      try {
        // In a real application, you would fetch the match data from an API
        // For now, we'll use mock data
        const mockDonor = await mockDbService.getDonorById(matchId);
        setDonor(mockDonor || null);
        
        if (mockDonor) {
          const recipients = await mockDbService.getCompatibleRecipients(mockDonor.bloodType);
          if (recipients.length > 0) {
            setRecipient(recipients[0]);
          }
          
          const hospitals = await mockDbService.getHospitals();
          if (hospitals.length > 0) {
            setHospital(hospitals[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching match data:', error);
        toast.error('Failed to load match data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatchData();
  }, [matchId]);
  
  const handleApproveMatch = () => {
    toast.success('Match approved successfully');
    navigate('/matches');
  };
  
  const handleRejectMatch = () => {
    toast.error('Match rejected');
    navigate('/matches');
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-bloodlink-red border-t-transparent"></div>
        </div>
      </Layout>
    );
  }
  
  if (!donor || !recipient || !hospital) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-700">Match not found</h2>
            <p className="mt-2 text-gray-500">The match information you're looking for could not be found.</p>
            <Button 
              className="mt-4 bg-bloodlink-red hover:bg-bloodlink-red/80"
              onClick={() => navigate('/matches')}
            >
              Return to Matches
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Droplet className="h-8 w-8 mr-2 text-bloodlink-red" />
          <h1 className="text-2xl font-bold">Match Details</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donor Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <UserRound className="h-5 w-5 mr-2 text-bloodlink-red" />
                Donor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-gray-500">Name</Label>
                  <p className="font-medium">{donor.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Blood Type</Label>
                  <p className="font-medium text-bloodlink-red">{donor.bloodType}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Age</Label>
                  <p className="font-medium">{donor.age}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Contact</Label>
                  <p className="font-medium">{donor.phone}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Email</Label>
                  <p className="font-medium">{donor.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Last Donation</Label>
                  <p className="font-medium">{donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'None'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recipient Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <UserRound className="h-5 w-5 mr-2 text-bloodlink-red" />
                Recipient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-gray-500">Name</Label>
                  <p className="font-medium">{recipient.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Blood Type</Label>
                  <p className="font-medium text-bloodlink-red">{recipient.bloodType}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Contact</Label>
                  <p className="font-medium">{recipient.phone}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Urgency</Label>
                  <p className={`font-medium ${
                    recipient.urgency === 'critical' ? 'text-red-600' :
                    recipient.urgency === 'urgent' ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    {recipient.urgency.charAt(0).toUpperCase() + recipient.urgency.slice(1)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Medical Condition</Label>
                  <p className="font-medium">{recipient.medicalCondition || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Hospital Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-bloodlink-red" />
                Hospital Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-gray-500">Name</Label>
                  <p className="font-medium">{hospital.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Location</Label>
                  <p className="font-medium">{hospital.location}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Contact</Label>
                  <p className="font-medium">{hospital.phone}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Available Blood Types</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hospital.availableBloodTypes.map((type) => (
                      <span key={type} className="px-2 py-1 bg-bloodlink-pink text-bloodlink-red rounded-md text-xs font-medium">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Match Details and Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
            <CardDescription>Review and approve this blood donation match</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Compatibility</Label>
                <p className="font-medium text-green-500">Compatible</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Recommended Date</Label>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Notes</Label>
                <p className="text-gray-700">This match was automatically generated based on blood type compatibility and recipient urgency.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleRejectMatch}>
              Reject Match
            </Button>
            <Button className="bg-bloodlink-red hover:bg-bloodlink-red/80" onClick={handleApproveMatch}>
              Approve Match
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ViewMatch;
