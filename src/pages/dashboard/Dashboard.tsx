import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { MembershipCard } from "@/components/MembershipCard";
import { 
  Users, 
  TrendingUp, 
  Wallet, 
  Award,
  Eye,
  UserPlus,
  ArrowUpRight,
  Calendar,
  Target
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Calculate matrix progress (mock data for now)
  const matrixProgress = (user.level / 8) * 100;
  const nextLevelRecruits = Math.max(0, 2 - user.directRecruits);

  return (
    <div className="space-y-6">
      {/* Membership Card at Top */}
      <div className="flex justify-center mb-6">
        <MembershipCard user={user} />
      </div>

      {/* User Info Below Card */}
      <div className="text-center mb-6">
        <Badge variant="secondary" className="text-sm mb-2">
          Username: {user.username}
        </Badge>
        <span className="mx-2">•</span>
        <Badge variant="secondary" className="text-sm">
          Member ID: {user.memberId}
        </Badge>
      </div>

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user.fullName.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's your Breadwinners dashboard overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="text-sm bg-gradient-to-r from-primary to-accent">
            Stage {user.stage} • Level {user.level}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R{((user.directRecruits + user.totalRecruits) * 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              R100 per recruit
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Direct Recruits
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {user.directRecruits}/6
            </div>
            <p className="text-xs text-muted-foreground">
              {user.directRecruits < 6 ? `${6 - user.directRecruits} more for Stage 1` : 'Stage 1 Complete!'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Matrix Level
            </CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Level {user.level}
            </div>
            <p className="text-xs text-muted-foreground">
              {user.level < 8 ? `Next: Level ${user.level + 1}` : 'Maximum level reached!'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Network
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {user.totalRecruits}
            </div>
            <p className="text-xs text-muted-foreground">
              All levels combined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Matrix Progress & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matrix Progress */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Matrix Progress
            </CardTitle>
            <CardDescription>
              Your progress through the 8-level matrix system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level {user.level} of 8</span>
                <span>{matrixProgress.toFixed(0)}% Complete</span>
              </div>
              <Progress value={matrixProgress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="text-xl font-bold text-primary">R{((user.directRecruits + user.totalRecruits) * 100).toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Total Earnings</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-xl font-bold text-primary">
                  {(() => {
                    const withdrawalHistory = JSON.parse(localStorage.getItem(`withdrawalHistory_${user.memberId}`) || '[]');
                    const completedWithdrawals = withdrawalHistory.filter((w: any) => w.status === 'completed');
                    return completedWithdrawals.length > 0 ? 'Completed' : (withdrawalHistory.some((w: any) => w.status === 'pending') ? 'Pending' : 'R0');
                  })()}
                </div>
                <div className="text-xs text-muted-foreground">Payouts</div>
              </div>
            </div>

            <Button className="w-full" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Full Matrix
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start h-12" variant="outline">
              <UserPlus className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Recruit New Member</div>
                <div className="text-xs text-muted-foreground">Share your referral link</div>
              </div>
              <ArrowUpRight className="h-4 w-4 ml-auto" />
            </Button>

            <Button className="w-full justify-start h-12" variant="outline">
              <Wallet className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Check E-Wallet</div>
                <div className="text-xs text-muted-foreground">View balance & transactions</div>
              </div>
              <ArrowUpRight className="h-4 w-4 ml-auto" />
            </Button>

            <Button className="w-full justify-start h-12" variant="outline">
              <TrendingUp className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Income Report</div>
                <div className="text-xs text-muted-foreground">Detailed earnings breakdown</div>
              </div>
              <ArrowUpRight className="h-4 w-4 ml-auto" />
            </Button>

            <Button className="w-full justify-start h-12" variant="outline">
              <Users className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Team Report</div>
                <div className="text-xs text-muted-foreground">Monitor your network</div>
              </div>
              <ArrowUpRight className="h-4 w-4 ml-auto" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest actions and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <div className="font-medium">Account Created</div>
                  <div className="text-sm text-muted-foreground">
                    Welcome to Breadwinners Family Society
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(user.joinDate).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                <div>
                  <div className="font-medium">Matrix Level {user.level}</div>
                  <div className="text-sm text-muted-foreground">
                    Current position in matrix system
                  </div>
                </div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            {user.directRecruits === 0 && (
              <div className="text-center p-6 rounded-lg bg-primary/5 border border-primary/20">
                <UserPlus className="h-12 w-12 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-foreground mb-2">Ready to grow your network?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start recruiting 6 members to complete Stage 1 and earn R600 (R100 x 6)!
                </p>
                <Button className="bg-gradient-to-r from-primary to-accent">
                  Start Recruiting
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;