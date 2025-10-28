import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, Check, X } from "lucide-react";
import { toast } from "sonner";

interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  amount: number;
  date: string;
  status: string;
  bankDetails: any;
}

const AdminPayouts = () => {
  const { user, isAdmin } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = () => {
    const allUsers = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
    const allWithdrawals: WithdrawalRequest[] = [];

    allUsers.forEach((u: any) => {
      const userWithdrawals = JSON.parse(localStorage.getItem(`withdrawalHistory_${u.memberId}`) || '[]');
      userWithdrawals.forEach((w: any) => {
        allWithdrawals.push({
          id: `${u.memberId}_${w.date}`,
          userId: u.memberId,
          username: u.username,
          fullName: u.fullName,
          amount: w.amount,
          date: w.date,
          status: w.status,
          bankDetails: w.bankDetails
        });
      });
    });

    setWithdrawals(allWithdrawals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleApprove = (withdrawal: WithdrawalRequest) => {
    // Update withdrawal status
    const userWithdrawals = JSON.parse(localStorage.getItem(`withdrawalHistory_${withdrawal.userId}`) || '[]');
    const updatedWithdrawals = userWithdrawals.map((w: any) => 
      w.date === withdrawal.date ? { ...w, status: 'completed' } : w
    );
    localStorage.setItem(`withdrawalHistory_${withdrawal.userId}`, JSON.stringify(updatedWithdrawals));

    toast.success(`Payout approved for ${withdrawal.fullName}`);
    loadWithdrawals();
  };

  const handleReject = (withdrawal: WithdrawalRequest) => {
    // Update withdrawal status and refund amount
    const userWithdrawals = JSON.parse(localStorage.getItem(`withdrawalHistory_${withdrawal.userId}`) || '[]');
    const updatedWithdrawals = userWithdrawals.map((w: any) => 
      w.date === withdrawal.date ? { ...w, status: 'rejected' } : w
    );
    localStorage.setItem(`withdrawalHistory_${withdrawal.userId}`, JSON.stringify(updatedWithdrawals));

    // Refund amount to user's e-wallet
    const allUsers = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
    const updatedUsers = allUsers.map((u: any) => {
      if (u.memberId === withdrawal.userId) {
        return {
          ...u,
          wallets: {
            ...u.wallets,
            eWallet: (u.wallets?.eWallet || 0) + withdrawal.amount
          }
        };
      }
      return u;
    });
    localStorage.setItem('breadwinners_users', JSON.stringify(updatedUsers));

    toast.error(`Payout rejected and refunded for ${withdrawal.fullName}`);
    loadWithdrawals();
  };

  if (!isAdmin) return null;

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const completedWithdrawals = withdrawals.filter(w => w.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payout Management</h1>
          <p className="text-muted-foreground">Manage user withdrawal requests</p>
        </div>
        <Badge variant="destructive">Administrator</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingWithdrawals.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">To be processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Payouts</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedWithdrawals.length}</div>
            <p className="text-xs text-muted-foreground">Successfully paid</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Withdrawal Requests</CardTitle>
          <CardDescription>Review and approve/reject user withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{withdrawal.fullName}</div>
                        <div className="text-sm text-muted-foreground">{withdrawal.username}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">R{withdrawal.amount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(withdrawal.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {withdrawal.bankDetails && (
                        <div className="text-xs">
                          <div>{withdrawal.bankDetails.bankName}</div>
                          <div>{withdrawal.bankDetails.accountNumber}</div>
                          <div>{withdrawal.bankDetails.accountHolder}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{withdrawal.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(withdrawal)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(withdrawal)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingWithdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No pending withdrawal requests
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completed Payouts</CardTitle>
          <CardDescription>History of processed withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedWithdrawals.slice(0, 10).map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{withdrawal.fullName}</div>
                        <div className="text-sm text-muted-foreground">{withdrawal.username}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">R{withdrawal.amount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(withdrawal.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="default">Completed</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {completedWithdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No completed payouts yet
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

export default AdminPayouts;
