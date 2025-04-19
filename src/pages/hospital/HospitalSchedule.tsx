
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockDbService } from '@/services/mockDbService';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Hospital } from '@/types';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const HospitalSchedule = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchHospital = async () => {
      if (!hospitalId) return;
      try {
        const data = await mockDbService.getHospitalById(hospitalId);
        if (data) {
          setHospital(data);
        } else {
          toast.error("Hospital not found");
          navigate('/hospitals');
        }
      } catch (error) {
        console.error('Error fetching hospital:', error);
        toast.error("Failed to load hospital information");
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, [hospitalId, navigate]);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '01:00 PM', '02:00 PM', '03:00 PM'
  ];

  const handleSchedule = async () => {
    if (!date || !timeSlot || !hospital || !user) {
      toast.error("Please select both date and time");
      return;
    }

    setIsSubmitting(true);
    try {
      await mockDbService.createAppointment({
        hospitalId,
        userId: user.id,
        date: date,
        timeSlot: timeSlot,
        status: 'scheduled'
      });
      
      toast.success(`Appointment scheduled at ${hospital.name} for ${format(date, 'PPP')} at ${timeSlot}`);
      navigate('/donor');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error(error instanceof Error ? error.message : "Failed to schedule appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Donation at {hospital?.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Select Date</h3>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => 
                  date < new Date() || 
                  date > new Date(new Date().setMonth(new Date().getMonth() + 2))
                }
                className="rounded-md border"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Select Time</h3>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSchedule} 
              className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80"
              disabled={!date || !timeSlot || isSubmitting}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Donation'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HospitalSchedule;
