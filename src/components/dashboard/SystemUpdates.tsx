import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/adminService";
import { SystemAlert, Event } from "@/types";
import { AlertTriangle, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface SystemUpdatesProps {
  userRole: "donor" | "recipient";
}

const SystemUpdates: React.FC<SystemUpdatesProps> = ({ userRole }) => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const [alertsData, eventsData] = await Promise.all([
          adminService.getSystemAlerts(),
          adminService.getUpcomingEvents(),
        ]);
        setAlerts(alertsData);
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching updates:", error);
        toast.error("Failed to load system updates");
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* System Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-bloodlink-red" />
              System Alerts
            </CardTitle>
            <CardDescription>
              Important updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(
                    alert.severity
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{alert.title}</h4>
                      <p className="text-sm mt-1">{alert.message}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={getSeverityColor(alert.severity)}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-bloodlink-red" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Blood donation drives and community events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-white rounded-lg border border-gray-100 hover:border-bloodlink-red/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(event.date), "PPP")}
                        </div>
                        <div className="text-sm text-gray-500">
                          📍 {event.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  {userRole === "donor" && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() =>
                        toast.info("Event registration coming soon!")
                      }
                    >
                      Register Interest
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemUpdates;
