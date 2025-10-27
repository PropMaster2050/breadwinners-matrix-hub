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
  
  // Get network data from user's downlines - build 2-level tree for Stage 1
  const getNetworkForStage = (stageNum: number) => {
    // Get all users from localStorage to build the tree
    const allUsers = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
    const currentUserData = allUsers.find((u: any) => u.memberId === user.memberId);
    
    if (!currentUserData?.downlines || currentUserData.downlines.length === 0) return [];
    
    // For Stage 1: Build a 2-level tree (2 directs + their 4 recruits = 6 total)
    if (stageNum === 1) {
      // Get user's direct recruits (level 1) - limited to 2 for Stage 1
      const directRecruits = currentUserData.downlines.filter((d: any) => d.level === 1).slice(0, 2);
      
      // Build tree with their downlines
      return directRecruits.map((directRecruit: any) => {
        // Find this recruit's full user data in allUsers
        const recruitUser = allUsers.find((u: any) => u.memberId === directRecruit.memberId);
        
        // Get this recruit's direct downlines (their level 1 = our level 2) - limited to 2 each
        const secondLevelRecruits = recruitUser?.downlines?.filter((d: any) => d.level === 1).slice(0, 2) || [];
        
        return {
          id: directRecruit.memberId,
          memberId: directRecruit.memberId,
          name: directRecruit.fullName,
          level: 1,
          isActive: directRecruit.isActive,
          downlines: secondLevelRecruits.map((secondLevel: any) => ({
            id: secondLevel.memberId,
            memberId: secondLevel.memberId,
            name: secondLevel.fullName,
            level: 2,
            isActive: secondLevel.isActive,
            downlines: []
          }))
        };
      });
    }
    
    // For other stages, use existing logic
    return currentUserData.downlines.map((downline: any) => ({
      id: downline.memberId,
      memberId: downline.memberId,
      name: downline.fullName,
      level: downline.level,
      isActive: downline.isActive,
      downlines: []
    }));
  };

  const networkData = getNetworkForStage(stageNumber);

  // Count all members in the tree recursively
  const countAllMembersInTree = (members: any[]): number => {
    let total = 0;
    for (const member of members) {
      total += 1;
      if (member.downlines && member.downlines.length > 0) {
        total += countAllMembersInTree(member.downlines);
      }
    }
    return total;
  };

  // Count all members in tree recursively for 2x3 matrix (3 levels deep)
  const countTreeMembers = (members: any[], maxLevels: number): number => {
    const allUsers = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
    let total = 0;
    
    const countRecursive = (memberList: any[], currentLevel: number) => {
      if (currentLevel > maxLevels) return;
      
      memberList.forEach(member => {
        total += 1;
        const memberUser = allUsers.find((u: any) => u.memberId === member.memberId);
        if (memberUser?.downlines && currentLevel < maxLevels) {
          countRecursive(memberUser.downlines, currentLevel + 1);
        }
      });
    };
    
    countRecursive(members, 1);
    return total;
  };

  // Check if a member has completed a specific stage
  const hasMemberCompletedStage = (memberId: string, stage: number): boolean => {
    const allUsers = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
    const memberData = allUsers.find((u: any) => u.memberId === memberId);
    if (!memberData) return false;
    
    // All stages use 2×2 matrix (6 members total)
    const directRecruits = memberData.downlines?.slice(0, 2) || [];
    const totalInTree = countTreeMembers(directRecruits, 2);
    return directRecruits.length === 2 && totalInTree >= 6;
  };

  // Calculate stage-specific data
  const calculateStageData = () => {
    const allUsers = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
    const currentUserData = allUsers.find((u: any) => u.memberId === user.memberId);
    
    if (stageNumber === 1) {
      const totalMembers = Math.min(6, countAllMembersInTree(networkData));
      return {
        totalMembers,
        earnings: totalMembers * 100,
        maxMembers: 6,
        earningsPerMember: 100
      };
    } else if (stageNumber === 2) {
      // Stage 2: 2×2 matrix = 6 members who completed Stage 1
      const stage1Directs = currentUserData?.downlines?.slice(0, 6) || [];
      const completedStage1Members = stage1Directs.filter((member: any) => 
        hasMemberCompletedStage(member.memberId, 1)
      );
      
      const totalMembers = completedStage1Members.length;
      const baseEarnings = totalMembers * 200;
      const isComplete = totalMembers >= 6;
      const incentive = isComplete ? "Samsung Smartphone" : null;
      const bonusCash = isComplete ? 1200 : baseEarnings;
      
      return {
        totalMembers,
        earnings: bonusCash,
        maxMembers: 6,
        earningsPerMember: 200,
        completedMembers: completedStage1Members,
        incentive,
        isComplete
      };
    } else if (stageNumber === 3) {
      // Stage 3: 6 members who completed Stage 2
      let allNetworkMembers: any[] = [];
      const getDeepNetwork = (members: any[], depth: number = 0) => {
        if (depth > 10) return;
        members.forEach((m: any) => {
          const memberUser = allUsers.find((u: any) => u.memberId === m.memberId);
          if (memberUser?.downlines) {
            allNetworkMembers.push(...memberUser.downlines.map((d: any) => ({
              ...d,
              parentId: m.memberId,
              depth: depth + 1
            })));
            getDeepNetwork(memberUser.downlines, depth + 1);
          }
        });
      };
      getDeepNetwork(currentUserData?.downlines || []);
      
      const completedStage2Members = allNetworkMembers
        .filter((m: any) => hasMemberCompletedStage(m.memberId, 2))
        .slice(0, 6);
      
      const totalMembers = completedStage2Members.length;
      const baseEarnings = totalMembers * 250;
      const isComplete = totalMembers >= 6;
      const bonusCash = isComplete ? 1500 : baseEarnings;
      const incentive = isComplete ? "R10,000 Voucher" : null;
      
      return {
        totalMembers,
        earnings: bonusCash,
        maxMembers: 6,
        earningsPerMember: 250,
        completedMembers: completedStage2Members,
        incentive,
        isComplete
      };
    } else if (stageNumber === 4) {
      // Stage 4: 6 members who completed Stage 3
      let allNetworkMembers: any[] = [];
      const getDeepNetwork = (members: any[], depth: number = 0) => {
        if (depth > 10) return;
        members.forEach((m: any) => {
          const memberUser = allUsers.find((u: any) => u.memberId === m.memberId);
          if (memberUser?.downlines) {
            allNetworkMembers.push(...memberUser.downlines.map((d: any) => ({
              ...d,
              parentId: m.memberId,
              depth: depth + 1
            })));
            getDeepNetwork(memberUser.downlines, depth + 1);
          }
        });
      };
      getDeepNetwork(currentUserData?.downlines || []);
      
      const completedStage3Members = allNetworkMembers
        .filter((m: any) => hasMemberCompletedStage(m.memberId, 3))
        .slice(0, 6);
      
      const totalMembers = completedStage3Members.length;
      const baseEarnings = totalMembers * 1000;
      const isComplete = totalMembers >= 6;
      const bonusCash = isComplete ? 6000 : baseEarnings;
      const incentive = isComplete ? "R25,000 Voucher" : null;
      
      return {
        totalMembers,
        earnings: bonusCash,
        maxMembers: 6,
        earningsPerMember: 1000,
        completedMembers: completedStage3Members,
        incentive,
        isComplete
      };
    } else if (stageNumber === 5) {
      // Stage 5: 6 members who completed Stage 4
      let allNetworkMembers: any[] = [];
      const getDeepNetwork = (members: any[], depth: number = 0) => {
        if (depth > 10) return;
        members.forEach((m: any) => {
          const memberUser = allUsers.find((u: any) => u.memberId === m.memberId);
          if (memberUser?.downlines) {
            allNetworkMembers.push(...memberUser.downlines.map((d: any) => ({
              ...d,
              parentId: m.memberId,
              depth: depth + 1
            })));
            getDeepNetwork(memberUser.downlines, depth + 1);
          }
        });
      };
      getDeepNetwork(currentUserData?.downlines || []);
      
      const completedStage4Members = allNetworkMembers
        .filter((m: any) => hasMemberCompletedStage(m.memberId, 4))
        .slice(0, 6);
      
      const totalMembers = completedStage4Members.length;
      const baseEarnings = totalMembers * 1500;
      const isComplete = totalMembers >= 6;
      const bonusCash = isComplete ? 9000 : baseEarnings;
      const incentive = isComplete ? "R50,000 Voucher" : null;
      
      return {
        totalMembers,
        earnings: bonusCash,
        maxMembers: 6,
        earningsPerMember: 1500,
        completedMembers: completedStage4Members,
        incentive,
        isComplete
      };
    } else if (stageNumber === 6) {
      // Stage 6: 6 members who completed Stage 5 (Final Stage)
      let allNetworkMembers: any[] = [];
      const getDeepNetwork = (members: any[], depth: number = 0) => {
        if (depth > 10) return;
        members.forEach((m: any) => {
          const memberUser = allUsers.find((u: any) => u.memberId === m.memberId);
          if (memberUser?.downlines) {
            allNetworkMembers.push(...memberUser.downlines.map((d: any) => ({
              ...d,
              parentId: m.memberId,
              depth: depth + 1
            })));
            getDeepNetwork(memberUser.downlines, depth + 1);
          }
        });
      };
      getDeepNetwork(currentUserData?.downlines || []);
      
      const completedStage5Members = allNetworkMembers
        .filter((m: any) => hasMemberCompletedStage(m.memberId, 5))
        .slice(0, 6);
      
      const totalMembers = completedStage5Members.length;
      const baseEarnings = totalMembers * 2000;
      const isComplete = totalMembers >= 6;
      const bonusCash = isComplete ? 12000 : baseEarnings;
      const incentive = isComplete ? "R150,000 Voucher" : null;
      
      return {
        totalMembers,
        earnings: bonusCash,
        maxMembers: 6,
        earningsPerMember: 2000,
        completedMembers: completedStage5Members,
        incentive,
        isComplete
      };
    }
    return { totalMembers: 0, earnings: 0, maxMembers: 0, earningsPerMember: 0 };
  };

  const stageData = calculateStageData();

  // Auto-expand all nodes by default - no expand/collapse needed for 2x2 matrix
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
    const isExpanded = true; // Always show all nodes in 2x2 matrix
    const hasDownlines = member.downlines && member.downlines.length > 0;
    const canExpand = false; // No expand/collapse for 2x2 matrix - always show all

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

          {/* Avatar/Icon at top */}
          <div className="mb-2 flex justify-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-warning group-hover:ring-4 transition-all duration-300 ${
              member.isActive 
                ? 'bg-gradient-to-br from-primary to-accent' 
                : 'bg-muted'
            }`}>
              <Users className={`h-6 w-6 ${member.isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
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
              
              {/* Show empty slots for 2x2 matrix at any level */}
              {member.downlines.length < 2 && (
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
      case 1: return "2×2 Matrix: 6 members total (R100 per member = R600 max)";
      case 2: return "2×2 Matrix: 6 Stage 1 completers earn you R200 each = R1,200 + Samsung Smartphone";
      case 3: return "2×2 Matrix: 6 Stage 2 completers earn you R250 each = R1,500 + R10,000 Voucher";
      case 4: return "2×2 Matrix: 6 Stage 3 completers earn you R1,000 each = R6,000 + R25,000 Voucher";
      case 5: return "2×2 Matrix: 6 Stage 4 completers earn you R1,500 each = R9,000 + R50,000 Voucher";
      case 6: return "2×2 Matrix: 6 Stage 5 completers earn you R2,000 each = R12,000 + R150,000 Voucher";
      default: return "";
    }
  };

  const getStageProgress = (stageNum: number) => {
    return { current: stageData.totalMembers, required: stageData.maxMembers };
  };

  const isStageComplete = (stageNum: number) => {
    return stageData.totalMembers >= stageData.maxMembers;
  };

  const isLocked = isStageComplete(stageNumber);
  const progress = getStageProgress(stageNumber);
  const progressPercentage = progress.required > 0 ? (progress.current / progress.required) * 100 : 0;

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
        <Badge variant="outline">
          Earnings: R{stageData.earnings.toLocaleString()}
        </Badge>
        {stageData.incentive && (
          <Badge className="bg-gradient-to-r from-primary to-accent text-white">
            + {stageData.incentive} 🎁
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
            Stage {stageNumber}: 2×2 Matrix (6 Members)
          </CardTitle>
          <CardDescription>
            {stageNumber === 1 ? "Your Stage 1 genealogy tree • Click any member to view their network" :
             stageNumber === 2 ? "6 Stage 1 completers • R200 each • R1,200 + Samsung Smartphone when complete" :
             stageNumber === 3 ? "6 Stage 2 completers • R250 each • R1,500 + R10,000 Voucher when complete" :
             stageNumber === 4 ? "6 Stage 3 completers • R1,000 each • R6,000 + R25,000 Voucher when complete" :
             stageNumber === 5 ? "6 Stage 4 completers • R1,500 each • R9,000 + R50,000 Voucher when complete" :
             "6 Stage 5 completers • R2,000 each • R12,000 + R150,000 Voucher when complete"}
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
            {stageNumber === 1 ? (
              // Stage 1: Show 2x2 matrix as before
              networkData.length > 0 ? (
                <div className="relative">
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
                    
                    {networkData.length < 2 && (
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
                              <div className="text-xs font-bold text-muted-foreground mb-1">STAGE 1</div>
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
                  <h3 className="text-lg font-semibold mb-2">No members in Stage 1 yet</h3>
                  <p className="text-muted-foreground mb-4">Start recruiting to build your Stage 1 network</p>
                </div>
              )
            ) : (
              // Stages 2-6: Show only completed members in grid
              stageData.completedMembers && stageData.completedMembers.length > 0 ? (
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {stageData.completedMembers.map((member: any, index: number) => (
                      <div 
                        key={member.memberId}
                        className="relative bg-gradient-to-br from-success/20 to-success/10 border-2 border-success rounded-lg p-4 text-center shadow-lg animate-fade-in cursor-pointer hover:scale-105 transition-all duration-300"
                        onClick={() => viewMemberNetwork(member.memberId)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="mb-2 flex justify-center">
                          <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center ring-2 ring-success">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="text-xs font-bold text-success mb-1">✓ COMPLETED</div>
                        <div className="text-sm font-semibold text-foreground truncate">{member.memberId}</div>
                        <div className="text-xs text-muted-foreground truncate">{member.fullName}</div>
                        <Badge className="mt-2 bg-success text-white text-xs">
                          Stage {stageNumber - 1} ✓
                        </Badge>
                      </div>
                    ))}
                    
                    {/* Show empty slots */}
                    {[...Array(stageData.maxMembers - stageData.completedMembers.length)].map((_, index) => (
                      <div key={`empty-${index}`} className="bg-muted/30 border-2 border-dashed border-muted rounded-lg p-4 text-center">
                        <div className="mb-2 flex justify-center">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-6 w-6 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="text-xs font-bold text-muted-foreground mb-1">PENDING</div>
                        <div className="text-xs text-muted-foreground">
                          Stage {stageNumber - 1} Needed
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Slot {stageData.completedMembers.length + index + 1}/{stageData.maxMembers}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Summary info */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">{stageData.completedMembers.length}</strong> of <strong className="text-foreground">{stageData.maxMembers}</strong> members have completed Stage {stageNumber - 1}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      💰 Current Earnings: <strong className="text-primary">R{stageData.earnings.toLocaleString()}</strong>
                      {stageData.isComplete && stageData.incentive && (
                        <> + <strong className="text-success">{stageData.incentive}</strong></>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 animate-fade-in">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No completed members in Stage {stageNumber} yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Your network members need to complete their Stage {stageNumber - 1} (6 members each in 2×2 matrix) to appear here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    💡 Members will automatically appear here once they complete Stage {stageNumber - 1}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    💵 You'll earn R{stageData.earningsPerMember?.toLocaleString()} per Stage {stageNumber - 1} completer
                    {stageData.incentive && <> • Max R{stageData.earnings.toLocaleString()} + {stageData.incentive}</>}
                  </p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {isLocked && stageNumber < 6 && (
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

      {isLocked && stageNumber === 6 && (
        <Card className="border-success bg-success/10 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              🎉 All Stages Complete!
            </CardTitle>
            <CardDescription className="text-foreground">
              Amazing! You've completed all 6 stages of the binary matrix system. You've built a massive network and earned R150,000 Voucher!
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default StageTree;
