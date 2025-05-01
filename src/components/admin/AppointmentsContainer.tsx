import React, { useState, useEffect } from "react";
import AppointmentsManagement from "./AppointmentsManagement"; // Path to your AppointmentsManagement component

const fetchAppointments = async () => {
  try {
    const response = await fetch("/api/appointments");
    const data = await response.json();
    console.log("Appointments response:", data); // Log the response data here
    setAppointments(data); // Assuming you're using `setAppointments` to update state
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
};
const fetchUsers = async () => {
  const response = await fetch("/api/users");
  const data = await response.json();
  return data;
};

const fetchHospitals = async () => {
  const response = await fetch("/api/hospitals");
  const data = await response.json();
  return data;
};

const AppointmentsContainer = () => {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const appointmentsData = await fetchAppointments();
      const usersData = await fetchUsers();
      const hospitalsData = await fetchHospitals();

      const enrichedAppointments = appointmentsData.map((appointment) => {
        const user = usersData.find((user) => user.id === appointment.userId);
        const hospital = hospitalsData.find(
          (hospital) => hospital.id === appointment.hospitalId
        );

        return {
          ...appointment,
          userName: user?.name || "Unknown Donor",
          hospitalName: hospital?.name || "Unknown Hospital",
          status: appointment.status || "scheduled",
        };
      });

      setAppointments(enrichedAppointments);
      setUsers(usersData);
      setHospitals(hospitalsData);
    };

    loadData();
  }, []);

  const handleUpdateStatus = (
    appointmentId: string,
    status: "scheduled" | "completed" | "cancelled"
  ) => {
    // Handle status update logic
  };

  return (
    <div>
      <AppointmentsManagement
        appointments={appointments}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default AppointmentsContainer;
