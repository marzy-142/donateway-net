import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hospital, BloodType } from '@/types';
import { MapPin, Phone, Droplet, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockDbService } from '@/services/mockDbService';

interface HospitalManagementProps {
  hospitals: Hospital[];
}

const HospitalManagement: React.FC<HospitalManagementProps> = ({ hospitals: initialHospitals }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    bloodTypes: '',
  });

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const fetchedHospitals = await mockDbService.getHospitals();
        setHospitals(fetchedHospitals);
      } catch (error) {
        console.error('Error loading hospitals:', error);
        toast.error('Failed to load hospitals');
      } finally {
        setIsLoading(false);
      }
    };
    loadHospitals();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bloodlink-red"></div>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      phone: '',
      bloodTypes: '',
    });
    setSelectedHospital(null);
  };

  const handleAddHospital = async () => {
    try {
      const bloodTypesList = formData.bloodTypes.split(',')
        .map(type => type.trim())
        .filter((type): type is BloodType => {
          const validTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as BloodType[];
          return validTypes.includes(type as BloodType);
        });

      const newHospital = await mockDbService.createHospital({
        name: formData.name,
        location: formData.location,
        phone: formData.phone,
        bloodTypes: bloodTypesList,
      });

      setHospitals([...hospitals, newHospital]);
      toast.success("Hospital added successfully");
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Error adding hospital");
    }
  };
  
  const handleEditHospital = async () => {
    if (!selectedHospital) return;

    try {
      const bloodTypesList = formData.bloodTypes.split(',')
        .map(type => type.trim())
        .filter((type): type is BloodType => {
          const validTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as BloodType[];
          return validTypes.includes(type as BloodType);
        });

      const updatedHospital = await mockDbService.updateHospital(selectedHospital.id, {
        name: formData.name,
        location: formData.location,
        phone: formData.phone,
        bloodTypes: bloodTypesList,
      });

      setHospitals(hospitals.map(h => 
        h.id === selectedHospital.id ? updatedHospital : h
      ));
      toast.success("Hospital updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Error updating hospital");
    }
  };
  
  const handleRemoveHospital = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this hospital?')) {
      try {
        await mockDbService.deleteHospital(id);
        setHospitals(hospitals.filter(h => h.id !== id));
        toast.success("Hospital removed successfully");
      } catch (error) {
        toast.error("Error removing hospital");
      }
    }
  };

  const openEditDialog = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setFormData({
      name: hospital.name,
      location: hospital.location,
      phone: hospital.phone,
      bloodTypes: hospital.bloodTypes.join(', '),
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hospital Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-bloodlink-red hover:bg-bloodlink-red/80">
              Add Hospital
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Hospital</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Hospital Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bloodTypes">Blood Types (comma-separated)</Label>
                <Input
                  id="bloodTypes"
                  value={formData.bloodTypes}
                  onChange={(e) => setFormData({ ...formData, bloodTypes: e.target.value })}
                  placeholder="A+, A-, B+, B-, O+, O-, AB+, AB-"
                />
              </div>
              <Button 
                className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80"
                onClick={handleAddHospital}
              >
                Add Hospital
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => (
          <Card key={hospital.id}>
            <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
              <CardTitle>{hospital.name || 'Unnamed Hospital'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{hospital.location || 'No location specified'}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{hospital.phone || 'No phone specified'}</span>
                </div>
                <div className="flex items-center">
                  <Droplet className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{hospital.bloodTypes?.join(', ') || 'No blood types specified'}</span>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(hospital)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleRemoveHospital(hospital.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hospital</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Hospital Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-bloodTypes">Blood Types (comma-separated)</Label>
              <Input
                id="edit-bloodTypes"
                value={formData.bloodTypes}
                onChange={(e) => setFormData({ ...formData, bloodTypes: e.target.value })}
                placeholder="A+, A-, B+, B-, O+, O-, AB+, AB-"
              />
            </div>
            <Button 
              className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80"
              onClick={handleEditHospital}
            >
              Update Hospital
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HospitalManagement;
