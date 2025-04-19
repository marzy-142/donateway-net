
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types';
import { CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { format } from 'date-fns';

interface AppointmentsManagementProps {
  appointments: Appointment[];
  onUpdateStatus: (appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled') => void;
}

const AppointmentsManagement: React.FC<AppointmentsManagementProps> = ({ 
  appointments, 
  onUpdateStatus 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = (
      appointment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filterStatus) {
      return matchesSearch && appointment.status === filterStatus;
    }
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appointment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setFilterStatus(null)}
                className={!filterStatus ? 'bg-gray-100' : ''}
              >
                All
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setFilterStatus('scheduled')}
                className={filterStatus === 'scheduled' ? 'bg-yellow-100' : ''}
              >
                Scheduled
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setFilterStatus('completed')}
                className={filterStatus === 'completed' ? 'bg-green-100' : ''}
              >
                Completed
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setFilterStatus('cancelled')}
                className={filterStatus === 'cancelled' ? 'bg-red-100' : ''}
              >
                Cancelled
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold">Donor:</span> {appointment.userName}
                        </div>
                        <div>
                          <span className="font-semibold">Hospital:</span> {appointment.hospitalName}
                        </div>
                        <div>
                          <span className="font-semibold">Date:</span> {format(new Date(appointment.date), 'PPP')}
                        </div>
                        <div>
                          <span className="font-semibold">Time:</span> {appointment.timeSlot}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 items-end">
                        {getStatusBadge(appointment.status)}
                        
                        {appointment.status === 'scheduled' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-green-500 text-green-700 hover:bg-green-50"
                              onClick={() => onUpdateStatus(appointment.id, 'completed')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-700 hover:bg-red-50"
                              onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                No appointments found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentsManagement;
