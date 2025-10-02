import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth, User } from "@/hooks/useAuth";
import { Users, Wallet, CreditCard } from "lucide-react";

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
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load all users from localStorage
    const users = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
    setAllUsers(users);
  }, []);

  if (!user || user.username !== 'admin') return null;

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
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>E-Wallet</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Bank Accounts</TableHead>
                  <TableHead>Withdrawals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((userData) => {
                  const bankDetails = getUserBankDetails(userData.memberId);
                  const withdrawals = getUserWithdrawals(userData.memberId);
                  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

                  return (
                    <TableRow key={userData.memberId}>
                      <TableCell className="font-medium">{userData.fullName}</TableCell>
                      <TableCell>{userData.username}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{userData.memberId}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-primary to-accent">
                          Stage {userData.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>R{(userData.wallets?.eWallet || 0).toFixed(2)}</TableCell>
                      <TableCell>R{userData.earnings.toFixed(2)}</TableCell>
                      <TableCell>
                        {(() => {
                          const bankAccounts = localStorage.getItem(`bankAccounts_${userData.memberId}`);
                          const accounts = bankAccounts ? JSON.parse(bankAccounts) : [];
                          
                          if (accounts.length > 0) {
                            return (
                              <div className="space-y-2">
                                {accounts.map((acc: any, idx: number) => (
                                  <div key={idx} className="text-xs border-b pb-2 last:border-0">
                                    <div className="font-medium">{acc.bankName}</div>
                                    <div className="text-muted-foreground">{acc.accountNumber}</div>
                                    <div className="text-muted-foreground">{acc.accountHolder}</div>
                                    {acc.isLocked && <Badge variant="secondary" className="mt-1">Locked</Badge>}
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return <span className="text-muted-foreground">Not provided</span>;
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="font-medium">R{totalWithdrawn.toFixed(2)}</div>
                          <div className="text-muted-foreground">{withdrawals.length} withdrawals</div>
                        </div>
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
