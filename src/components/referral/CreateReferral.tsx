import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockDbService } from '@/services/mockDbService';
import { emailService } from '@/services/emailService';
import { toast } from 'sonner';
import { Hospital, Donor, Recipient } from '@/types';

interface CreateReferralProps {
  donor: Donor;
  recipient: Recipient;
  onSuccess?: () => void;
}

export const CreateReferral: React.FC<CreateReferralProps> = ({
  donor,
  recipient,
  onSuccess
}) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const loadHospitals = async () => {
      try {
        const fetchedHospitals = await mockDbService.getHospitals();
        setHospitals(fetchedHospitals);
      } catch (error) {
        console.error('Error loading hospitals:', error);
        toast.error('Failed to load hospitals');
      }
    };
    loadHospitals();
  }, []);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospital || !date || !timeSlot) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Create the referral
      const referral = await mockDbService.createReferral({
        donorId: donor.id,
        recipientId: recipient.id,
        hospitalId: selectedHospital,
        status: 'pending',
        appointmentDate: date,
        timeSlot,
        additionalNotes
      });

      // Get hospital details
      const hospital = hospitals.find(h => h.id === selectedHospital);
      if (!hospital) throw new Error('Hospital not found');

      // Send email notifications
      await Promise.all([
        // Notify donor
        emailService.sendReferralNotification({
          to: donor.email,
          donorName: donor.name,
          recipientName: recipient.name,
          hospitalName: hospital.name,
          bloodType: recipient.bloodType,
          urgencyLevel: recipient.urgencyLevel,
          appointmentDate: `${format(date, 'PPP')} at ${timeSlot}`,
          additionalNotes
        }),
        // Notify recipient
        emailService.sendReferralNotification({
          to: recipient.email,
          donorName: donor.name,
          recipientName: recipient.name,
          hospitalName: hospital.name,
          bloodType: recipient.bloodType,
          urgencyLevel: recipient.urgencyLevel,
          appointmentDate: `${format(date, 'PPP')} at ${timeSlot}`,
          additionalNotes
        })
      ]);

      toast.success('Referral created successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating referral:', error);
      toast.error('Failed to create referral');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Donation Referral</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Donor Information</Label>
            <div className="bg-gray-50 p-3 rounded-md">
              <p><strong>Name:</strong> {donor.name}</p>
              <p><strong>Blood Type:</strong> {donor.bloodType}</p>
              <p><strong>Last Donation:</strong> {donor.lastDonationDate ? format(new Date(donor.lastDonationDate), 'PPP') : 'Never'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recipient Information</Label>
            <div className="bg-gray-50 p-3 rounded-md">
              <p><strong>Name:</strong> {recipient.name}</p>
              <p><strong>Blood Type Needed:</strong> {recipient.bloodType}</p>
              <p><strong>Urgency Level:</strong> {recipient.urgencyLevel}</p>
              <p><strong>Hospital:</strong> {recipient.hospitalName}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospital">Select Hospital</Label>
            <Select value={selectedHospital} onValueChange={setSelectedHospital}>
              <SelectTrigger>
                <SelectValue placeholder="Select a hospital" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preferred Appointment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeSlot">Preferred Time Slot</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time slot" />
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

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements or information..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Referral...' : 'Create Referral'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
