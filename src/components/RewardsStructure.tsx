import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Gift, CreditCard, Banknote } from "lucide-react";

const rewardsData = [
  {
    stage: 1,
    title: "Stage 1 - Silver",
    requirement: "Invite 6 Friends",
    reward: "R600",
    calculation: "R100 x 6",
    color: "from-gray-400 to-gray-600",
    icon: <CreditCard className="h-5 w-5" />,
    bonus: null
  },
  {
    stage: 2,
    title: "Stage 2 - Gold", 
    requirement: "14 Members Complete Stage 1",
    reward: "R2,100",
    calculation: "R150 x 14",
    color: "from-yellow-400 to-yellow-600",
    icon: <Smartphone className="h-5 w-5" />,
    bonus: "Samsung A04s Smartphone"
  },
  {
    stage: 3,
    title: "Stage 3 - Platinum",
    requirement: "14 Members Complete Stage 2", 
    reward: "R2,520",
    calculation: "R180 x 14",
    color: "from-gray-300 to-gray-500",
    icon: <Gift className="h-5 w-5" />,
    bonus: "R10,000 Card Voucher or Cash"
  },
  {
    stage: 4,
    title: "Stage 4 - Titanium",
    requirement: "14 Members Complete Stage 3",
    reward: "R14,000", 
    calculation: "R1,000 x 14",
    color: "from-gray-600 to-gray-800",
    icon: <Banknote className="h-5 w-5" />,
    bonus: "R25,000 Card Voucher or Cash"
  },
  {
    stage: 5,
    title: "Stage 5 - Diamond",
    requirement: "14 Members Complete Stage 4",
    reward: "R21,000", 
    calculation: "R1,500 x 14",
    color: "from-cyan-400 to-blue-600",
    icon: <Gift className="h-5 w-5" />,
    bonus: "R50,000 Card Voucher or Cash"
  },
  {
    stage: 6,
    title: "Stage 6 - Elite",
    requirement: "14 Members Complete Stage 5",
    reward: "R28,000", 
    calculation: "R2,000 x 14",
    color: "from-purple-500 to-pink-600",
    icon: <Banknote className="h-5 w-5" />,
    bonus: "R150,000 Card Voucher or Cash"
  }
];

export const RewardsStructure = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-foreground mb-4">Rewards Structure</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewardsData.map((stage) => (
          <Card key={stage.stage} className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stage.color} text-white`}>
                    {stage.icon}
                  </div>
                  <span className="text-lg">{stage.title}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Stage {stage.stage}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Requirement:</p>
                <p className="font-medium">{stage.requirement}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cash Reward:</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{stage.reward}</span>
                  <span className="text-sm text-muted-foreground">({stage.calculation})</span>
                </div>
              </div>

              {stage.bonus && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Bonus:</p>
                  <p className="font-medium text-accent">{stage.bonus}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">Membership Fee</span>
          </div>
          <p className="text-lg font-bold">R250 once-off payment</p>
          <p className="text-sm text-muted-foreground">Join the Breadwinners Family and start earning!</p>
        </CardContent>
      </Card>
    </div>
  );
};