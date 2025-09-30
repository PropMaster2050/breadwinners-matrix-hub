import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Package, ShoppingCart } from "lucide-react";

const RegistrationWallet = () => {
  // New user starts with R0 and 0 e-pins
  const registrationData = {
    availableBalance: 0,
    availableEpins: 0,
    purchasedEpins: 0,
    totalSpent: 0,
    epinValue: 250, // R250 per e-pin
    transactions: []
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Registration Wallet</h1>
        <p className="text-muted-foreground">Track new e-pin purchases and manage vouchers</p>
      </div>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{registrationData.availableBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              For e-pin purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available E-pins</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationData.availableEpins}</div>
            <p className="text-xs text-muted-foreground">
              Ready to distribute
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total E-pins Purchased</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationData.purchasedEpins}</div>
            <p className="text-xs text-muted-foreground">
              R{registrationData.totalSpent.toLocaleString()} spent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* E-pin Purchase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Purchase E-pins</CardTitle>
            <CardDescription>
              Buy new registration vouchers to distribute to new members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">E-pin Price</span>
                <span className="text-lg font-bold">R{registrationData.epinValue}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Each e-pin allows one new member registration
              </p>
            </div>
            
            <Button className="w-full" disabled={registrationData.availableBalance < registrationData.epinValue}>
              Purchase E-pins
            </Button>
            
            {registrationData.availableBalance < registrationData.epinValue && (
              <p className="text-sm text-muted-foreground text-center">
                Insufficient balance. Add funds to your account to purchase e-pins.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>E-pin Management</CardTitle>
            <CardDescription>
              Distribute e-pins to new recruits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-primary mb-1">
                  {registrationData.availableEpins}
                </div>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-muted-foreground mb-1">
                  {registrationData.purchasedEpins - registrationData.availableEpins}
                </div>
                <p className="text-sm text-muted-foreground">Distributed</p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" disabled={registrationData.availableEpins === 0}>
              Distribute E-pin
            </Button>
            
            {registrationData.availableEpins === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                No e-pins available. Purchase e-pins to distribute to new members.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your e-pin purchase and distribution history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrationData.transactions.length > 0 ? (
            <div className="space-y-3">
              {registrationData.transactions.map((transaction: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{transaction.type}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{transaction.amount}</p>
                    <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
              <p className="text-muted-foreground">
                Your e-pin purchase and distribution history will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationWallet;