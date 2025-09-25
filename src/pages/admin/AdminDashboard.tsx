import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Settings, Users, CreditCard, MessageSquare, BarChart3, Download, Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import Papa from "papaparse";

interface EPin {
  id: string;
  code: string;
  used: boolean;
  usedBy?: string;
  generatedAt: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [epinQuantity, setEpinQuantity] = useState(10);
  const [generatedEPins, setGeneratedEPins] = useState<EPin[]>([]);

  if (!user || user.username !== 'admin') return null;

  // Generate unique e-pin codes
  const generateEPinCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `BW${result}`;
  };

  // Generate batch of e-pins
  const handleGenerateEPins = () => {
    const newEPins: EPin[] = [];
    
    for (let i = 0; i < epinQuantity; i++) {
      newEPins.push({
        id: Date.now().toString() + i,
        code: generateEPinCode(),
        used: false,
        generatedAt: new Date().toISOString()
      });
    }
    
    // Get existing e-pins from localStorage
    const existingEPins = JSON.parse(localStorage.getItem('epins') || '[]');
    const allEPins = [...existingEPins, ...newEPins];
    
    // Save to localStorage
    localStorage.setItem('epins', JSON.stringify(allEPins));
    setGeneratedEPins(allEPins);
    
    toast.success(`Successfully generated ${epinQuantity} e-pins`);
  };

  // Download e-pins as CSV
  const handleDownloadCSV = () => {
    const epins = JSON.parse(localStorage.getItem('epins') || '[]');
    
    if (epins.length === 0) {
      toast.error('No e-pins available for download');
      return;
    }

    const csvData = epins.map((epin: EPin) => ({
      'E-Pin Code': epin.code,
      'Status': epin.used ? 'Used' : 'Available',
      'Used By': epin.usedBy || 'N/A',
      'Generated Date': new Date(epin.generatedAt).toLocaleDateString('en-ZA')
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `epins_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    toast.success('E-pins downloaded successfully');
  };

  // Load e-pins on component mount
  React.useEffect(() => {
    const epins = JSON.parse(localStorage.getItem('epins') || '[]');
    setGeneratedEPins(epins);
  }, []);

  const totalEPins = generatedEPins.length;
  const usedEPins = generatedEPins.filter(epin => epin.used).length;
  const availableEPins = totalEPins - usedEPins;

  if (!user || user.username !== 'admin') return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <Badge variant="destructive">Administrator</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R0</div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-Pins Available</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableEPins}</div>
            <p className="text-xs text-muted-foreground">Unused e-pins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-Pins Used</CardTitle>
            <CreditCard className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usedEPins}</div>
            <p className="text-xs text-muted-foreground">Used e-pins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Broadcast messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>E-Pin Management</CardTitle>
            <CardDescription>Generate and manage e-pins for user registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="quantity">Number of E-Pins to Generate</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="1000"
                  value={epinQuantity}
                  onChange={(e) => setEpinQuantity(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleGenerateEPins} className="whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                Generate E-Pins
              </Button>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Total E-Pins: {totalEPins} | Available: {availableEPins} | Used: {usedEPins}
              </div>
              <Button 
                variant="outline" 
                onClick={handleDownloadCSV}
                disabled={totalEPins === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>System Status</span>
                <Badge className="bg-green-500">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Database</span>
                <Badge className="bg-green-500">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>E-Pin System</span>
                <Badge className="bg-green-500">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;