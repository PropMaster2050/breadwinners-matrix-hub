import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Laptop, Gift, Users } from "lucide-react";

const IncentiveWallet = () => {
  // New user starts with 0 incentives
  const incentiveData = {
    cellphones: 0,
    laptops: 0,
    cashVouchers: 0,
    totalIncentiveValue: 0,
    claimedRewards: []
  };

  const incentiveStructure = [
    {
      stage: "Stage 2",
      requirement: "Complete 2×2 matrix (4 members)",
      reward: "Samsung Smartphone",
      icon: Smartphone,
      status: "locked",
      progress: 0,
      maxProgress: 4
    },
    {
      stage: "Stage 3", 
      requirement: "Complete second 2×2 matrix (8 members total)",
      reward: "Laptop Computer",
      icon: Laptop,
      status: "locked",
      progress: 0,
      maxProgress: 8
    },
    {
      stage: "Stage 4",
      requirement: "Complete third 2×2 matrix (16 members total)",
      reward: "R5,000 Cash Voucher",
      icon: Gift,
      status: "locked",
      progress: 0,
      maxProgress: 16
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Incentive Wallet</h1>
        <p className="text-muted-foreground">Extra bonuses - Samsung, Laptop, Cash Vouchers per Stages</p>
      </div>

      {/* Incentive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smartphones</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incentiveData.cellphones}</div>
            <p className="text-xs text-muted-foreground">
              Samsung devices earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laptops</CardTitle>
            <Laptop className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incentiveData.laptops}</div>
            <p className="text-xs text-muted-foreground">
              Computers earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Vouchers</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{incentiveData.cashVouchers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Voucher amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{incentiveData.totalIncentiveValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Incentives earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Incentive Stages */}
      <Card>
        <CardHeader>
          <CardTitle>Stage Incentives</CardTitle>
          <CardDescription>
            Complete stages to unlock amazing rewards. Bring more members to progress!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incentiveStructure.map((stage, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <stage.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{stage.stage}</h3>
                      <p className="text-sm text-muted-foreground">{stage.requirement}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={stage.status === "completed" ? "default" : "outline"}
                  >
                    {stage.status === "completed" ? "Completed" : "Locked"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-primary">{stage.reward}</span>
                  <span className="text-sm text-muted-foreground">
                    {stage.progress}/{stage.maxProgress} members
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stage.progress / stage.maxProgress) * 100}%` }}
                  ></div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={stage.status !== "completed"}
                >
                  {stage.status === "completed" ? "Claim Reward" : "Complete Stage to Unlock"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Claimed Rewards History */}
      <Card>
        <CardHeader>
          <CardTitle>Claimed Rewards</CardTitle>
          <CardDescription>
            History of your claimed incentive rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incentiveData.claimedRewards.length > 0 ? (
            <div className="space-y-3">
              {incentiveData.claimedRewards.map((reward: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <reward.icon className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">{reward.name}</p>
                      <p className="text-sm text-muted-foreground">{reward.claimedDate}</p>
                    </div>
                  </div>
                  <Badge variant="default">Claimed</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Rewards Claimed Yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete stages by recruiting members to unlock and claim amazing incentive rewards.
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Stage 2: Samsung Smartphone (4 members)</p>
                <p>• Stage 3: Laptop Computer (8 members)</p>
                <p>• Stage 4: R5,000 Cash Voucher (16 members)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncentiveWallet;