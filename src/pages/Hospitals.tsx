import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hospital } from '@/types';
import { mockDbService } from '@/services/mockDbService';
import { Building2, MapPin, Droplet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const Hospitals: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await mockDbService.getHospitals();
        setHospitals(data);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        toast.error("Failed to load hospitals");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBloodType = bloodTypeFilter === 'all' || 
      hospital.availableBloodTypes.includes(bloodTypeFilter as any);
    
    return matchesSearch && matchesBloodType;
  });

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSchedule = (hospitalId: string) => {
    if (!user) {
      toast.error("Please log in to schedule a donation");
      navigate('/login');
      return;
    }
    
    if (user.role !== 'donor') {
      toast.error("Only donors can schedule appointments");
      return;
    }
    
    navigate(`/hospital/${hospitalId}/schedule`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="bg-bloodlink-pink py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-8 w-8 text-bloodlink-red" />
                <h1 className="text-3xl font-bold">Hospital Directory</h1>
              </div>
              <p className="text-gray-600">
                Find and connect with blood donation centers near you
              </p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto mb-8">
            <div className="relative">
              <MapPin className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search hospitals by name or location"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by blood type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Types</SelectItem>
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
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-bloodlink-red border-t-transparent"></div>
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hospitals found matching your criteria</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredHospitals.map(hospital => (
                <Card key={hospital.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-bloodlink-pink pb-2">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Building2 className="h-5 w-5 text-bloodlink-red" />
                      {hospital.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-bloodlink-red shrink-0 mt-0.5" />
                        <span>{hospital.location}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Droplet className="h-5 w-5 text-bloodlink-red" />
                          <span className="font-medium">Available Blood Types</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {hospital.availableBloodTypes.map(type => (
                            <Badge 
                              key={type} 
                              variant="secondary"
                              className="bg-bloodlink-pink text-bloodlink-red"
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button 
                          onClick={() => handleSchedule(hospital.id)}
                          className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80"
                        >
                          Schedule Donation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Hospitals;
