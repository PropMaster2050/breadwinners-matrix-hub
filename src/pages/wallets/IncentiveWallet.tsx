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

  // Calculate actual matrix progression for incentives
  const calculateIncentiveProgress = (directRecruits: number, totalRecruits: number) => {
    // Stage 1: 6 members (2 direct + 4 from their recruits)
    const stage1Progress = Math.min(directRecruits >= 2 ? 6 : directRecruits, 6);
    const stage1Complete = stage1Progress >= 6;
    
    // Stage 2: 14 downlines who each completed Stage 1 (14 x 6 = 84)
    const stage2Progress = stage1Complete ? Math.min(totalRecruits, 84) : 0;
    const stage2Complete = stage2Progress >= 84;
    
    // Stage 3: 168 indirect downlines
    const stage3Progress = stage2Complete ? Math.min(totalRecruits - 84, 168) : 0;
    const stage3Complete = stage3Progress >= 168;
    
    // Stage 4: 336 indirect downlines
    const stage4Progress = stage3Complete ? Math.min(totalRecruits - 252, 336) : 0;
    
    return {
      stage1: { progress: stage1Progress, complete: stage1Complete, max: 6 },
      stage2: { progress: stage2Progress, complete: stage2Complete, max: 84 },
      stage3: { progress: stage3Progress, complete: stage3Complete, max: 168 },
      stage4: { progress: stage4Progress, complete: false, max: 336 }
    };
  };

  const progress = calculateIncentiveProgress(0, 0); // Will use actual user data

  const incentiveStructure = [
    {
      stage: 1,
      requirement: "6 members (2 direct + 4 indirect)",
      reward: "R600 Cash Reward",
      icon: Gift,
      status: progress.stage1.complete ? "unlocked" : "locked",
      current: progress.stage1.progress,
      max: progress.stage1.max
    },
    {
      stage: 2,
      requirement: "14 downlines × Stage 1 complete (84 members)",
      reward: "Samsung Smartphone",
      icon: Smartphone,
      status: progress.stage2.complete ? "unlocked" : "locked",
      current: progress.stage2.progress,
      max: progress.stage2.max
    },
    {
      stage: 3,
      requirement: "168 indirect members",
      reward: "R20,000 Voucher or Cash",
      icon: Gift,
      status: progress.stage3.complete ? "unlocked" : "locked",
      current: progress.stage3.progress,
      max: progress.stage3.max
    },
    {
      stage: 4,
      requirement: "336 indirect members",
      reward: "R100,000 Voucher or Cash",
      icon: Gift,
      status: progress.stage4.complete ? "unlocked" : "locked",
      current: progress.stage4.progress,
      max: progress.stage4.max
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
                <p>• Stage 1: R600 Cash Reward (6 members)</p>
                <p>• Stage 2: Samsung Smartphone (84 members)</p>
                <p>• Stage 3: R20,000 Voucher/Cash (168 members)</p>
                <p>• Stage 4: R100,000 Voucher/Cash (336 members)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncentiveWallet;
