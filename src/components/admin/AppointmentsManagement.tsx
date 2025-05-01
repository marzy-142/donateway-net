import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/types";
import { CheckCircle, XCircle, Clock, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { mockDbService } from "@/services/mockDbService";
import { Donor } from "@/types";
import { toast } from "sonner";

interface AppointmentsManagementProps {
  appointments: Appointment[];
  onUpdateStatus: (
    appointmentId: string,
    status: "scheduled" | "completed" | "cancelled"
  ) => void;
}

const AppointmentsManagement: React.FC<AppointmentsManagementProps> = ({
  appointments,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const fetchedDonors = await mockDbService.getDonors();
        setDonors(fetchedDonors);
      } catch (error) {
        console.error("Error fetching donors:", error);
        toast.error("Failed to fetch donor data");
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.hospitalName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (filterStatus) {
      return matchesSearch && appointment.status === filterStatus;
    }

    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4 mr-1" />
            Scheduled
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <XCircle className="h-4 w-4 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleStatusUpdate = async (
    appointmentId: string,
    status: "scheduled" | "completed" | "cancelled"
  ) => {
    try {
      await onUpdateStatus(appointmentId, status);
      toast.success(`Appointment status updated to ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update appointment status");
    }
  };

  const getDonorName = (appointment: Appointment) => {
    if (appointment.donorName) {
      return appointment.donorName;
    }

    const donor = donors.find((d) => d.userId === appointment.userId);
    if (donor) {
      return donor.name;
    }

    return appointment.userName || "Not specified";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-bloodlink-red" />
          <p className="text-sm text-gray-500">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Appointment Management
          </CardTitle>
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
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={!filterStatus ? "secondary" : "outline"}
                onClick={() => setFilterStatus(null)}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === "scheduled" ? "secondary" : "outline"}
                onClick={() => setFilterStatus("scheduled")}
                size="sm"
              >
                Scheduled
              </Button>
              <Button
                variant={filterStatus === "completed" ? "secondary" : "outline"}
                onClick={() => setFilterStatus("completed")}
                size="sm"
              >
                Completed
              </Button>
              <Button
                variant={filterStatus === "cancelled" ? "secondary" : "outline"}
                onClick={() => setFilterStatus("cancelled")}
                size="sm"
              >
                Cancelled
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-500">
                            Donor:
                          </span>
                          <span className="font-medium">
                            {getDonorName(appointment)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-500">
                            Hospital:
                          </span>
                          <span>
                            {appointment.hospitalName || "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-500">
                            Date:
                          </span>
                          <span>
                            {appointment.date
                              ? format(new Date(appointment.date), "PPP")
                              : "Not scheduled"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-500">
                            Time:
                          </span>
                          <span>{appointment.timeSlot || "Not specified"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 items-end justify-between">
                        <div>{getStatusBadge(appointment.status)}</div>

                        {appointment.status === "scheduled" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500 text-green-700 hover:bg-green-50"
                              onClick={() =>
                                handleStatusUpdate(appointment.id, "completed")
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-700 hover:bg-red-50"
                              onClick={() =>
                                handleStatusUpdate(appointment.id, "cancelled")
                              }
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
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No appointments found</p>
                <p className="text-gray-400 text-sm">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Appointments will appear here when scheduled"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentsManagement;
