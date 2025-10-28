import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNetworkTree } from "@/hooks/useNetworkTree";
import { StageTreeView } from "@/components/network/StageTreeView";
import { ArrowLeft, TrendingUp, Award, DollarSign, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const StageTree = () => {
  const { stage } = useParams<{ stage: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  const stageNumber = parseInt(stage || "1");
  const { networkTree, stageData, loading } = useNetworkTree(stageNumber);

  const handleMemberClick = (memberId: string) => {
    navigate(`/network/member/${memberId}/stage/${stageNumber}`);
  };

  const getStageInfo = (stageNum: number) => {
    const requirements = {
      1: "Recruit 6 members in 2×2 matrix structure",
      2: "6 recruits complete Stage 1",
      3: "6 recruits complete Stage 2",
      4: "6 recruits complete Stage 3",
      5: "6 recruits complete Stage 4",
      6: "6 recruits complete Stage 5"
    };
    return requirements[stageNum as keyof typeof requirements] || "";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const isStageComplete = stageData?.is_complete || false;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate("/network")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Stage {stageNumber} Network Market
          </h1>
          <p className="text-muted-foreground">{getStageInfo(stageNumber)}</p>
        </div>
        {isStageComplete && (
          <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2">
            <Award className="h-5 w-5 mr-2" />
            Stage Complete!
          </Badge>
        )}
      </div>

      {/* Stage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earned
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              R{stageData?.total_earned.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              R{stageData?.per_recruit_amount || 0} per recruit
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Recruits
              </CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {stageData?.completed_recruits || 0} / 6
            </div>
            <Progress 
              value={((stageData?.completed_recruits || 0) / 6) * 100} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-warning/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Network
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {stageData?.total_recruits || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active members
            </p>
          </CardContent>
        </Card>

        <Card className={`${isStageComplete ? 'border-primary bg-primary/5' : 'border-border'}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stage Status
              </CardTitle>
              <Award className={`h-4 w-4 ${isStageComplete ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isStageComplete ? 'text-primary' : 'text-muted-foreground'}`}>
              {isStageComplete ? 'Complete' : 'In Progress'}
            </div>
            {stageData?.incentive && (
              <p className="text-xs font-semibold text-primary mt-1">
                🏆 {stageData.incentive}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Network Tree Visualization */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Stage {stageNumber} Network Tree
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            2×2 Matrix Structure - Each member can have 2 direct recruits
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {networkTree.length > 0 || stageNumber === 1 ? (
            <div className="overflow-x-auto">
              <StageTreeView
                currentUser={user}
                networkTree={networkTree}
                stageNumber={stageNumber}
                onMemberClick={handleMemberClick}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                No Stage {stageNumber - 1} Completers Yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Members will appear in this stage view once they complete Stage {stageNumber - 1}.
                Help your recruits grow their networks to unlock higher stages.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Stage {stageNumber} Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary/5 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Commission Structure</h4>
              <p className="text-sm text-muted-foreground">
                Earn <span className="font-bold text-primary">R{stageData?.per_recruit_amount}</span> for each recruit who completes Stage {stageNumber - 1}
              </p>
            </div>
            <div className="bg-accent/5 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Matrix Structure</h4>
              <p className="text-sm text-muted-foreground">
                2×2 Matrix: <span className="font-bold text-accent">6 total positions</span> (2 direct + 4 indirect)
              </p>
            </div>
          </div>
          
          {stageData?.incentive && (
            <div className="bg-gradient-to-r from-warning/10 to-warning/5 border-2 border-warning/20 rounded-lg p-6 text-center">
              <Award className="h-12 w-12 text-warning mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">Stage Completion Bonus</h4>
              <p className="text-2xl font-bold text-warning mb-2">{stageData.incentive}</p>
              <p className="text-sm text-muted-foreground">
                Awarded when all 6 recruits complete Stage {stageNumber - 1}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StageTree;
