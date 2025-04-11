
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hospital } from '@/types';
import { MapPin, Phone, Droplet } from 'lucide-react';
import { toast } from 'sonner';

interface HospitalManagementProps {
  hospitals: Hospital[];
}

const HospitalManagement: React.FC<HospitalManagementProps> = ({ hospitals }) => {
  const handleAddHospital = () => {
    toast.success("This would open a hospital creation form");
  };
  
  const handleEditHospital = (id: string) => {
    toast.info(`Editing hospital ${id}`);
  };
  
  const handleRemoveHospital = (id: string) => {
    toast.info(`Removing hospital ${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hospital Management</h2>
        <Button 
          className="bg-bloodlink-red hover:bg-bloodlink-red/80"
          onClick={handleAddHospital}
        >
          Add Hospital
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => (
          <Card key={hospital.id}>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle>{hospital.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{hospital.location}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{hospital.phone}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Droplet className="h-4 w-4 mr-2 text-bloodlink-red" />
                    <span className="font-medium">Available Blood Types:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {hospital.availableBloodTypes.map((type) => (
                      <span 
                        key={type} 
                        className="px-2 py-1 bg-bloodlink-pink text-bloodlink-red rounded-md text-xs font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditHospital(hospital.id)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleRemoveHospital(hospital.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HospitalManagement;
