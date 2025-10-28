import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth, User } from "@/hooks/useAuth";
import { Users, Wallet, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BankDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
}

interface WithdrawalRecord {
  amount: number;
  date: string;
  status: string;
}

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load all users from Supabase database
    const loadUsers = async () => {
      if (!isAdmin) return;

      try {
        // Fetch all data separately including bank accounts and withdrawals
        const [profilesResult, walletsResult, networkResult, bankAccountsResult, withdrawalsResult] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('wallets').select('*'),
          supabase.from('network_tree').select('*'),
          supabase.from('bank_accounts').select('*'),
          supabase.from('withdrawals').select('*')
        ]);

        if (profilesResult.error) {
          console.error('Error fetching profiles:', profilesResult.error);
          toast.error(`Failed to load profiles: ${profilesResult.error.message}`);
          return;
        }

        if (walletsResult.error) {
          console.error('Error fetching wallets:', walletsResult.error);
          toast.error(`Failed to load wallets: ${walletsResult.error.message}`);
          return;
        }

        if (networkResult.error) {
          console.error('Error fetching network:', networkResult.error);
          toast.error(`Failed to load network data: ${networkResult.error.message}`);
          return;
        }

        const profiles = profilesResult.data || [];
        const wallets = walletsResult.data || [];
        const networkTree = networkResult.data || [];
        const bankAccounts = bankAccountsResult.data || [];
        const withdrawals = withdrawalsResult.data || [];

        // Create lookup maps
        const walletsMap = new Map(wallets.map(w => [w.user_id, w]));
        const networkMap = new Map(networkTree.map(n => [n.user_id, n]));
        const bankAccountsMap = new Map();
        const withdrawalsMap = new Map();

        // Group bank accounts by user_id
        bankAccounts.forEach(account => {
          if (!bankAccountsMap.has(account.user_id)) {
            bankAccountsMap.set(account.user_id, []);
          }
          bankAccountsMap.get(account.user_id).push(account);
        });

        // Group withdrawals by user_id
        withdrawals.forEach(withdrawal => {
          if (!withdrawalsMap.has(withdrawal.user_id)) {
            withdrawalsMap.set(withdrawal.user_id, []);
          }
          withdrawalsMap.get(withdrawal.user_id).push(withdrawal);
        });

        // Transform Supabase profiles to match User interface
        const transformedUsers = profiles.map((profile: any) => {
          const userWallet = walletsMap.get(profile.user_id);
          const userNetwork = networkMap.get(profile.user_id);
          const userBankAccounts = bankAccountsMap.get(profile.user_id) || [];
          const userWithdrawals = withdrawalsMap.get(profile.user_id) || [];

          return {
            id: profile.user_id,
            memberId: profile.id,
            fullName: profile.full_name,
            username: profile.username,
            mobile: profile.phone,
            email: profile.email,
            level: userNetwork?.level || 1,
            stage: userNetwork?.stage || 1,
            earnings: userWallet?.total_earned || 0,
            directRecruits: profile.direct_recruits,
            totalRecruits: profile.total_recruits,
            isActive: true,
            joinDate: profile.created_at,
            wallets: {
              eWallet: userWallet?.e_wallet_balance || 0,
              registrationWallet: userWallet?.registration_wallet_balance || 0,
              incentiveWallet: userWallet?.incentive_wallet_balance || 0
            },
            bankAccounts: userBankAccounts,
            withdrawals: userWithdrawals
          };
        });
        
        setAllUsers(transformedUsers);
      } catch (err: any) {
        console.error('Unexpected error loading users:', err);
        toast.error('Failed to load users. Please refresh the page.');
      }
    };

    loadUsers();
  }, [isAdmin]);

  if (!isAdmin) return null;

  const getUserBankDetails = (userId: string): BankDetails | null => {
    const bankDetails = localStorage.getItem(`bankDetails_${userId}`);
    return bankDetails ? JSON.parse(bankDetails) : null;
  };

  const getUserWithdrawals = (userId: string): WithdrawalRecord[] => {
    const withdrawals = localStorage.getItem(`withdrawalHistory_${userId}`);
    return withdrawals ? JSON.parse(withdrawals) : [];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">View and manage all registered users</p>
        </div>
        <Badge variant="destructive">Administrator</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
            <p className="text-xs text-muted-foreground">Registered members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{allUsers.reduce((sum, u) => sum + (u.wallets?.eWallet || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Combined e-wallet balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{allUsers.reduce((sum, u) => sum + u.earnings, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All user earnings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Registered Users</CardTitle>
          <CardDescription>Complete user information including wallets and bank details</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-w-full">
            <Table className="min-w-max">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Full Name</TableHead>
                  <TableHead className="whitespace-nowrap">Username</TableHead>
                  <TableHead className="whitespace-nowrap">Member ID</TableHead>
                  <TableHead className="whitespace-nowrap">Stage</TableHead>
                  <TableHead className="whitespace-nowrap">E-Wallet</TableHead>
                  <TableHead className="whitespace-nowrap">Earnings</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[200px]">Bank Accounts</TableHead>
                  <TableHead className="whitespace-nowrap">Withdrawals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((userData: any) => {
                  const userBankAccounts = userData.bankAccounts || [];
                  const userWithdrawals = userData.withdrawals || [];
                  const totalWithdrawn = userWithdrawals.reduce((sum: number, w: any) => sum + (w.amount || 0), 0);

                  return (
                    <TableRow key={userData.memberId}>
                      <TableCell className="font-medium whitespace-nowrap">{userData.fullName}</TableCell>
                      <TableCell className="whitespace-nowrap">{userData.username}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="secondary">{userData.memberId}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge className="bg-gradient-to-r from-primary to-accent">
                          Stage {userData.stage}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">R{(userData.wallets?.eWallet || 0).toFixed(2)}</TableCell>
                      <TableCell className="whitespace-nowrap">R{userData.earnings.toFixed(2)}</TableCell>
                      <TableCell className="min-w-[250px] max-w-[300px]">
                        {userBankAccounts.length > 0 ? (
                          <div className="space-y-3 py-2">
                            {userBankAccounts.map((acc: any, idx: number) => (
                              <div key={idx} className="bg-muted/30 p-3 rounded-lg border">
                                <div className="font-medium text-sm">{acc.bank_name}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  <div>Acc: {acc.account_number}</div>
                                  <div>Holder: {acc.account_holder}</div>
                                  <div>Branch: {acc.branch_code}</div>
                                </div>
                                {acc.is_locked && <Badge variant="destructive" className="mt-2 text-xs">Locked</Badge>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm italic">No bank accounts</div>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        {userWithdrawals.length > 0 ? (
                          <div className="space-y-2 py-2">
                            <div className="font-medium text-sm">Total: R{totalWithdrawn.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">{userWithdrawals.length} withdrawals</div>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {userWithdrawals.slice(0, 3).map((w: any, idx: number) => (
                                <div key={idx} className="bg-muted/20 p-2 rounded text-xs">
                                  <div>R{w.amount}</div>
                                  <div className="text-muted-foreground">{w.status}</div>
                                </div>
                              ))}
                              {userWithdrawals.length > 3 && (
                                <div className="text-xs text-muted-foreground">+{userWithdrawals.length - 3} more</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm italic">No withdrawals</div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {allUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No users registered yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
