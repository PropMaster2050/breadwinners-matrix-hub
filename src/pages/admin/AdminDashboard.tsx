import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Settings, Users, CreditCard, MessageSquare, BarChart3, Download, Plus, UserCog, Database } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";

interface EPin {
  id: string;
  code: string;
  isUsed: boolean;
  usedBy?: string;
  usedDate?: string;
  generatedAt: string;
}

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [epinQuantity, setEpinQuantity] = useState(10);
  const [generatedEPins, setGeneratedEPins] = useState<EPin[]>([]);
  const [totalMembers, setTotalMembers] = useState<number>(0);

  if (!isAdmin) return null;

  // Generate unique e-pin codes
  const generateEPinCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `BW${result}`;
  };

  // Generate batch of e-pins and save to database
  const handleGenerateEPins = async () => {
    const newEPins = [];
    
    for (let i = 0; i < epinQuantity; i++) {
      newEPins.push({
        code: generateEPinCode(),
        is_used: false,
        generated_at: new Date().toISOString()
      });
    }
    
    try {
      const { data, error } = await supabase
        .from('epins')
        .insert(newEPins)
        .select();
      
      if (error) throw error;
      
      toast.success(`Successfully generated ${epinQuantity} e-pins`);
      loadEPins(); // Reload the list
    } catch (error: any) {
      toast.error(`Failed to generate e-pins: ${error.message}`);
    }
  };

  // Load e-pins from database
  const loadEPins = async () => {
    try {
      const { data, error } = await supabase
        .from('epins')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedEPins: EPin[] = (data || []).map(epin => ({
        id: epin.id,
        code: epin.code,
        isUsed: epin.is_used,
        usedBy: epin.used_by_user_id || undefined,
        usedDate: epin.used_at || undefined,
        generatedAt: epin.generated_at
      }));
      
      setGeneratedEPins(formattedEPins);
    } catch (error: any) {
      toast.error(`Failed to load e-pins: ${error.message}`);
    }
  };

  const loadMembersCount = async () => {
    try {
      const { error, count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .range(0, 0); // fetch zero rows, only need count
      if (error) throw error;
      setTotalMembers(count ?? 0);
    } catch (error: any) {
      console.error('loadMembersCount error:', error);
      toast.error(`Failed to load member count: ${error.message || 'Unknown error'}`);
    }
  };

  // Download e-pins as CSV
  const handleDownloadCSV = () => {
    if (generatedEPins.length === 0) {
      toast.error('No e-pins available for download');
      return;
    }

    const csvData = generatedEPins.map((epin: EPin) => ({
      'E-Pin Code': epin.code,
      'Status': epin.isUsed ? 'Used' : 'Available',
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

  // Load stats on component mount
  useEffect(() => {
    loadEPins();
    loadMembersCount();
  }, []);

  const totalEPins = generatedEPins.length;
  const usedEPins = generatedEPins.filter(epin => epin.isUsed).length;
  const availableEPins = totalEPins - usedEPins;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="flex gap-3 items-center">
          <Button onClick={() => navigate('/admin/users')} variant="outline">
            <UserCog className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
          <Button onClick={() => navigate('/admin/payouts')} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Manage Payouts
          </Button>
          <Button onClick={() => navigate('/admin/legacy-migration')} variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Migrate Legacy Users
          </Button>
          <Badge variant="destructive">Administrator</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
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