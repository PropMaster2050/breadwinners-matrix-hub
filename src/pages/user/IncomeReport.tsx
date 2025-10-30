import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    
    // Stage 2-6: Each needs 14 completions (2x3 matrix)
    const stage2Progress = stage1Complete ? Math.min(incomeData.spillovers, 14) : 0;
    const stage2Complete = stage2Progress >= 14;
    
    const stage3Progress = stage2Complete ? Math.min(incomeData.spillovers - 14, 14) : 0;
    const stage3Complete = stage3Progress >= 14;
    
    const stage4Progress = stage3Complete ? Math.min(incomeData.spillovers - 28, 14) : 0;
    const stage4Complete = stage4Progress >= 14;
    
    const stage5Progress = stage4Complete ? Math.min(incomeData.spillovers - 42, 14) : 0;
    const stage5Complete = stage5Progress >= 14;
    
    const stage6Progress = stage5Complete ? Math.min(incomeData.spillovers - 56, 14) : 0;
    
    return {
      stage1: { members: stage1Progress, complete: stage1Complete, required: 6, rate: 100 },
      stage2: { members: stage2Progress, complete: stage2Complete, required: 14, rate: 150 },
      stage3: { members: stage3Progress, complete: stage3Complete, required: 14, rate: 180 },
      stage4: { members: stage4Progress, complete: stage4Complete, required: 14, rate: 1000 },
      stage5: { members: stage5Progress, complete: stage5Complete, required: 14, rate: 1500 },
      stage6: { members: stage6Progress, complete: false, required: 14, rate: 2000 }
    };
  };

  const progress = calculateStageProgress();

  const stageData = [
    {
      stage: 1,
      description: "6 Network Members (2x2 Matrix)",
      members: progress.stage1.members,
      rate: progress.stage1.rate,
      earned: progress.stage1.members * progress.stage1.rate,
      status: progress.stage1.complete ? "Completed" : "In Progress...",
      required: progress.stage1.required
    },
    {
      stage: 2,
      description: "14 Downlines Complete Stage 1 (2x3 Matrix)",
      members: progress.stage2.members,
      rate: progress.stage2.rate,
      earned: progress.stage2.members * progress.stage2.rate,
      status: progress.stage1.complete ? (progress.stage2.complete ? "Completed" : "In Progress...") : "Locked",
      required: progress.stage2.required
    },
    {
      stage: 3,
      description: "14 Downlines Complete Stage 2 (2x3 Matrix)",
      members: progress.stage3.members,
      rate: progress.stage3.rate,
      earned: progress.stage3.members * progress.stage3.rate,
      status: progress.stage2.complete ? (progress.stage3.complete ? "Completed" : "In Progress...") : "Locked",
      required: progress.stage3.required
    },
    {
      stage: 4,
      description: "14 Downlines Complete Stage 3 (2x3 Matrix)",
      members: progress.stage4.members,
      rate: progress.stage4.rate,
      earned: progress.stage4.members * progress.stage4.rate,
      status: progress.stage3.complete ? (progress.stage4.complete ? "Completed" : "In Progress...") : "Locked",
      required: progress.stage4.required
    },
    {
      stage: 5,
      description: "14 Downlines Complete Stage 4 (2x3 Matrix)",
      members: progress.stage5.members,
      rate: progress.stage5.rate,
      earned: progress.stage5.members * progress.stage5.rate,
      status: progress.stage4.complete ? (progress.stage5.complete ? "Completed" : "In Progress...") : "Locked",
      required: progress.stage5.required
    },
    {
      stage: 6,
      description: "14 Downlines Complete Stage 5 (2x3 Matrix)",
      members: progress.stage6.members,
      rate: progress.stage6.rate,
      earned: progress.stage6.members * progress.stage6.rate,
      status: progress.stage5.complete ? (progress.stage6.complete ? "Completed" : "In Progress...") : "Locked",
      required: progress.stage6.required
    }
  ];

  // Prepare chart data
  const chartData = stageData.map(stage => ({
    name: `Stage ${stage.stage}`,
    earnings: stage.earned,
    status: stage.status
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--primary) / 0.8)', 'hsl(var(--primary) / 0.6)', 'hsl(var(--primary) / 0.4)'];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Income Report</h1>
        <p className="text-muted-foreground">Earnings per stage visualization</p>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-muted-foreground"
              />
              <YAxis 
                className="text-muted-foreground"
                tickFormatter={(value) => `R${value}`}
              />
              <Tooltip 
                formatter={(value: number) => [`R${value.toLocaleString()}`, 'Earned']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="earnings" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeReport;
