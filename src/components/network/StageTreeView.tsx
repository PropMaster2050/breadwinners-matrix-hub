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

  // Limit to 2 direct recruits for 2x2 matrix
  const directRecruits = networkTree.slice(0, 2);

  return (
    <div className="flex flex-col items-center space-y-12 py-8">
      {/* Root Node - Current User */}
      <div className="relative flex flex-col items-center">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Crown className="h-8 w-8 text-warning animate-pulse" />
        </div>
        
        <div className="relative bg-gradient-to-br from-primary to-accent border-4 border-warning rounded-lg p-6 w-56 text-center shadow-2xl">
          <div className="flex justify-center mb-3">
            <Avatar className="h-20 w-20 border-4 border-warning shadow-lg">
              <AvatarImage src={currentUser?.avatar_url} alt={currentUser?.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-warning to-warning/80 text-warning-foreground text-xl font-bold">
                {getInitials(currentUser?.full_name || 'You')}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-warning uppercase tracking-wider">You</div>
            <h3 className="font-bold text-lg text-primary-foreground">{currentUser?.full_name}</h3>
            <p className="text-sm text-primary-foreground/80">@{currentUser?.username}</p>
            <div className="bg-warning/20 rounded px-2 py-1 text-xs font-semibold text-warning">
              Stage {stageNumber} View
            </div>
          </div>
        </div>
      </div>

      {/* Vertical connecting line */}
      <div className="w-0.5 h-12 bg-gradient-to-b from-primary to-primary/50 -my-6" />

      {/* Level 1: Direct Recruits */}
      <div className="relative flex gap-16">
        {/* Horizontal line connecting siblings */}
        {directRecruits.length > 1 && (
          <div 
            className="absolute top-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 left-1/2 -translate-x-1/2"
            style={{ width: '16rem' }}
          />
        )}

        {directRecruits.map((member, index) => (
          <div key={member.id} className="flex flex-col items-center space-y-8">
            {/* Direct recruit */}
            <TreeNode 
              member={member} 
              stageNumber={stageNumber} 
              level={1}
              onMemberClick={onMemberClick}
            />

            {/* Their downlines (grandchildren) */}
            {member.downlines.length > 0 && (
              <>
                <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-primary/50" />
                <div className="relative flex gap-12">
                  {/* Horizontal line for level 2 */}
                  {member.downlines.length > 1 && (
                    <div 
                      className="absolute top-0 h-0.5 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 left-1/2 -translate-x-1/2"
                      style={{ width: '12rem' }}
                    />
                  )}

                  {member.downlines.slice(0, 2).map((grandchild) => (
                    <TreeNode 
                      key={grandchild.id}
                      member={grandchild} 
                      stageNumber={stageNumber} 
                      level={2}
                      onMemberClick={onMemberClick}
                    />
                  ))}

                  {/* Empty slots for grandchildren */}
                  {member.downlines.length < 2 && (
                    <>
                      {[...Array(2 - member.downlines.length)].map((_, idx) => (
                        <EmptySlot 
                          key={`empty-gc-${index}-${idx}`}
                          stageNumber={stageNumber}
                          position={member.downlines.length + idx + 1}
                        />
                      ))}
                    </>
                  )}
                </div>
              </>
            )}

            {/* Show empty slots if no downlines */}
            {member.downlines.length === 0 && (
              <>
                <div className="w-0.5 h-8 bg-border/50" />
                <div className="relative flex gap-12">
                  <EmptySlot stageNumber={stageNumber} position={1} />
                  <EmptySlot stageNumber={stageNumber} position={2} />
                </div>
              </>
            )}
          </div>
        ))}

        {/* Empty slots for direct recruits */}
        {directRecruits.length < 2 && (
          <>
            {[...Array(2 - directRecruits.length)].map((_, index) => (
              <div key={`empty-direct-${index}`} className="flex flex-col items-center space-y-8">
                <EmptySlot 
                  stageNumber={stageNumber}
                  position={directRecruits.length + index + 1}
                />
                <div className="w-0.5 h-8 bg-border/50" />
                <div className="flex gap-12">
                  <EmptySlot stageNumber={stageNumber} position={1} />
                  <EmptySlot stageNumber={stageNumber} position={2} />
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
