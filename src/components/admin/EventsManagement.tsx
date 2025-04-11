
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  location: string;
  date: Date;
  participants: number;
}

interface EventsManagementProps {
  events: Event[];
}

const EventsManagement: React.FC<EventsManagementProps> = ({ events }) => {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  
  const toggleExpand = (id: string) => {
    setExpandedEvent(expandedEvent === id ? null : id);
  };
  
  const handleCreateEvent = () => {
    toast.success("This would open an event creation form");
  };
  
  const handleEditEvent = (id: string) => {
    toast.info(`Editing event ${id}`);
  };
  
  const handleDeleteEvent = (id: string) => {
    toast.info(`Deleting event ${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Upcoming Events</h2>
        <Button 
          onClick={handleCreateEvent}
          className="bg-bloodlink-red hover:bg-bloodlink-red/80"
        >
          Create Event
        </Button>
      </div>
      
      {events.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No upcoming events</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-bloodlink-pink to-bloodlink-darkpink">
                <CardTitle className="flex justify-between">
                  <span>{event.title}</span>
                  <span className="text-sm font-normal">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.participants} participants</span>
                  </div>
                  
                  {expandedEvent === event.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-600 mb-4">
                        This is additional information about the event that would be shown when expanded.
                        In a real application, this would contain the full event description and details.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={() => toggleExpand(event.id)}>
                      {expandedEvent === event.id ? 'Show Less' : 'Show More'}
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditEvent(event.id)}>
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsManagement;
