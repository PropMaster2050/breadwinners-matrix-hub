import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Laptop, Gift, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const IncentiveWallet = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  // New user starts with 0 incentives
  const incentiveData = {
    cellphones: 0,
    laptops: 0,
    cashVouchers: 0,
    totalIncentiveValue: 0,
    claimedRewards: []
  };

  // Calculate actual matrix progression for incentives (all 2x2 = 6 members per stage)
  const stage1Complete = user.directRecruits >= 2 && user.totalRecruits >= 6;
  const stage2Complete = stage1Complete && user.totalRecruits >= 12; // Stage 1 (6) + Stage 2 (6)
  const stage3Complete = stage2Complete && user.totalRecruits >= 18; // Stage 1 (6) + Stage 2 (6) + Stage 3 (6)
  const stage4Complete = stage3Complete && user.totalRecruits >= 24; // + Stage 4 (6)
  const stage5Complete = stage4Complete && user.totalRecruits >= 30; // + Stage 5 (6)
  const stage6Complete = stage5Complete && user.totalRecruits >= 36; // + Stage 6 (6)

  const incentiveStructure = [
    {
      stage: 1,
      requirement: "6 members (2 direct + 4 indirect)",
      reward: "R600 Cash Reward",
      icon: Gift,
      status: stage1Complete ? "unlocked" : "locked",
      current: Math.min(user.totalRecruits, 6),
      max: 6
    },
    {
      stage: 2,
      requirement: "6 Stage 1 completers",
      reward: "R1,200 + Samsung Smartphone",
      icon: Smartphone,
      status: stage2Complete ? "unlocked" : "locked",
      current: stage1Complete ? Math.min(user.totalRecruits - 6, 6) : 0,
      max: 6
    },
    {
      stage: 3,
      requirement: "6 Stage 2 completers",
      reward: "R1,500 + R10,000 Voucher",
      icon: Gift,
      status: stage3Complete ? "unlocked" : "locked",
      current: stage2Complete ? Math.min(user.totalRecruits - 12, 6) : 0,
      max: 6
    },
    {
      stage: 4,
      requirement: "6 Stage 3 completers",
      reward: "R6,000 + R25,000 Voucher",
      icon: Gift,
      status: stage4Complete ? "unlocked" : "locked",
      current: stage3Complete ? Math.min(user.totalRecruits - 18, 6) : 0,
      max: 6
    },
    {
      stage: 5,
      requirement: "6 Stage 4 completers",
      reward: "R9,000 + R50,000 Voucher",
      icon: Gift,
      status: stage5Complete ? "unlocked" : "locked",
      current: stage4Complete ? Math.min(user.totalRecruits - 24, 6) : 0,
      max: 6
    },
    {
      stage: 6,
      requirement: "6 Stage 5 completers",
      reward: "R12,000 + R150,000 Voucher",
      icon: Gift,
      status: stage6Complete ? "unlocked" : "locked",
      current: stage5Complete ? Math.min(user.totalRecruits - 30, 6) : 0,
      max: 6
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Incentive Wallet</h1>
        <p className="text-muted-foreground">Extra bonuses - Cash rewards, Samsung smartphones, and premium vouchers</p>
        <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>How to purchase e-pins:</strong> Buy a R250 voucher at any retail store (Pep, Shoprite, Boxer, Game, Makro, Pick n Pay) and send the voucher code to Admin via WhatsApp. You'll receive an e-pin to register new accounts.
          </p>
        </div>
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
            Complete stages to unlock amazing rewards. Each stage unlocks automatically when you reach the required members.
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
                      <h3 className="font-semibold">Stage {stage.stage}</h3>
                      <p className="text-sm text-muted-foreground">{stage.requirement}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={stage.status === "unlocked" ? "default" : "outline"}
                  >
                    {stage.status === "unlocked" ? "Unlocked" : "Locked"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-primary">{stage.reward}</span>
                  <span className="text-sm text-muted-foreground">
                    {stage.current}/{stage.max} members
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stage.current / stage.max) * 100}%` }}
                  ></div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={stage.status !== "unlocked"}
                >
                  {stage.status === "unlocked" ? "Claim Reward" : "Complete Stage to Unlock"}
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
                <p>• Stage 1: R600 Cash (6 members)</p>
                <p>• Stage 2: R1,200 + Samsung Smartphone (6 Stage 1 completers)</p>
                <p>• Stage 3: R1,500 + R10,000 Voucher (6 Stage 2 completers)</p>
                <p>• Stage 4: R6,000 + R25,000 Voucher (6 Stage 3 completers)</p>
                <p>• Stage 5: R9,000 + R50,000 Voucher (6 Stage 4 completers)</p>
                <p>• Stage 6: R12,000 + R150,000 Voucher (6 Stage 5 completers)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncentiveWallet;
