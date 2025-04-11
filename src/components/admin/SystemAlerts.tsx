
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  date: Date;
}

interface SystemAlertsProps {
  alerts: Alert[];
}

const SystemAlerts: React.FC<SystemAlertsProps> = ({ alerts }) => {
  // Function to render the appropriate icon based on alert type
  const renderIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  // Function to render the appropriate badge based on alert type
  const renderBadge = (type: string) => {
    switch (type) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500">Warning</Badge>;
      case 'info':
        return <Badge variant="outline">Info</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Alerts</h2>
      
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No alerts at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`
              ${alert.type === 'critical' ? 'border-red-300' : ''}
              ${alert.type === 'warning' ? 'border-amber-300' : ''}
            `}>
              <CardContent className="pt-6 flex items-start">
                <div className="mr-3 mt-0.5">
                  {renderIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">
                      {renderBadge(alert.type)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(alert.date).toLocaleString()}
                    </div>
                  </div>
                  <p className="mt-2">{alert.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SystemAlerts;
