import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Award } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

const IncomeReport = () => {
  const { user } = useAuth();
  
  // Get actual user income data
  const incomeData = {
    totalEarnings: user?.earnings || 0,
    directRecruits: user?.directRecruits || 0,
    spillovers: user?.totalRecruits || 0,
    monthlyIncome: 0
  };

  // Calculate actual matrix progression
  const calculateStageProgress = () => {
    // Stage 1: 6 members (2 direct + 4 from their recruits)
    const stage1Progress = Math.min(incomeData.directRecruits >= 2 ? 6 : incomeData.directRecruits, 6);
    const stage1Complete = stage1Progress >= 6;
    
    // Stage 2: 14 downlines who each completed Stage 1 = 14 x 6 = 84 members
    const stage2Progress = stage1Complete ? Math.min(incomeData.spillovers, 84) : 0;
    const stage2Complete = stage2Progress >= 84;
    
    // Stage 3: 168 indirect downlines
    const stage3Progress = stage2Complete ? Math.min(incomeData.spillovers - 84, 168) : 0;
    const stage3Complete = stage3Progress >= 168;
    
    // Stage 4: 336 indirect downlines
    const stage4Progress = stage3Complete ? Math.min(incomeData.spillovers - 252, 336) : 0;
    
    return {
      stage1: { members: stage1Progress, complete: stage1Complete, required: 6 },
      stage2: { members: stage2Progress, complete: stage2Complete, required: 84 },
      stage3: { members: stage3Progress, complete: stage3Complete, required: 168 },
      stage4: { members: stage4Progress, complete: false, required: 336 }
    };
  };

  const progress = calculateStageProgress();

  const stageData = [
    {
      stage: 1,
      description: "2 Direct Members (each with 2)",
      members: progress.stage1.members,
      rate: 100,
      earned: progress.stage1.members * 100,
      status: progress.stage1.complete ? "Completed" : "In Progress...",
      required: progress.stage1.required
    },
    {
      stage: 2,
      description: "14 Downlines × Stage 1 (6 each) = 84 members",
      members: progress.stage2.members,
      rate: 100,
      earned: progress.stage2.members * 100,
      status: progress.stage1.complete ? (progress.stage2.complete ? "Completed" : "In Progress...") : "Locked",
      required: progress.stage2.required
    },
    {
      stage: 3,
      description: "168 indirect downlines",
      members: progress.stage3.members,
      rate: 100,
      earned: progress.stage3.members * 100,
      status: progress.stage2.complete ? (progress.stage3.complete ? "Completed" : "In Progress...") : "Locked",
      required: progress.stage3.required
    },
    {
      stage: 4,
      description: "336 indirect downlines",
      members: progress.stage4.members,
      rate: 100,
      earned: progress.stage4.members * 100,
      status: progress.stage3.complete ? (progress.stage4.members >= 336 ? "Completed" : "In Progress...") : "Locked",
      required: progress.stage4.required
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Income Report</h1>
        <p className="text-muted-foreground">Track your earnings per stage with R100 per member</p>
      </div>

      {/* Income Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{(incomeData.directRecruits + incomeData.spillovers) * 100}</div>
            <p className="text-xs text-muted-foreground">
              R100 per recruit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{incomeData.monthlyIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current month income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recruits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incomeData.directRecruits + incomeData.spillovers}</div>
            <p className="text-xs text-muted-foreground">
              Across all stages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings by Stage</CardTitle>
          <CardDescription>
            R100 per member for all stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stageData.map((stage) => (
              <div key={stage.stage} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{stage.stage}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Stage {stage.stage}</h3>
                      <p className="text-sm text-muted-foreground">{stage.description}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      stage.status === "Completed" ? "default" : 
                      stage.status === "In Progress..." ? "secondary" : 
                      "outline"
                    }
                  >
                    {stage.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Progress</p>
                    <p className="font-semibold">{stage.members} / {stage.required}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Earned</p>
                    <p className="font-semibold">R{stage.earned.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-semibold capitalize">{stage.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {incomeData.totalEarnings === 0 && (
            <div className="text-center py-12 mt-8 border-t">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Earning Today!</h3>
              <p className="text-muted-foreground">
                Recruit 2 direct members (who each recruit 2) to earn R100 per member and complete Stage 1 (R600 total).
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeReport;
