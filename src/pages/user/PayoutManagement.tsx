import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Banknote, CreditCard, Calendar, AlertTriangle } from "lucide-react";

export default function PayoutManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Load bank details from localStorage
  const [bankDetails, setBankDetails] = useState(() => {
    const saved = localStorage.getItem(`bank_details_${user?.memberId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      accountName: "",
      accountNumber: "",
      bankName: "",
      branchCode: "",
      accountType: ""
    };
  });
  
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [transactionPin, setTransactionPin] = useState("");

  const availableBalance = user?.wallets?.eWallet || 0; // Use actual wallet balance
  const minWithdrawal = 300;

  // Load withdrawal history from localStorage
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem(`withdrawal_history_${user?.memberId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  const isWithdrawalDay = () => {
    const today = new Date().getDay();
    return today === 1 || today === 5; // Monday = 1, Friday = 5
  };

  const handleBankDetailsUpdate = () => {
    // Save bank details to localStorage
    localStorage.setItem(`bank_details_${user?.memberId}`, JSON.stringify(bankDetails));
    toast({
      title: "Bank Details Saved",
      description: "Your bank details have been permanently saved.",
    });
  };

  const handleWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    
    if (!amount || amount < minWithdrawal) {
      toast({
        title: "Invalid Amount",
        description: `Minimum withdrawal amount is R${minWithdrawal}`,
        variant: "destructive"
      });
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal.",
        variant: "destructive"
      });
      return;
    }

    if (!isWithdrawalDay()) {
      toast({
        title: "Withdrawal Not Available",
        description: "Withdrawals are only processed on Mondays and Fridays.",
        variant: "destructive"
      });
      return;
    }

    if (!transactionPin || transactionPin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter your 4-digit transaction PIN.",
        variant: "destructive"
      });
      return;
    }

    // Add to withdrawal history
    const newWithdrawal = {
      id: Date.now(),
      amount: amount,
      status: "pending",
      date: new Date().toISOString().split('T')[0],
      reference: `WD${Date.now().toString().slice(-6)}`
    };
    
    const updatedHistory = [newWithdrawal, ...withdrawalHistory];
    setWithdrawalHistory(updatedHistory);
    localStorage.setItem(`withdrawal_history_${user?.memberId}`, JSON.stringify(updatedHistory));
    
    toast({
      title: "Withdrawal Submitted",
      description: `Your withdrawal of R${amount} has been submitted for processing.`,
    });
    
    setWithdrawalAmount("");
    setTransactionPin("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Payout Management</h1>
        <p className="text-muted-foreground">Manage your bank details and withdraw your earnings</p>
      </div>

      <Tabs defaultValue="withdraw" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="withdraw" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Available Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  R{availableBalance.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Minimum withdrawal: R{minWithdrawal}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Withdrawal Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isWithdrawalDay() ? (
                      <Badge variant="default">Available Today</Badge>
                    ) : (
                      <Badge variant="secondary">Not Available</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Withdrawals processed on Mondays & Fridays
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
              <CardDescription>
                Enter the amount you want to withdraw and your transaction PIN
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isWithdrawalDay() && (
                <div className="flex items-center gap-2 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <p className="text-sm text-warning">
                    Withdrawals are only available on Mondays and Fridays
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Withdrawal Amount (R)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    min={minWithdrawal}
                    max={availableBalance}
                  />
                </div>
                <div>
                  <Label htmlFor="pin">Transaction PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="4-digit PIN"
                    value={transactionPin}
                    onChange={(e) => setTransactionPin(e.target.value)}
                    maxLength={4}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleWithdrawal} 
                className="w-full"
                disabled={!isWithdrawalDay()}
              >
                Submit Withdrawal Request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank-details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                South African Bank Details
              </CardTitle>
              <CardDescription>
                Update your bank account information for withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input
                    id="accountName"
                    placeholder="Full name as per bank account"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Bank account number"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Select value={bankDetails.bankName} onValueChange={(value) => setBankDetails({...bankDetails, bankName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fnb">FNB</SelectItem>
                      <SelectItem value="standard-bank">Standard Bank</SelectItem>
                      <SelectItem value="absa">ABSA</SelectItem>
                      <SelectItem value="nedbank">Nedbank</SelectItem>
                      <SelectItem value="capitec">Capitec Bank</SelectItem>
                      <SelectItem value="african-bank">African Bank</SelectItem>
                      <SelectItem value="investec">Investec</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="branchCode">Branch Code</Label>
                  <Input
                    id="branchCode"
                    placeholder="6-digit branch code"
                    value={bankDetails.branchCode}
                    onChange={(e) => setBankDetails({...bankDetails, branchCode: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accountType">Account Type</Label>
                <Select value={bankDetails.accountType} onValueChange={(value) => setBankDetails({...bankDetails, accountType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cheque">Cheque Account</SelectItem>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="current">Current Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleBankDetailsUpdate} className="w-full">
                Update Bank Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>View your past withdrawal requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {withdrawalHistory.length > 0 ? (
                  withdrawalHistory.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">R{withdrawal.amount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          {withdrawal.date} • Ref: {withdrawal.reference}
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Banknote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No withdrawal history yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your withdrawal requests will appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}