import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Calendar, AlertTriangle } from "lucide-react";
import { mockDbService } from "@/services/mockDbService";
import { format } from "date-fns";

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "critical";
  createdAt: Date;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
}

const UserDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, these would come from your backend
        // For now, we'll use mock data
        const mockAlerts: SystemAlert[] = [
          {
            id: "1",
            title: "Blood Supply Alert",
            message: "Urgent need for O- blood type donors",
            type: "critical",
            createdAt: new Date(),
          },
          {
            id: "2",
            title: "System Maintenance",
            message: "Scheduled maintenance on Saturday, 2:00 AM - 4:00 AM",
            type: "info",
            createdAt: new Date(),
          },
        ];

        const mockEvents: Event[] = [
          {
            id: "1",
            title: "Community Blood Drive",
            description: "Annual community blood donation event",
            date: new Date("2024-04-15"),
            location: "City Hall",
          },
          {
            id: "2",
            title: "Donor Appreciation Day",
            description: "Celebrating our regular donors",
            date: new Date("2024-05-20"),
            location: "Community Center",
          },
        ];

        setAlerts(mockAlerts);
        setEvents(mockEvents);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAlertIcon = (type: SystemAlert["type"]) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={alert.type === "critical" ? "destructive" : "default"}
            >
              <div className="flex items-center gap-2">
                {getAlertIcon(alert.type)}
                <AlertTitle>{alert.title}</AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                {alert.message}
              </AlertDescription>
              <div className="text-xs text-muted-foreground mt-2">
                {format(alert.createdAt, "PPP")}
              </div>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>
              <div className="mt-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(event.date, "PPP")}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {event.location}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
