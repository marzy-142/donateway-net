
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, AlertCircle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  date: Date;
}

interface SystemAlertsProps {
  alerts: Alert[];
}

const SystemAlerts: React.FC<SystemAlertsProps> = ({ alerts: initialAlerts }) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [showNewAlertForm, setShowNewAlertForm] = useState(false);
  const [newAlert, setNewAlert] = useState<{
    type: 'critical' | 'warning' | 'info';
    message: string;
  }>({
    type: 'info',
    message: '',
  });

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

  const handleAddAlert = () => {
    if (!newAlert.message.trim()) {
      toast.error("Alert message cannot be empty");
      return;
    }

    const alert: Alert = {
      id: `alert-${Date.now()}`,
      type: newAlert.type,
      message: newAlert.message,
      date: new Date(),
    };

    setAlerts([alert, ...alerts]);
    setNewAlert({ type: 'info', message: '' });
    setShowNewAlertForm(false);
    toast.success("New alert added successfully");
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast.success("Alert dismissed");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Alerts</h2>
        <Button 
          onClick={() => setShowNewAlertForm(!showNewAlertForm)}
          className="bg-bloodlink-red hover:bg-bloodlink-red/80"
        >
          {showNewAlertForm ? 'Cancel' : 'Add New Alert'}
        </Button>
      </div>
      
      {showNewAlertForm && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="text-lg">Create New Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Alert Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="alertType"
                      checked={newAlert.type === 'info'}
                      onChange={() => setNewAlert({ ...newAlert, type: 'info' })}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <Info className="h-4 w-4 text-blue-500 mr-1" /> Info
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="alertType"
                      checked={newAlert.type === 'warning'}
                      onChange={() => setNewAlert({ ...newAlert, type: 'warning' })}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" /> Warning
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="alertType"
                      checked={newAlert.type === 'critical'}
                      onChange={() => setNewAlert({ ...newAlert, type: 'critical' })}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-1" /> Critical
                    </span>
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="alertMessage" className="block text-sm font-medium mb-1">Alert Message</label>
                <textarea
                  id="alertMessage"
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter alert message here..."
                />
              </div>
              
              <Button 
                onClick={handleAddAlert}
                className="bg-bloodlink-red hover:bg-bloodlink-red/80"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 py-8">No alerts at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`
              ${alert.type === 'critical' ? 'border-red-300 bg-red-50' : ''}
              ${alert.type === 'warning' ? 'border-amber-300 bg-amber-50' : ''}
              ${alert.type === 'info' ? 'border-blue-300 bg-blue-50' : ''}
              relative
            `}>
              <div className="absolute top-4 right-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDismissAlert(alert.id)} 
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="pt-6 flex items-start">
                <div className="mr-3 mt-0.5">
                  {renderIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
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
