import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LegacyUser {
  id: string;
  memberId: string;
  fullName: string;
  username: string;
  password: string;
  mobile: string;
  email?: string;
  level: number;
  stage: number;
  earnings: number;
  directRecruits: number;
  totalRecruits: number;
  joinDate: string;
  transactionPin?: string;
  wallets: {
    eWallet: number;
    registrationWallet: number;
    incentiveWallet: number;
  };
}

export default function LegacyUserMigration() {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResults, setMigrationResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const migrateLegacyUsers = async () => {
    setIsLoading(true);
    setMigrationResults(null);

    try {
      // Get legacy users from localStorage
      const legacyUsers: LegacyUser[] = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
      
      if (legacyUsers.length === 0) {
        toast({
          title: "No legacy users found",
          description: "There are no users in localStorage to migrate.",
        });
        setIsLoading(false);
        return;
      }

      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in again to perform migration.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Call edge function to migrate users
      const { data, error } = await supabase.functions.invoke('migrate-legacy-users', {
        body: { users: legacyUsers }
      });

      if (error) {
        throw error;
      }

      setMigrationResults(data);
      toast({
        title: "Migration completed",
        description: `Successfully migrated ${data.success} users. ${data.failed} failed.`,
      });
    } catch (error: any) {
      toast({
        title: "Migration failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const seedDemoUsers = () => {
    const demoUsers: LegacyUser[] = [
      {
        id: 'demo-user-1',
        memberId: 'BW001',
        fullName: 'John Demo',
        username: 'johndemo',
        password: 'demo123',
        mobile: '1234567890',
        email: 'john@demo.com',
        level: 1,
        stage: 1,
        earnings: 500,
        directRecruits: 2,
        totalRecruits: 5,
        joinDate: new Date().toISOString(),
        transactionPin: '1234',
        wallets: { eWallet: 100, registrationWallet: 200, incentiveWallet: 200 }
      },
      {
        id: 'demo-user-2',
        memberId: 'BW002',
        fullName: 'Jane Smith',
        username: 'janesmith',
        password: 'demo123',
        mobile: '0987654321',
        email: 'jane@demo.com',
        level: 1,
        stage: 1,
        earnings: 250,
        directRecruits: 1,
        totalRecruits: 3,
        joinDate: new Date().toISOString(),
        transactionPin: '5678',
        wallets: { eWallet: 50, registrationWallet: 100, incentiveWallet: 100 }
      }
    ];
    localStorage.setItem('breadwinners_users', JSON.stringify(demoUsers));
    toast({ title: 'Demo users seeded', description: 'You can now start migration.' });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Legacy User Migration</h1>
        <p className="text-muted-foreground">
          Import users from localStorage into Supabase database
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Migrate Legacy Users
          </CardTitle>
          <CardDescription>
            This will import all users stored in browser localStorage into the Supabase database.
            Users will then be able to log in from any device or browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This operation will create Supabase auth accounts for all legacy users.
              Users that already exist in the database will be skipped.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={migrateLegacyUsers} 
            disabled={isLoading}
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrating Users...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Start Migration
              </>
            )}
          </Button>

          <Button 
            variant="secondary"
            onClick={seedDemoUsers}
            disabled={isLoading}
            size="sm"
            className="w-full"
          >
            Seed Demo Users
          </Button>

          {migrationResults && (
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Successful</p>
                        <p className="text-2xl font-bold text-green-600">{migrationResults.success}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-500 bg-red-50 dark:bg-red-950">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{migrationResults.failed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {migrationResults.errors.length > 0 && (
                <Card className="border-yellow-500">
                  <CardHeader>
                    <CardTitle className="text-sm">Migration Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {migrationResults.errors.map((error, index) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          • {error}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
