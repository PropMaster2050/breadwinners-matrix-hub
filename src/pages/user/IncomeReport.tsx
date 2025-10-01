import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Award } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

const IncomeReport = () => {
  const { user } = useAuth();
  
  // Get actual user income data
  const incomeData = {
    totalEarnings: user?.earnings || 0,
    stage1Recruits: user?.directRecruits || 0,
    stage2Spillovers: 0, // Will be calculated when spillover system is implemented
    stage3Spillovers: 0, // Will be calculated when spillover system is implemented
    monthlyIncome: 0, // Will be calculated based on current month's recruits
    lastMonthIncome: 0
  };

  const stageData = [
    {
      stage: 1,
      description: "Direct Recruits (6 members)",
      recruits: incomeData.stage1Recruits,
      ratePerMember: 100,
      totalEarned: incomeData.stage1Recruits * 100,
      status: incomeData.stage1Recruits >= 6 ? "completed" : "in-progress"
    },
    {
      stage: 2,
      description: "Stage 2 Spillover (14 members who completed Stage 1)",
      recruits: incomeData.stage2Spillovers,
      ratePerMember: 200,
      totalEarned: incomeData.stage2Spillovers * 200,
      status: incomeData.stage2Spillovers >= 14 ? "completed" : "locked"
    },
    {
      stage: 3,
      description: "Stage 3 Spillover (14 members who completed Stage 2)",
      recruits: incomeData.stage3Spillovers,
      ratePerMember: 300,
      totalEarned: incomeData.stage3Spillovers * 300,
      status: "locked"
    },
    {
      stage: 4,
      description: "Stage 4 Spillover (14 members who completed Stage 3)",
      recruits: 0,
      ratePerMember: 1000,
      totalEarned: 0,
      status: "locked"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Income Report</h1>
        <p className="text-muted-foreground">Track your voucher rewards earned per stage</p>
      </div>

      {/* Income Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{incomeData.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time earnings
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
              {incomeData.monthlyIncome >= incomeData.lastMonthIncome ? "+" : ""}
              {incomeData.monthlyIncome - incomeData.lastMonthIncome} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recruits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incomeData.stage1Recruits + incomeData.stage2Spillovers + incomeData.stage3Spillovers}</div>
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
            Stage 1: R100 per recruit | Stage 2: R200 | Stage 3: R300 | Stage 4: R1000 per spillover
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
                      stage.status === "completed" ? "default" : 
                      stage.status === "in-progress" ? "secondary" : 
                      "outline"
                    }
                  >
                    {stage.status === "completed" ? "Completed" : 
                     stage.status === "in-progress" ? "In Progress" : 
                     "Locked"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Members</p>
                    <p className="font-semibold">{stage.recruits}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rate</p>
                    <p className="font-semibold">R{stage.ratePerMember}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Earned</p>
                    <p className="font-semibold">R{stage.totalEarned.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Progress</p>
                    <p className="font-semibold">
                      {stage.stage === 1 ? `${stage.recruits}/6` : 
                       stage.stage === 2 ? `${stage.recruits}/14` : 
                       `${stage.recruits}/14`}
                    </p>
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
                Recruit your first 6 members to earn R100 each and complete Stage 1 (R600 total).
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeReport;