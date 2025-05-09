
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockDbService } from '@/services/mockDbService';
import { Donor, Recipient, BloodType } from '@/types';
import { User, Heart, Droplet, Calendar, Shield, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<Donor | Recipient | any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Handle admin profile differently
        if (user.role === 'admin') {
          setProfileData({
            id: user.id,
            name: user.name,
            email: user.email,
            role: 'admin',
            department: 'Blood Bank Management',
            phone: formData.phone || '', // Default empty if not set yet
            accessLevel: 'Full Access',
            joinDate: user.createdAt
          });
          setFormData({
            name: user.name,
            email: user.email,
            phone: '',
            department: 'Blood Bank Management',
            accessLevel: 'Full Access',
          });
        } 
        else if (user.role === 'donor') {
          const donors = await mockDbService.getDonors();
          const donor = donors.find(d => d.userId === user.id) || null;
          setProfileData(donor);
          if (donor) {
            setFormData({ ...donor });
          }
        } 
        else if (user.role === 'recipient') {
          const recipients = await mockDbService.getRecipients();
          const recipient = recipients.find(r => r.userId === user.id) || null;
          setProfileData(recipient);
          if (recipient) {
            setFormData({ ...recipient });
          }
        }
        else if (user.role === 'hospital') {
          // Handle hospital profile
          const hospitals = await mockDbService.getHospitals();
          const hospital = hospitals.find(h => h.id === user.id) || null;
          setProfileData(hospital || {
            id: user.id,
            name: user.name,
            location: '',
            phone: '',
          });
          setFormData(hospital || {
            name: user.name,
            location: '',
            phone: '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'isAvailable') {
      setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData) return;
    
    try {
      if (user?.role === 'admin') {
        // Update admin profile - for admin we just update the local state
        // and potentially store in localStorage since we're using mock data
        setProfileData(prev => ({ ...prev, ...formData }));
        // Update user name if changed
        if (formData.name !== user.name) {
          await mockDbService.updateUser(user.id, { name: formData.name });
        }
        toast.success('Admin profile updated successfully');
      }
      else if (user?.role === 'donor') {
        await mockDbService.updateDonor(profileData.id, formData);
        setProfileData(prev => ({ ...prev!, ...formData }));
      } 
      else if (user?.role === 'recipient') {
        await mockDbService.updateRecipient(profileData.id, formData);
        setProfileData(prev => ({ ...prev!, ...formData }));
      }
      else if (user?.role === 'hospital') {
        await mockDbService.updateHospital(profileData.id, formData);
        setProfileData(prev => ({ ...prev!, ...formData }));
      }
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCompleteProfile = () => {
    setIsEditing(true);
    toast.info('Please fill in your profile information and save');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Please log in to view your profile</p>
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
            
            <Card className="md:col-span-4 lg:col-span-3">
              <CardHeader>
                <div className="flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-bloodlink-red/20 flex items-center justify-center">
                    <User className="h-12 w-12 text-bloodlink-red" />
                  </div>
                </div>
                <CardTitle className="text-center mt-2">{user.name}</CardTitle>
                <CardDescription className="text-center">
                  {user.role === 'admin' ? 'Administrator' : 
                   user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {user.role === 'admin' ? (
                    <>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Shield className="h-5 w-5 text-bloodlink-red" />
                        <span>Administrator since {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="h-5 w-5 text-bloodlink-red" />
                        <span>{user.email}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Heart className="h-5 w-5 text-bloodlink-red" />
                      <span>{user.role === 'donor' ? 'Donor since' : 
                             user.role === 'recipient' ? 'Recipient since' : 
                             user.role === 'hospital' ? 'Hospital since' : ''} {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {user.role === 'donor' && profileData && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-5 w-5 text-bloodlink-red" />
                      <span>
                        {(profileData as Donor).lastDonationDate 
                          ? `Last donation: ${new Date((profileData as Donor).lastDonationDate!).toLocaleDateString()}`
                          : 'No donations yet'}
                      </span>
                    </div>
                  )}
                  
                  {profileData && profileData.bloodType && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Droplet className="h-5 w-5 text-bloodlink-red" />
                      <span>Blood Type: {profileData.bloodType}</span>
                    </div>
                  )}

                  {profileData && profileData.phone && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-5 w-5 text-bloodlink-red" />
                      <span>Phone: {profileData.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </Button>
              </CardFooter>
            </Card>
            
            <div className="md:col-span-8 lg:col-span-9">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-bloodlink-red border-t-transparent"></div>
                    </div>
                  ) : !profileData ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Profile data not found. Please complete your profile.</p>
                      <Button 
                        className="mt-4 bg-bloodlink-red hover:bg-bloodlink-red/80"
                        onClick={handleCompleteProfile}
                      >
                        Complete Profile
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">
                            Full Name
                          </label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        {/* Admin-specific fields */}
                        {user.role === 'admin' && (
                          <>
                            <div className="space-y-2">
                              <label htmlFor="department" className="text-sm font-medium">
                                Department
                              </label>
                              <Input
                                id="department"
                                name="department"
                                value={formData.department || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="phone" className="text-sm font-medium">
                                Phone Number
                              </label>
                              <Input
                                id="phone"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                              />
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="email" className="text-sm font-medium">
                                Email
                              </label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email || user.email}
                                onChange={handleInputChange}
                                disabled={true}  // Admin email is not editable
                              />
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="accessLevel" className="text-sm font-medium">
                                Access Level
                              </label>
                              <Input
                                id="accessLevel"
                                name="accessLevel"
                                value={formData.accessLevel || ''}
                                disabled={true}  // Access level is not editable
                              />
                            </div>
                          </>
                        )}
                        
                        {/* Donor-specific fields */}
                        {user.role === 'donor' && (
                          <>
                            <div className="space-y-2">
                              <label htmlFor="age" className="text-sm font-medium">
                                Age
                              </label>
                              <Input
                                id="age"
                                name="age"
                                type="number"
                                value={formData.age || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="bloodType" className="text-sm font-medium">
                                Blood Type
                              </label>
                              {isEditing ? (
                                <Select
                                  value={formData.bloodType || ''}
                                  onValueChange={(value) => handleSelectChange('bloodType', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select blood type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={formData.bloodType || ''}
                                  disabled
                                />
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="phone" className="text-sm font-medium">
                                Phone Number
                              </label>
                              <Input
                                id="phone"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="email" className="text-sm font-medium">
                                Email
                              </label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email || user.email}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="isAvailable" className="text-sm font-medium">
                                Availability
                              </label>
                              {isEditing ? (
                                <Select
                                  value={formData.isAvailable ? 'true' : 'false'}
                                  onValueChange={(value) => handleSelectChange('isAvailable', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select availability" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="true">Available</SelectItem>
                                    <SelectItem value="false">Not Available</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={formData.isAvailable ? 'Available' : 'Not Available'}
                                  disabled
                                />
                              )}
                            </div>
                          </>
                        )}
                        
                        {/* Recipient-specific fields */}
                        {user.role === 'recipient' && (
                          <>
                            <div className="space-y-2">
                              <label htmlFor="bloodType" className="text-sm font-medium">
                                Blood Type
                              </label>
                              {isEditing ? (
                                <Select
                                  value={formData.bloodType || ''}
                                  onValueChange={(value) => handleSelectChange('bloodType', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select blood type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={formData.bloodType || ''}
                                  disabled
                                />
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="phone" className="text-sm font-medium">
                                Phone Number
                              </label>
                              <Input
                                id="phone"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="email" className="text-sm font-medium">
                                Email
                              </label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email || user.email}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="urgency" className="text-sm font-medium">
                                Urgency
                              </label>
                              {isEditing ? (
                                <Select
                                  value={formData.urgency || ''}
                                  onValueChange={(value) => handleSelectChange('urgency', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select urgency" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={(formData.urgency || '').charAt(0).toUpperCase() + (formData.urgency || '').slice(1)}
                                  disabled
                                />
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="preferredHospital" className="text-sm font-medium">
                                Preferred Hospital
                              </label>
                              <Input
                                id="preferredHospital"
                                name="preferredHospital"
                                value={formData.preferredHospital || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                              />
                            </div>
                          </>
                        )}
                        
                        {/* Hospital-specific fields */}
                        {user.role === 'hospital' && (
                          <>
                            <div className="space-y-2">
                              <label htmlFor="location" className="text-sm font-medium">
                                Location
                              </label>
                              <Input
                                id="location"
                                name="location"
                                value={formData.location || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="phone" className="text-sm font-medium">
                                Phone Number
                              </label>
                              <Input
                                id="phone"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                              />
                            </div>
                          </>
                        )}
                      </div>
                      
                      {isEditing && (
                        <Button 
                          type="submit" 
                          className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80"
                        >
                          Save Changes
                        </Button>
                      )}
                    </form>
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

export default Profile;
