import { TreeNode, EmptySlot } from "./TreeNode";
import { NetworkMember } from "@/hooks/useNetworkTree";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown } from "lucide-react";

interface StageTreeViewProps {
  currentUser: any;
  networkTree: NetworkMember[];
  stageNumber: number;
  onMemberClick?: (memberId: string) => void;
}

export const StageTreeView = ({ 
  currentUser, 
  networkTree, 
  stageNumber,
  onMemberClick 
}: StageTreeViewProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Stage 1: 2x2 matrix (6 total: 2 direct + 4 indirect)
  // Stages 2-6: 2x3 matrix (14 total: 2 direct, each with 4 downlines = 8, plus 4 more under last 4)
  const directRecruits = networkTree.slice(0, 2);
  const showExtendedMatrix = stageNumber >= 2; // 2x3 for stages 2-6

  return (
    <div className="flex flex-col items-center space-y-6 md:space-y-12 py-4 md:py-8">
      {/* Root Node - Current User */}
      <div className="relative flex flex-col items-center">
        <div className="absolute -top-2 md:-top-4 left-1/2 -translate-x-1/2">
          <Crown className="h-5 w-5 md:h-8 md:w-8 text-warning animate-pulse" />
        </div>
        
        <div className="relative bg-gradient-to-br from-primary to-accent border-2 md:border-4 border-warning rounded-lg p-3 md:p-6 w-36 md:w-56 text-center shadow-2xl">
          <div className="flex justify-center mb-2 md:mb-3">
            <Avatar className="h-12 w-12 md:h-20 md:w-20 border-2 md:border-4 border-warning shadow-lg">
              <AvatarImage src={currentUser?.avatar_url} alt={currentUser?.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-warning to-warning/80 text-warning-foreground text-sm md:text-xl font-bold">
                {getInitials(currentUser?.full_name || 'You')}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-1 md:space-y-2">
            <div className="text-[10px] md:text-xs font-bold text-warning uppercase tracking-wider">You</div>
            <h3 className="font-bold text-sm md:text-lg text-primary-foreground">{currentUser?.full_name}</h3>
            <p className="text-xs md:text-sm text-primary-foreground/80">@{currentUser?.username}</p>
            <div className="bg-warning/20 rounded px-2 py-1 text-[10px] md:text-xs font-semibold text-warning">
              Stage {stageNumber} View - {showExtendedMatrix ? "2x3 Matrix (14)" : "2x2 Matrix (6)"}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical connecting line */}
      <div className="w-0.5 h-6 md:h-12 bg-gradient-to-b from-primary to-primary/50 -my-3 md:-my-6" />

      {/* Matrix Structure */}
      <div className="relative grid grid-cols-2 gap-6 md:gap-12">
        {directRecruits.map((member, idx) => (
          <div key={member.id} className="flex flex-col items-center space-y-4">
            {/* Direct recruit (Level 1) - Positions 1-2 */}
            <TreeNode 
              member={member} 
              stageNumber={stageNumber} 
              level={1}
              onMemberClick={onMemberClick}
              isLocked={member.is_locked}
            />

            {/* Level 2 - Grandchildren */}
            <div className="w-0.5 h-4 bg-gradient-to-b from-primary to-primary/50" />
            <div className="grid grid-cols-2 gap-2">
              {member.downlines?.slice(0, showExtendedMatrix ? 4 : 2).map((downline, dlIdx) => (
                <div key={downline.id} className="w-12 md:w-16">
                  <TreeNode 
                    member={downline} 
                    stageNumber={stageNumber} 
                    level={2}
                    onMemberClick={onMemberClick}
                    isLocked={member.is_locked || downline.is_locked}
                  />
                  
                  {/* Level 3 - Great-grandchildren (only for 2x3 matrix on last 4 positions) */}
                  {showExtendedMatrix && dlIdx >= 2 && (
                    <>
                      <div className="w-0.5 h-2 bg-gradient-to-b from-primary/50 to-primary/30 mx-auto" />
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        <div className="w-8 md:w-10">
                          <EmptySlot stageNumber={stageNumber} position={0} />
                        </div>
                        <div className="w-8 md:w-10">
                          <EmptySlot stageNumber={stageNumber} position={0} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Empty grandchild slots */}
              {Array.from({ 
                length: Math.max(0, (showExtendedMatrix ? 4 : 2) - (member.downlines?.length || 0)) 
              }).map((_, emptyIdx) => (
                <div key={`empty-gc-${idx}-${emptyIdx}`} className="w-12 md:w-16">
                  <EmptySlot 
                    stageNumber={stageNumber}
                    position={0}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty direct recruit slots */}
        {directRecruits.length < 2 && (
          <>
            {Array.from({ length: 2 - directRecruits.length }).map((_, i) => (
              <div key={`empty-direct-${i}`} className="flex flex-col items-center space-y-4">
                <EmptySlot stageNumber={stageNumber} position={0} />
                <div className="w-0.5 h-4 bg-gradient-to-b from-primary to-primary/50" />
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: showExtendedMatrix ? 4 : 2 }).map((_, j) => (
                    <div key={j} className="w-12 md:w-16">
                      <EmptySlot stageNumber={stageNumber} position={0} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
