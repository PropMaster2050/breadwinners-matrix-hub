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
