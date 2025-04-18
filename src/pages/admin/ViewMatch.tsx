
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { mockDbService } from '@/services/mockDbService';
import { adminService } from '@/services/adminService';
import { Donor, Recipient, Hospital } from '@/types';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Droplet, UserRound, Building2, Calendar, Activity, ArrowLeft, Check, X } from 'lucide-react';

const ViewMatch: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  
  useEffect(() => {
    const fetchMatchData = async () => {
      if (!matchId) return;
      
      setLoading(true);
      try {
        // Parse the matchId to extract donor and recipient IDs
        const [donorId, recipientId] = matchId.split('-').slice(1, 3);
        
        // Fetch donor and recipient data
        const donorData = await mockDbService.getDonorById(donorId);
        setDonor(donorData || null);
        
        const recipientData = await mockDbService.getRecipientById(recipientId);
        setRecipient(recipientData || null);
        
        // Fetch all hospitals
        const hospitalsData = await mockDbService.getHospitals();
        setHospitals(hospitalsData);
        
        if (hospitalsData.length > 0) {
          setSelectedHospitalId(hospitalsData[0].id);
          setHospital(hospitalsData[0]);
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
  
  const handleHospitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hospitalId = e.target.value;
    setSelectedHospitalId(hospitalId);
    
    const selectedHospital = hospitals.find(h => h.id === hospitalId);
    if (selectedHospital) {
      setHospital(selectedHospital);
    }
  };
  
  const handleCreateReferral = async () => {
    if (!donor || !recipient || !selectedHospitalId) {
      toast.error('Missing required information');
      return;
    }
    
    setCreating(true);
    try {
      await adminService.createReferral(donor.id, recipient.id, selectedHospitalId);
      toast.success('Referral created successfully');
      navigate('/referrals');
    } catch (error) {
      console.error('Error creating referral:', error);
      toast.error(`Failed to create referral: ${(error as Error).message}`);
    } finally {
      setCreating(false);
    }
  };
  
  const handleRejectMatch = () => {
    toast.info('Match rejected');
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
  
  if (!donor || !recipient) {
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
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Matches
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Check blood compatibility
  const isCompatible = adminService.isBloodCompatible(donor.bloodType, recipient.bloodType);
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/matches')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
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
          
          {/* Hospital Selection */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-bloodlink-red" />
                Hospital Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hospital" className="text-sm text-gray-500">Select Hospital</Label>
                  <select 
                    id="hospital"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    value={selectedHospitalId}
                    onChange={handleHospitalChange}
                  >
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.name} - {h.location}
                      </option>
                    ))}
                  </select>
                </div>
                
                {hospital && (
                  <div className="space-y-2">
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
                          <span 
                            key={type} 
                            className={`px-2 py-1 rounded-md text-xs font-medium ${
                              type === donor.bloodType ? 
                              'bg-green-100 text-green-700' : 
                              'bg-bloodlink-pink text-bloodlink-red'
                            }`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
                <Label className="text-sm text-gray-500">Blood Compatibility</Label>
                {isCompatible ? (
                  <p className="font-medium text-green-500 flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    Compatible - {donor.bloodType} can donate to {recipient.bloodType}
                  </p>
                ) : (
                  <p className="font-medium text-red-500 flex items-center">
                    <X className="h-4 w-4 mr-2" />
                    Incompatible - {donor.bloodType} cannot donate to {recipient.bloodType}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm text-gray-500">Compatibility Score</Label>
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-bloodlink-red h-2.5 rounded-full" 
                      style={{ width: `${adminService.calculateCompatibilityScore(donor, recipient)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1 text-gray-600">
                    {adminService.calculateCompatibilityScore(donor, recipient)}% match
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Recommended Date</Label>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Notes</Label>
                <p className="text-gray-700">
                  {recipient.urgency === 'critical' ? 
                    'Critical urgency - immediate attention required!' : 
                    'This match was automatically generated based on blood type compatibility and recipient urgency.'}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleRejectMatch} disabled={creating}>
              <X className="h-4 w-4 mr-2" />
              Reject Match
            </Button>
            <Button 
              className="bg-bloodlink-red hover:bg-bloodlink-red/80" 
              onClick={handleCreateReferral} 
              disabled={!isCompatible || creating}
            >
              {creating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Referral
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ViewMatch;
