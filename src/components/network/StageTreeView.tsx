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

  // Show all 6 direct recruits (not 2x2 matrix)
  const directRecruits = networkTree.slice(0, 6);

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

      {/* Level 1: Direct Recruits (6 positions) */}
      <div className="relative grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12">
        {directRecruits.map((member, index) => (
          <div key={member.id} className="flex flex-col items-center">
            {/* Direct recruit */}
            <TreeNode 
              member={member} 
              stageNumber={stageNumber} 
              level={1}
              onMemberClick={onMemberClick}
            />
          </div>
        ))}

        {/* Empty slots for remaining positions (up to 6 total) */}
        {directRecruits.length < 6 && (
          <>
            {[...Array(6 - directRecruits.length)].map((_, index) => (
              <div key={`empty-direct-${index}`} className="flex flex-col items-center">
                <EmptySlot 
                  stageNumber={stageNumber}
                  position={directRecruits.length + index + 1}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
