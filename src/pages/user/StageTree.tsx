import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

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

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const viewMemberNetwork = (memberId: string) => {
    // Navigate to view this member's network tree
    navigate(`/network/member/${memberId}/stage/${stageNumber}`);
  };

  // Render recursive tree structure with animations and interactivity
  const renderTreeNode = (member: any, level: number = 0, parentId: string = "") => {
    const nodeId = `${parentId}-${member.id}`;
    const isExpanded = expandedNodes.has(nodeId) || level === 0;
    const hasDownlines = member.downlines && member.downlines.length > 0;
    const canExpand = hasDownlines && level > 0;

    return (
      <div 
        key={nodeId} 
        className="relative flex flex-col items-center animate-fade-in"
        style={{ animationDelay: `${level * 100}ms` }}
      >
        {/* Connecting line from parent (only if not root level) */}
        {level > 0 && (
          <div 
            className="absolute -top-8 left-1/2 w-0.5 h-8 bg-warning transition-all duration-300" 
            style={{ transform: 'translateX(-50%)' }}
          />
        )}
        
        {/* Member Node - Clickable Card */}
        <div 
          className="relative bg-card border-4 border-warning rounded-lg p-4 w-44 text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 group"
          onClick={() => viewMemberNetwork(member.memberId)}
        >
          {/* Expand/Collapse button for nodes with children */}
          {canExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(nodeId);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors z-10"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}

          {/* Avatar/Icon at top */}
          <div className="mb-2 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center ring-2 ring-warning group-hover:ring-4 transition-all duration-300">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          
          {/* Stage Label */}
          <div className="text-xs font-bold text-warning mb-1">STAGE {stageNumber}</div>
          
          {/* Member ID */}
          <div className="text-sm font-semibold text-foreground mb-1">{member.memberId}</div>
          
          {/* Member Name */}
          <div className="text-xs text-muted-foreground truncate">{member.name}</div>

          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">View Network</span>
          </div>
        </div>

        {/* Children section with animation */}
        {hasDownlines && isExpanded && (
          <div className="animate-scale-in">
            {/* Vertical connecting line */}
            <div className="w-0.5 h-8 bg-warning mx-auto" />
            
            <div className="relative flex gap-12 mt-0">
              {/* Horizontal line connecting siblings */}
              {member.downlines.length > 1 && (
                <div 
                  className="absolute top-0 h-0.5 bg-warning transition-all duration-300" 
                  style={{ 
                    left: '50%',
                    right: '50%',
                    width: `${(member.downlines.length - 1) * 12}rem`,
                    transform: 'translateX(-50%)'
                  }}
                />
              )}
              
              {/* Render children nodes */}
              {member.downlines.map((downline: any) => renderTreeNode(downline, level + 1, nodeId))}
              
              {/* Show empty slots for 2x2 matrix */}
              {level === 0 && member.downlines.length < 2 && (
                <>
                  {[...Array(2 - member.downlines.length)].map((_, index) => (
                    <div key={`empty-${index}`} className="relative flex flex-col items-center animate-fade-in">
                      <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-warning/50" style={{ transform: 'translateX(-50%)' }} />
                      <div className="bg-muted/50 border-4 border-dashed border-border rounded-lg p-4 w-44 text-center">
                        <div className="mb-2 flex justify-center">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-6 w-6 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="text-xs font-bold text-muted-foreground mb-1">STAGE {stageNumber}</div>
                        <div className="text-xs text-muted-foreground">Empty Slot</div>
                        <div className="text-xs text-muted-foreground mt-1">Position {member.downlines.length + index + 1}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getStageRequirement = (stageNum: number) => {
    switch(stageNum) {
      case 1: return "2×2 Matrix: 6 members total (2 direct recruits, each with 2 of their own)";
      case 2: return "Stage 2: 14 members from Stage 1 must complete their Stage 1 (14×6 = 84 members)";
      case 3: return "Stage 3: 14 members from Stage 2 must complete their Stage 2 (168 members)";
      case 4: return "Stage 4: 14 members from Stage 3 must complete their Stage 3 (336 members)";
      default: return "";
    }
  };

  const getStageProgress = (stageNum: number) => {
    const total = user.totalRecruits;
    switch(stageNum) {
      case 1: return { current: Math.min(total, 6), required: 6 };
      case 2: return { current: Math.min(Math.max(0, total - 6), 84), required: 84 };
      case 3: return { current: Math.min(Math.max(0, total - 90), 168), required: 168 };
      case 4: return { current: Math.min(Math.max(0, total - 258), 336), required: 336 };
      default: return { current: 0, required: 0 };
    }
  };

  const isStageComplete = (stageNum: number) => {
    switch(stageNum) {
      case 1: return user.directRecruits >= 2 && user.totalRecruits >= 6;
      case 2: return user.totalRecruits >= 90; // 6 from Stage 1 + 84 new
      case 3: return user.totalRecruits >= 258; // 90 from Stage 2 + 168 new
      case 4: return user.totalRecruits >= 594; // 258 from Stage 3 + 336 new
      default: return false;
    }
  };

  const isLocked = isStageComplete(stageNumber);
  const progress = getStageProgress(stageNumber);
  const progressPercentage = (progress.current / progress.required) * 100;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="outline" onClick={() => navigate('/network')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Network
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Stage {stageNumber} Tree</h1>
          <p className="text-sm text-muted-foreground">{getStageRequirement(stageNumber)}</p>
        </div>
        {isLocked ? (
          <Badge className="bg-success text-white">
            ✓ Stage Complete - Locked
          </Badge>
        ) : (
          <Badge variant="secondary">
            {progress.current} / {progress.required} Members
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      {!isLocked && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stage Progress</span>
                <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {progress.required - progress.current} more members needed to complete Stage {stageNumber}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {stageNumber === 1 ? "Stage 1: 2×2 Binary Matrix (6 Members)" : 
             stageNumber === 2 ? "Stage 2: 14×6 Matrix (84 Members)" : 
             stageNumber === 3 ? "Stage 3: Extended Matrix (168 Members)" : 
             "Stage 4: Full Matrix (336 Members)"}
          </CardTitle>
          <CardDescription>
            Your Stage {stageNumber} genealogy tree structure • Click any member to view their network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6 p-6 overflow-x-auto">
            {/* Your Position - Root Node */}
            <div className="relative bg-gradient-to-br from-primary to-accent border-4 border-warning rounded-lg p-6 w-52 text-center shadow-xl animate-fade-in">
              <div className="mb-3 flex justify-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-warning">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="text-sm font-bold text-warning mb-1">STAGE {stageNumber}</div>
              <div className="text-base font-semibold text-white mb-1">{user.memberId}</div>
              <div className="text-sm text-white/90">{user.fullName}</div>
              <Badge className="mt-2 bg-white/20 text-white border-0">YOU</Badge>
            </div>

            {/* Vertical connector from root */}
            {networkData.length > 0 && (
              <div className="w-0.5 h-8 bg-warning" />
            )}

            {/* Network Tree */}
            {networkData.length > 0 ? (
              <div className="relative">
                {/* Horizontal line connecting direct recruits */}
                {networkData.length > 1 && (
                  <div 
                    className="absolute -top-8 h-0.5 bg-warning transition-all duration-300" 
                    style={{ 
                      left: '50%',
                      right: '50%',
                      width: `${(networkData.length - 1) * 12}rem`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                )}
                <div className="flex gap-12 justify-center flex-wrap">
                  {networkData.map((member: any) => renderTreeNode(member, 1))}
                  
                  {/* Show empty slots for incomplete 2x2 matrix */}
                  {stageNumber === 1 && networkData.length < 2 && (
                    <>
                      {[...Array(2 - networkData.length)].map((_, index) => (
                        <div key={`empty-direct-${index}`} className="relative flex flex-col items-center animate-fade-in">
                          <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-warning/50" style={{ transform: 'translateX(-50%)' }} />
                          <div className="bg-muted/50 border-4 border-dashed border-border rounded-lg p-4 w-44 text-center">
                            <div className="mb-2 flex justify-center">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                <Users className="h-6 w-6 text-muted-foreground" />
                              </div>
                            </div>
                            <div className="text-xs font-bold text-muted-foreground mb-1">STAGE {stageNumber}</div>
                            <div className="text-xs text-muted-foreground">Empty Slot</div>
                            <div className="text-xs text-muted-foreground mt-1">Position {networkData.length + index + 1}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No members in Stage {stageNumber} yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start recruiting to build your Stage {stageNumber} network
                </p>
                <p className="text-sm text-muted-foreground">
                  💡 Tip: Each user can recruit exactly 2 direct members. Extra recruits will automatically spillover to the next available position.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isLocked && stageNumber < 4 && (
        <Card className="border-success bg-success/10 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              ✓ Stage {stageNumber} Complete!
            </CardTitle>
            <CardDescription className="text-foreground">
              Congratulations! You've completed all requirements for Stage {stageNumber}. This stage is now locked and you can proceed to the next stage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate(`/network/stage/${stageNumber + 1}`)}
              className="bg-success hover:bg-success/90 text-white"
            >
              View Stage {stageNumber + 1} Tree →
            </Button>
          </CardContent>
        </Card>
      )}

      {isLocked && stageNumber === 4 && (
        <Card className="border-success bg-success/10 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              🎉 All Stages Complete!
            </CardTitle>
            <CardDescription className="text-foreground">
              Amazing! You've completed all 4 stages of the binary matrix system. You've built a massive network!
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default StageTree;
