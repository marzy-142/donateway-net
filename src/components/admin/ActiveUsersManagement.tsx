import React, { useState, useEffect } from "react";
import { mockDbService } from "@/services/mockDbService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Donor, Recipient } from "@/types";

const ActiveUsersManagement: React.FC = () => {
  const [activeDonors, setActiveDonors] = useState<Donor[]>([]);
  const [activeRecipients, setActiveRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const donors = await mockDbService.getDonors();
        const recipients = await mockDbService.getRecipients();
        const referrals = await mockDbService.getReferrals();
        
        // Filter active donors (those who have completed their profile)
        setActiveDonors(donors.filter(donor => donor.isAvailable));
        
        // Get IDs of recipients who have completed or cancelled referrals
        const inactiveRecipientIds = new Set(
          referrals
            .filter(ref => ref.status === "completed" || ref.status === "cancelled")
            .map(ref => ref.recipientId)
        );
        
        // A recipient is active if they:
        // 1. Have no referrals (newly registered)
        // 2. Have only pending or scheduled referrals
        setActiveRecipients(recipients.filter(recipient => 
          !inactiveRecipientIds.has(recipient.id)
        ));
      } catch (error) {
        console.error("Error fetching active users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveUsers();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Users Management</CardTitle>
        <CardDescription>
          View and manage active donors and recipients in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="donors">
          <TabsList className="w-full">
            <TabsTrigger value="donors" className="w-1/2">
              Active Donors ({activeDonors.length})
            </TabsTrigger>
            <TabsTrigger value="recipients" className="w-1/2">
              Active Recipients ({activeRecipients.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="donors">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeDonors.map((donor) => (
                  <TableRow key={donor.id}>
                    <TableCell>{donor.name}</TableCell>
                    <TableCell>{donor.bloodType}</TableCell>
                    <TableCell>{donor.age}</TableCell>
                    <TableCell>{donor.phone}</TableCell>
                    <TableCell>{donor.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="recipients">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Urgency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeRecipients.map((recipient) => (
                  <TableRow key={recipient.id}>
                    <TableCell>{recipient.name}</TableCell>
                    <TableCell>{recipient.bloodType}</TableCell>
                    <TableCell>{recipient.phone}</TableCell>
                    <TableCell>{recipient.hospitalName || 'Not specified'}</TableCell>
                    <TableCell>{recipient.urgency || 'Normal'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ActiveUsersManagement;
