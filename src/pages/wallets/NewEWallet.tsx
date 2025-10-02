import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wallet, Send, Eye, EyeOff, Lock, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const southAfricanBanks = [
  "ABSA", "Standard Bank", "FNB", "Nedbank", "Capitec", "Investec",
  "African Bank", "Discovery Bank", "TymeBank", "Bidvest Bank"
];

interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  isLocked: boolean;
}

const NewEWallet = () => {
  const { user } = useAuth();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  
  // Form for adding new bank account
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBankForm, setNewBankForm] = useState({
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    branchCode: ""
  });

  // Verification form for withdrawal
  const [verificationForm, setVerificationForm] = useState({
    bankName: "",
    accountNumber: "",
    branchCode: ""
  });
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    if (user) {
      const savedAccounts = localStorage.getItem(`bankAccounts_${user.memberId}`);
      if (savedAccounts) {
        setBankAccounts(JSON.parse(savedAccounts));
      }
    }
  }, [user]);

  const saveBankAccounts = (accounts: BankAccount[]) => {
    if (user) {
      localStorage.setItem(`bankAccounts_${user.memberId}`, JSON.stringify(accounts));
      setBankAccounts(accounts);
      
      // Update user's stored bank accounts for admin visibility
      const users = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.memberId === user.memberId);
      if (userIndex !== -1) {
        users[userIndex].bankAccounts = accounts;
        localStorage.setItem('breadwinners_users', JSON.stringify(users));
      }
    }
  };

  const handleAddBankAccount = () => {
    if (!user) return;
    
    if (bankAccounts.length >= 3) {
      toast({
        title: "Maximum accounts reached",
        description: "You can only add up to 3 bank accounts",
        variant: "destructive"
      });
      return;
    }

    if (!newBankForm.bankName || !newBankForm.accountHolder || !newBankForm.accountNumber || !newBankForm.branchCode) {
      toast({
        title: "Missing information",
        description: "Please fill in all bank details",
        variant: "destructive"
      });
      return;
    }

    const newAccount: BankAccount = {
      id: `bank_${Date.now()}`,
      ...newBankForm,
      isLocked: false
    };

    const updatedAccounts = [...bankAccounts, newAccount];
    saveBankAccounts(updatedAccounts);

    setNewBankForm({
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      branchCode: ""
    });
    setShowAddBank(false);

    toast({
      title: "Bank account added",
      description: "Your bank account has been saved successfully"
    });
  };

  const handleLockAccount = (accountId: string) => {
    const updatedAccounts = bankAccounts.map(acc => 
      acc.id === accountId ? { ...acc, isLocked: true } : acc
    );
    saveBankAccounts(updatedAccounts);

    toast({
      title: "Account locked",
      description: "This bank account is now locked and cannot be edited"
    });
  };

  const handleDeleteAccount = (accountId: string) => {
    const account = bankAccounts.find(acc => acc.id === accountId);
    if (account?.isLocked) {
      toast({
        title: "Cannot delete",
        description: "Locked accounts cannot be deleted",
        variant: "destructive"
      });
      return;
    }

    const updatedAccounts = bankAccounts.filter(acc => acc.id !== accountId);
    saveBankAccounts(updatedAccounts);

    toast({
      title: "Account deleted",
      description: "Bank account has been removed"
    });
  };

  const handleWithdrawal = () => {
    if (!user) return;

    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount < 300) {
      toast({
        title: "Invalid amount",
        description: "Minimum withdrawal amount is R300",
        variant: "destructive"
      });
      return;
    }

    if (amount > user.wallets.eWallet) {
      toast({
        title: "Insufficient funds",
        description: `Your available balance is R${user.wallets.eWallet.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }

    if (!transactionPin || transactionPin !== user.transactionPin) {
      toast({
        title: "Invalid PIN",
        description: "Please enter your correct transaction PIN",
        variant: "destructive"
      });
      return;
    }

    if (!selectedBankId) {
      toast({
        title: "No bank account selected",
        description: "Please select a bank account for withdrawal",
        variant: "destructive"
      });
      return;
    }

    // Show verification form
    setShowVerification(true);
  };

  const handleVerifyAndWithdraw = () => {
    if (!user || !selectedBankId) return;

    const selectedAccount = bankAccounts.find(acc => acc.id === selectedBankId);
    if (!selectedAccount) return;

    // Verify bank details match
    if (
      verificationForm.bankName !== selectedAccount.bankName ||
      verificationForm.accountNumber !== selectedAccount.accountNumber ||
      verificationForm.branchCode !== selectedAccount.branchCode
    ) {
      toast({
        title: "Verification failed",
        description: "Bank details do not match the saved account",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);

    // Process withdrawal
    const withdrawalRecord = {
      amount,
      date: new Date().toISOString(),
      status: "Pending",
      reference: `WD${Date.now()}`,
      bankAccount: selectedAccount
    };

    const existingWithdrawals = JSON.parse(
      localStorage.getItem(`withdrawalHistory_${user.memberId}`) || '[]'
    );
    existingWithdrawals.push(withdrawalRecord);
    localStorage.setItem(`withdrawalHistory_${user.memberId}`, JSON.stringify(existingWithdrawals));

    // Update user's e-wallet
    const users = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.memberId === user.memberId);
    if (userIndex !== -1) {
      users[userIndex].wallets.eWallet -= amount;
      localStorage.setItem('breadwinners_users', JSON.stringify(users));
    }

    toast({
      title: "Withdrawal requested",
      description: `R${amount.toFixed(2)} withdrawal is being processed`
    });

    setWithdrawAmount("");
    setTransactionPin("");
    setVerificationForm({ bankName: "", accountNumber: "", branchCode: "" });
    setShowVerification(false);
    setSelectedBankId("");
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">E-Wallet</h1>
        <p className="text-muted-foreground">Manage your funds and bank accounts</p>
      </div>

      {/* Wallet Balance */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-foreground">
            R{user.wallets.eWallet.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Ready for withdrawal</p>
        </CardContent>
      </Card>

      {/* Withdrawal Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Withdraw Funds
          </CardTitle>
          <CardDescription>Minimum withdrawal: R300.00</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showVerification ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="withdrawAmount">Amount (R)</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  placeholder="300.00"
                  min="300"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount">Select Bank Account</Label>
                <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account, index) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} - Account {index + 1} ({account.accountNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionPin">Transaction PIN</Label>
                <div className="relative">
                  <Input
                    id="transactionPin"
                    type={showPin ? "text" : "password"}
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                    value={transactionPin}
                    onChange={(e) => setTransactionPin(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleWithdrawal} 
                className="w-full"
                disabled={!withdrawAmount || !transactionPin || !selectedBankId}
              >
                <Send className="h-4 w-4 mr-2" />
                Request Withdrawal
              </Button>
            </>
          ) : (
            <>
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="font-semibold text-sm">Verify your bank details to complete withdrawal</p>
                <p className="text-xs text-muted-foreground">
                  Re-enter the details to confirm they match your saved account
                </p>
              </div>

              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Select 
                  value={verificationForm.bankName} 
                  onValueChange={(value) => setVerificationForm(prev => ({ ...prev, bankName: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {southAfricanBanks.map(bank => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  placeholder="Enter account number"
                  value={verificationForm.accountNumber}
                  onChange={(e) => setVerificationForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Branch Code</Label>
                <Input
                  placeholder="Enter branch code"
                  value={verificationForm.branchCode}
                  onChange={(e) => setVerificationForm(prev => ({ ...prev, branchCode: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowVerification(false);
                    setVerificationForm({ bankName: "", accountNumber: "", branchCode: "" });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleVerifyAndWithdraw}
                  className="flex-1"
                >
                  Confirm & Withdraw
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bank Accounts Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bank Accounts</CardTitle>
              <CardDescription>Manage up to 3 bank accounts</CardDescription>
            </div>
            {bankAccounts.length < 3 && (
              <Button 
                onClick={() => setShowAddBank(!showAddBank)}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Bank Form */}
          {showAddBank && (
            <div className="p-4 border rounded-lg space-y-3 bg-muted/20">
              <h3 className="font-semibold">Add New Bank Account</h3>
              
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Select 
                  value={newBankForm.bankName} 
                  onValueChange={(value) => setNewBankForm(prev => ({ ...prev, bankName: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {southAfricanBanks.map(bank => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Account Holder Name</Label>
                <Input
                  placeholder="Full name on account"
                  value={newBankForm.accountHolder}
                  onChange={(e) => setNewBankForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  placeholder="Account number"
                  value={newBankForm.accountNumber}
                  onChange={(e) => setNewBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Branch Code</Label>
                <Input
                  placeholder="Branch code"
                  value={newBankForm.branchCode}
                  onChange={(e) => setNewBankForm(prev => ({ ...prev, branchCode: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddBank(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddBankAccount} className="flex-1">
                  Save Account
                </Button>
              </div>
            </div>
          )}

          {/* Saved Bank Accounts */}
          <div className="space-y-3">
            {bankAccounts.map((account, index) => (
              <div 
                key={account.id} 
                className={`p-4 border rounded-lg ${account.isLocked ? 'bg-muted/30' : 'bg-background'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{account.bankName}</h4>
                      <Badge variant={account.isLocked ? "secondary" : "outline"}>
                        Account {index + 1}
                      </Badge>
                      {account.isLocked && (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" /> Locked
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{account.accountHolder}</p>
                    <p className="text-sm font-mono">{account.accountNumber}</p>
                    <p className="text-sm text-muted-foreground">Branch: {account.branchCode}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {!account.isLocked && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleLockAccount(account.id)}
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Lock
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {bankAccounts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No bank accounts added yet</p>
                <p className="text-sm">Add a bank account to enable withdrawals</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewEWallet;
