
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BloodType } from '@/types';
import { InfoIcon } from 'lucide-react';

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

// For tooltip formatting
const renderTooltipContent = (props: any) => {
  const { payload } = props;
  if (payload && payload.length > 0) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
        <p className="font-semibold">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const AnalyticsDisplay: React.FC<AnalyticsProps> = ({ stats, bloodTypeDistribution, monthlyDonations }) => {
  const pieData = Object.entries(bloodTypeDistribution).map(([name, value], index) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center text-sm text-gray-500">
          <InfoIcon className="h-4 w-4 mr-1" /> 
          <span>Data last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Total Donors</div>
            <div className="text-2xl font-bold">{stats.activeDonors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Total Recipients</div>
            <div className="text-2xl font-bold">{stats.activeRecipients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Completed Donations</div>
            <div className="text-2xl font-bold">{stats.completedDonations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Active Hospitals</div>
            <div className="text-2xl font-bold">{stats.totalHospitals}</div>
          </CardContent>
        </Card>
      </div>

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
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={renderTooltipContent} />
                <Bar 
                  dataKey="donations" 
                  fill="#FF6384"
                  radius={[4, 4, 0, 0]}
                  label={{ 
                    position: 'top',
                    fontSize: 10,
                    fill: '#666',
                    formatter: (value: number) => value
                  }}
                />
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
                <Tooltip content={renderTooltipContent} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Blood Availability Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                  Abundant
                </span>
                <span>A+, B+, O+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                  Limited
                </span>
                <span>A-, B-</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                  Critical
                </span>
                <span>AB+, AB-, O-</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Efficiency Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Average match time</span>
                  <span className="font-medium">3.2 days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Donation success rate</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Unfilled requests</span>
                  <span className="font-medium">8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional stats for context */}
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Total records in database: {stats.activeDonors + stats.activeRecipients + stats.totalHospitals} | 
          Active donation matches: {stats.pendingMatches} | 
          System health: <span className="text-green-500 font-medium">Good</span>
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDisplay;
