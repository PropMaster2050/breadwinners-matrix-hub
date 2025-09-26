import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { 
  Wallet, 
  CreditCard, 
  DollarSign, 
  Eye, 
  EyeOff,
  Building,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const southAfricanBanks = [
  "ABSA Bank",
  "Standard Bank", 
  "First National Bank (FNB)",
  "Nedbank",
  "Capitec Bank",
  "TymeBank"
];

const NewEWallet = () => {
  const { user } = useAuth();
  const [showPin, setShowPin] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    branchCode: ""
  });

  if (!user) return null;

  const handleWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    
    if (!amount || amount < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is R100",
        variant: "destructive"
      });
      return;
    }

    if (amount > user.wallets.eWallet) {
      toast({
        title: "Insufficient Balance", 
        description: "Withdrawal amount exceeds available balance",
        variant: "destructive"
      });
      return;
    }

    if (!transactionPin) {
      toast({
        title: "Transaction PIN Required",
        description: "Please enter your 4-digit transaction PIN",
        variant: "destructive"
      });
      return;
    }

    // Here you would verify the transaction PIN against stored PIN
    toast({
      title: "Withdrawal Request Submitted",
      description: "Your withdrawal will be processed on the next business day (Monday/Friday)",
    });

    // Reset form
    setWithdrawalAmount("");
    setTransactionPin("");
  };

  const handleSaveBankDetails = () => {
    if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountHolder) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required bank details",
        variant: "destructive"
      });
      return;
    }

    // Save bank details to user profile
    toast({
      title: "Bank Details Saved",
      description: "Your banking information has been saved securely"
    });
    
    setShowBankForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Breadwinners Family Network</h1>
        </div>

        {/* Wallet Balance Section */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Wallet className="h-5 w-5" />
              Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-6 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Wallet className="h-8 w-8 text-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">AVAILABLE</p>
                    <p className="font-semibold">Ewallet Balance</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-foreground mb-2">R {user.wallets.eWallet}</p>
                <p className="text-sm text-muted-foreground mb-4">Available for Withdrawal Only</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Section */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <DollarSign className="h-5 w-5" />
              Withdraw Funds
            </CardTitle>
            <CardDescription>
              Withdrawals are processed on Mondays and Fridays. Minimum amount: R100
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount (min R100)"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                min="100"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">Transaction PIN</Label>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  placeholder="Enter 4-digit PIN"
                  value={transactionPin}
                  onChange={(e) => setTransactionPin(e.target.value)}
                  maxLength={4}
                  className="h-11 pr-12 font-mono"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleWithdrawal}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-semibold"
              disabled={!withdrawalAmount || !transactionPin}
            >
              <Shield className="h-4 w-4 mr-2" />
              Withdraw R{withdrawalAmount || "0"}
            </Button>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">Withdrawal Schedule</p>
                  <p className="text-muted-foreground">
                    • Withdrawals are processed every Monday and Friday
                    <br />
                    • Processing time: 1-3 business days
                    <br />
                    • All withdrawals require admin approval
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Account Management */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Building className="h-5 w-5" />
              Bank Account Details
            </CardTitle>
            <CardDescription>
              Manage your South African bank account for withdrawals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showBankForm ? (
              <div>
                {user.bankDetails ? (
                  <div className="bg-white rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                      <Building className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{user.bankDetails.bankName}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.bankDetails.accountHolder}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Account: ****{user.bankDetails.accountNumber.slice(-4)}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No bank account on file</p>
                  </div>
                )}
                
                <Button 
                  onClick={() => setShowBankForm(true)}
                  variant="outline"
                  className="w-full h-12"
                >
                  <Building className="h-4 w-4 mr-2" />
                  {user.bankDetails ? "Update Bank Details" : "Add Bank Account"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Select 
                    value={bankDetails.bankName} 
                    onValueChange={(value) => setBankDetails({...bankDetails, bankName: value})}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {southAfricanBanks.map((bank) => (
                        <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input
                    id="accountHolder"
                    placeholder="Full name as per bank records"
                    value={bankDetails.accountHolder}
                    onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Bank account number"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchCode">Branch Code</Label>
                  <Input
                    id="branchCode"
                    placeholder="6-digit branch code"
                    value={bankDetails.branchCode}
                    onChange={(e) => setBankDetails({...bankDetails, branchCode: e.target.value})}
                    maxLength={6}
                    className="h-11"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowBankForm(false)}
                    variant="outline" 
                    className="flex-1 h-12"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveBankDetails}
                    className="flex-1 h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Details
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Clock className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No recent transactions</p>
              <p className="text-sm text-muted-foreground">Your withdrawal history will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewEWallet;