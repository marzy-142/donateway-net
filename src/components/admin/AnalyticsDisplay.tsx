
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BloodType } from '@/types';

interface AnalyticsProps {
  stats: {
    activeDonors: number;
    activeRecipients: number;
    pendingMatches: number;
    completedDonations: number;
    totalHospitals: number;
  };
  bloodTypeDistribution: Record<BloodType, number>;
  monthlyDonations: Array<{ month: string; donations: number }>;
}

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8CC152', '#F44336'];

const AnalyticsDisplay: React.FC<AnalyticsProps> = ({ stats, bloodTypeDistribution, monthlyDonations }) => {
  const pieData = Object.entries(bloodTypeDistribution).map(([name, value], index) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Donations Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Donations</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyDonations}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="donations" fill="#FF6384" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Blood Type Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Blood Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional stats can be displayed here */}
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Total records in database: {stats.activeDonors + stats.activeRecipients + stats.totalHospitals}
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDisplay;
