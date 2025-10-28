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
  Target,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const copyMemberId = () => {
    navigator.clipboard.writeText(user.memberId);
    setCopied(true);
    toast({
      title: "Copied!",
      description: `Member ID ${user.memberId} copied to clipboard`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Get latest user data for accurate calculations
  const allUsers = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
  const currentUserData = allUsers.find((u: any) => u.memberId === user.memberId) || user;
  
  // Calculate Stage 1 members (2 directs + their recruits, max 6)
  const countStage1Members = () => {
    if (!currentUserData.downlines) return 0;
    
    let count = 0;
    const directRecruits = currentUserData.downlines.filter((d: any) => d.level === 1).slice(0, 2);
    count += directRecruits.length;
    
    // Count their recruits (second level)
    directRecruits.forEach((direct: any) => {
      const directUser = allUsers.find((u: any) => u.memberId === direct.memberId);
      if (directUser?.downlines) {
        const secondLevel = directUser.downlines.filter((d: any) => d.level === 1).slice(0, 2);
        count += secondLevel.length;
      }
    });
    
    return Math.min(count, 6);
  };
  
  const stage1Members = countStage1Members();
  const stage1Complete = stage1Members === 6;
  const currentStageEarnings = stage1Members * 100;
  const matrixProgress = (currentUserData.stage / 4) * 100;

  return (
    <div className="space-y-6">
      {/* Membership Card at Top */}
      <div className="flex justify-center mb-6">
        <MembershipCard user={user} />
      </div>

      {/* User Info Below Card */}
      <div className="text-center mb-6 space-y-3">
        <Badge variant="secondary" className="text-sm">
          Username: {user.username}
        </Badge>
        
        {/* Prominent Member ID with Copy Button */}
        <div className="flex items-center justify-center gap-2">
          <div className="bg-primary/10 border-2 border-primary/30 rounded-lg px-6 py-3 flex items-center gap-3">
            <div className="text-left">
              <p className="text-xs text-muted-foreground font-medium">Your Member ID</p>
              <p className="text-2xl font-bold text-primary tracking-wide">{user.memberId}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyMemberId}
              className="hover:bg-primary/20"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 text-primary" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Share this ID with people you recruit</p>
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
            Stage {currentUserData.stage}
          </Badge>
          {stage1Complete && (
            <Badge className="text-sm bg-success text-white">
              ✓ Stage 1 Complete
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Stage
            </CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Stage {currentUserData.stage}
            </div>
            <p className="text-xs text-muted-foreground">
              {stage1Complete ? 'Ready for Stage 2' : 'Building your matrix'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stage {currentUserData.stage} Members
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stage1Members}/6
            </div>
            <p className="text-xs text-muted-foreground">
              {stage1Complete ? 'Stage Complete!' : `${6 - stage1Members} more needed`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stage {currentUserData.stage} Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R{currentStageEarnings.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              R100 × {stage1Members} members
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R{currentStageEarnings.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              All stages combined
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
                <span>Stage {currentUserData.stage} of 4</span>
                <span>{matrixProgress.toFixed(0)}% Complete</span>
              </div>
              <Progress value={matrixProgress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="text-xl font-bold text-primary">{stage1Members}/6</div>
                <div className="text-xs text-muted-foreground">Members in Stage {currentUserData.stage}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-xl font-bold text-primary">
                  {(() => {
                    const withdrawalHistory = JSON.parse(localStorage.getItem(`withdrawalHistory_${user.memberId}`) || '[]');
                    const completedWithdrawals = withdrawalHistory.filter((w: any) => w.status === 'completed');
                    return completedWithdrawals.length;
                  })()}
                </div>
                <div className="text-xs text-muted-foreground">Successful Payouts</div>
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

            {stage1Members === 0 && (
              <div className="text-center p-6 rounded-lg bg-primary/5 border border-primary/20">
                <UserPlus className="h-12 w-12 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-foreground mb-2">Ready to grow your network?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Build your 2×2 matrix: Recruit 2 members, they each recruit 2 = 6 total = R600!
                </p>
                <Button className="bg-gradient-to-r from-primary to-accent">
                  Start Recruiting
                </Button>
              </div>
            )}
            
            {stage1Complete && (
              <div className="text-center p-6 rounded-lg bg-success/10 border border-success">
                <Award className="h-12 w-12 mx-auto mb-3 text-success" />
                <h3 className="font-semibold text-foreground mb-2">🎉 Stage 1 Complete!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Congratulations! You've earned R600 from your Stage 1 matrix. Ready for Stage 2?
                </p>
                <Button className="bg-success hover:bg-success/90 text-white">
                  View Stage 2
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