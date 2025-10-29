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

  // For Stage 1: show 2x2 matrix (2 direct recruits)
  // For Stages 2-6: show all 6 Stage 1 recruits (2 direct + their downlines)
  const directRecruits = stageNumber === 1 
    ? networkTree.slice(0, 2) 
    : networkTree.slice(0, 6);

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
              Stage {stageNumber} View
            </div>
          </div>
        </div>
      </div>

      {/* Vertical connecting line */}
      <div className="w-0.5 h-6 md:h-12 bg-gradient-to-b from-primary to-primary/50 -my-3 md:-my-6" />

      {/* Level 1: Stage 1 shows 2x2, Stages 2-6 show all 6 */}
      {stageNumber === 1 ? (
        // Stage 1: Classic 2x2 matrix
        <div className="relative grid grid-cols-2 gap-6 md:gap-12">
          {directRecruits.map((member, idx) => (
            <div key={member.id} className="flex flex-col items-center space-y-4">
              <TreeNode 
                member={member} 
                stageNumber={stageNumber} 
                level={1}
                onMemberClick={onMemberClick}
              />

              <div className="w-0.5 h-4 bg-gradient-to-b from-primary to-primary/50" />
              <div className="grid grid-cols-2 gap-2">
                {member.downlines?.slice(0, 2).map((downline) => (
                  <div key={downline.id} className="w-12 md:w-16">
                    <TreeNode 
                      member={downline} 
                      stageNumber={stageNumber} 
                      level={2}
                      onMemberClick={onMemberClick}
                    />
                  </div>
                ))}

                {Array.from({ length: Math.max(0, 2 - (member.downlines?.slice(0, 2).length || 0)) }).map((_, emptyIdx) => (
                  <div key={`empty-gc-${idx}-${emptyIdx}`} className="flex flex-col items-center">
                    <EmptySlot 
                      stageNumber={stageNumber}
                      position={idx === 0 ? 3 + emptyIdx : 5 + emptyIdx}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {directRecruits.length < 2 && (
            <>
              {Array.from({ length: 2 - directRecruits.length }).map((_, i) => {
                const pos = directRecruits.length + i + 1;
                const gcStart = pos === 1 ? 3 : 5;
                return (
                  <div key={`empty-direct-${i}`} className="flex flex-col items-center space-y-4">
                    <EmptySlot stageNumber={stageNumber} position={pos} />
                    <div className="w-0.5 h-4 bg-gradient-to-b from-primary to-primary/50" />
                    <div className="grid grid-cols-2 gap-2">
                      <EmptySlot stageNumber={stageNumber} position={gcStart} />
                      <EmptySlot stageNumber={stageNumber} position={gcStart + 1} />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      ) : (
        // Stages 2-6: Show all 6 Stage 1 recruits (first 2 with downlines, next 4 below)
        <div className="space-y-8">
          {/* Top row: First 2 recruits with their downlines */}
          <div className="relative grid grid-cols-2 gap-6 md:gap-12">
            {directRecruits.slice(0, 2).map((member, idx) => (
              <div key={member.id} className="flex flex-col items-center space-y-4">
                <TreeNode 
                  member={member} 
                  stageNumber={stageNumber} 
                  level={1}
                  onMemberClick={onMemberClick}
                  isLocked={member.is_locked}
                />

                <div className="w-0.5 h-4 bg-gradient-to-b from-primary to-primary/50" />
                <div className="grid grid-cols-2 gap-2">
                  {member.downlines?.slice(0, 2).map((downline) => (
                    <div key={downline.id} className="w-12 md:w-16">
                      <TreeNode 
                        member={downline} 
                        stageNumber={stageNumber} 
                        level={2}
                        onMemberClick={onMemberClick}
                        isLocked={member.is_locked}
                      />
                    </div>
                  ))}

                  {Array.from({ length: Math.max(0, 2 - (member.downlines?.slice(0, 2).length || 0)) }).map((_, emptyIdx) => (
                    <div key={`empty-gc-${idx}-${emptyIdx}`} className="flex flex-col items-center">
                      <EmptySlot 
                        stageNumber={stageNumber}
                        position={idx === 0 ? 3 + emptyIdx : 5 + emptyIdx}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Empty slots if less than 2 recruits */}
            {directRecruits.length < 2 && Array.from({ length: 2 - Math.min(directRecruits.length, 2) }).map((_, i) => {
              const pos = Math.min(directRecruits.length, 2) + i + 1;
              const gcStart = pos === 1 ? 3 : 5;
              return (
                <div key={`empty-top-${i}`} className="flex flex-col items-center space-y-4">
                  <EmptySlot stageNumber={stageNumber} position={pos} />
                  <div className="w-0.5 h-4 bg-gradient-to-b from-primary to-primary/50" />
                  <div className="grid grid-cols-2 gap-2">
                    <EmptySlot stageNumber={stageNumber} position={gcStart} />
                    <EmptySlot stageNumber={stageNumber} position={gcStart + 1} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom row: Remaining 4 recruits (positions 3-6) */}
          {directRecruits.length > 2 && (
            <>
              <div className="w-0.5 h-6 md:h-8 bg-gradient-to-b from-primary to-primary/50 mx-auto" />
              <div className="grid grid-cols-4 gap-3 md:gap-6">
                {directRecruits.slice(2, 6).map((member, idx) => (
                  <div key={member.id} className="flex flex-col items-center">
                    <TreeNode 
                      member={member} 
                      stageNumber={stageNumber} 
                      level={1}
                      onMemberClick={onMemberClick}
                      isLocked={member.is_locked}
                    />
                  </div>
                ))}

                {/* Empty slots for positions 3-6 */}
                {Array.from({ length: Math.max(0, 6 - directRecruits.length) }).map((_, i) => (
                  <div key={`empty-bottom-${i}`} className="flex flex-col items-center">
                    <EmptySlot stageNumber={stageNumber} position={directRecruits.length + i + 1} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
