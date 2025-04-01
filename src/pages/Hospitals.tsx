
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hospital } from '@/types';
import { mockDbService } from '@/services/mockDbService';
import { Building2, Phone, MapPin, Droplet } from 'lucide-react';

const Hospitals: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await mockDbService.getHospitals();
        setHospitals(data);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(hospital => 
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSchedule = (hospitalId: string) => {
    navigate(`/hospitals/${hospitalId}/schedule`);
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
                Connecting you with premier healthcare providers across the region
              </p>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border">
              <MapPin className="h-5 w-5 text-bloodlink-red" />
              <span className="text-sm font-medium">Network Expanding</span>
            </div>
          </div>
          
          <div className="max-w-md w-full mx-auto mb-8">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                type="search"
                placeholder="Search for hospitals by name or location"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-bloodlink-red border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredHospitals.map(hospital => (
                <Card key={hospital.id} className="overflow-hidden">
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
                      
                      <div className="flex items-start gap-2">
                        <Phone className="h-5 w-5 text-bloodlink-red shrink-0 mt-0.5" />
                        <span>{hospital.phone}</span>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Droplet className="h-5 w-5 text-bloodlink-red shrink-0 mt-0.5" />
                        <span>
                          Blood Types: {
                            hospital.availableBloodTypes.length === 8 
                              ? "All blood types" 
                              : hospital.availableBloodTypes.join(', ')
                          }
                        </span>
                      </div>
                      
                      <div className="pt-4 flex gap-4">
                        <Button 
                          onClick={() => handleCall(hospital.phone)} 
                          className="flex-1 bg-bloodlink-red hover:bg-bloodlink-red/80"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        
                        <Button 
                          onClick={() => handleSchedule(hospital.id)} 
                          variant="outline" 
                          className="flex-1 border-bloodlink-red text-bloodlink-red hover:bg-bloodlink-red/10"
                        >
                          Schedule
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
