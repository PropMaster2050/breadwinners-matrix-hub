import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Users } from "lucide-react";

const StageTree = () => {
  const { stage } = useParams<{ stage: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  const stageNumber = parseInt(stage || "1");
  
  // Mock network data - in a real app, this would come from API based on stage
  const getNetworkForStage = (stageNum: number) => {
    // For demonstration, showing different structures based on stage
    const baseNetwork = JSON.parse(localStorage.getItem(`network_${user.memberId}_stage${stageNum}`) || '[]');
    return baseNetwork;
  };

  const networkData = getNetworkForStage(stageNumber);

  // Render recursive tree structure
  const renderTreeNode = (member: any, level: number = 0) => {
    return (
      <div key={member.id} className="flex flex-col items-center">
        <div className="text-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold mb-2 ${
            member.recruits >= (stageNumber === 1 ? 6 : stageNumber === 2 ? 84 : stageNumber === 3 ? 168 : 336)
              ? 'bg-green-100 border-2 border-green-500 text-green-800' 
              : 'bg-blue-100 border-2 border-blue-500 text-blue-800'
          }`}>
            {member.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div className="text-xs">
            <div className="font-medium">{member.name}</div>
            <div className="text-muted-foreground">{member.memberId}</div>
            <Badge variant="secondary" className="mt-1 text-xs">
              {member.recruits} recruits
            </Badge>
          </div>
        </div>

        {member.downlines && member.downlines.length > 0 && (
          <div className="flex gap-8 mt-4">
            {member.downlines.map((downline: any) => renderTreeNode(downline, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getStageRequirement = (stageNum: number) => {
    switch(stageNum) {
      case 1: return "6 members (2 direct, each with 2)";
      case 2: return "84 members (14 x Stage 1 complete)";
      case 3: return "168 indirect downlines";
      case 4: return "336 indirect downlines";
      default: return "";
    }
  };

  const isStageComplete = (stageNum: number) => {
    switch(stageNum) {
      case 1: return user.directRecruits >= 2 && user.totalRecruits >= 6;
      case 2: return user.totalRecruits >= 84;
      case 3: return user.totalRecruits >= 168;
      case 4: return user.totalRecruits >= 336;
      default: return false;
    }
  };

  const isLocked = isStageComplete(stageNumber);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/network')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Network
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stage {stageNumber} Tree</h1>
          <p className="text-muted-foreground">{getStageRequirement(stageNumber)}</p>
        </div>
        {isLocked && (
          <Badge variant="default" className="ml-auto">
            Stage Completed - Locked
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {stageNumber === 1 ? "2x2" : stageNumber === 2 ? "14x6" : stageNumber === 3 ? "168" : "336"} Matrix Structure
          </CardTitle>
          <CardDescription>
            Your Stage {stageNumber} network structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6 p-6 overflow-x-auto">
            {/* Your Position */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold mb-2">
                YOU
              </div>
              <div className="text-sm font-medium">{user.fullName}</div>
              <Badge className="text-xs mt-1">Stage {stageNumber}</Badge>
            </div>

            {/* Network Tree */}
            {networkData.length > 0 ? (
              <div className="flex gap-8 flex-wrap justify-center">
                {networkData.map((member: any) => renderTreeNode(member))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No members in Stage {stageNumber} yet</h3>
                <p className="text-muted-foreground">
                  Start recruiting to build your Stage {stageNumber} network
                </p>
              </div>
            )}

            {/* Empty Slots Indicator for Stage 1 (2x2) */}
            {stageNumber === 1 && networkData.length < 2 && (
              <div className="flex gap-8">
                {[...Array(2 - networkData.length)].map((_, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-500 flex items-center justify-center font-bold mb-2">
                      {networkData.length + index + 1}
                    </div>
                    <div className="text-xs text-muted-foreground">Empty Slot</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isLocked && (
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Stage {stageNumber} Complete!</CardTitle>
            <CardDescription className="text-green-700">
              You've completed all requirements for this stage. This stage is now locked.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate(`/network/stage/${stageNumber + 1}`)}
              className="bg-green-600 hover:bg-green-700"
            >
              View Stage {stageNumber + 1} Tree
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StageTree;
