import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, CheckCircle2, UserCircle2 } from "lucide-react";
import { NetworkMember } from "@/hooks/useNetworkTree";

interface TreeNodeProps {
  member: NetworkMember;
  stageNumber: number;
  level: number;
  onMemberClick?: (memberId: string) => void;
  isLocked?: boolean;
}

export const TreeNode = ({ member, stageNumber, level, onMemberClick, isLocked }: TreeNodeProps) => {
  const stageProgress = (member.current_stage / 6) * 100;
  const isCompleted = member.stage_completed && member.stage_completed >= stageNumber;
  const locked = isLocked || member.is_locked;

  return (
    <div className={`relative flex flex-col items-center animate-fade-in ${locked ? 'opacity-40' : ''}`}>
      {/* Connecting line from parent */}
      {level > 0 && (
        <div 
          className="absolute -top-8 left-1/2 w-0.5 h-8 bg-gradient-to-b from-primary/50 to-primary" 
          style={{ transform: 'translateX(-50%)' }}
        />
      )}
      
      {/* Member Node */}
      <div
        className={`relative transition-all duration-300 ${
          locked 
            ? 'cursor-not-allowed' 
            : 'cursor-pointer hover:scale-110'
        }`}
        onClick={() => !locked && onMemberClick?.(member.user_id)}
      >
        {/* Completion Badge */}
        {!locked && isCompleted && (
          <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 z-10">
            <div className="bg-primary rounded-full p-0.5 md:p-1 shadow-lg">
              <CheckCircle2 className="h-3 w-3 md:h-5 md:w-5 text-primary-foreground" />
            </div>
          </div>
        )}

        {/* Commission Badge */}
        {!locked && member.commission_earned && member.commission_earned > 0 && (
          <div className="absolute -top-2 -left-2 md:-top-3 md:-left-3 z-10">
            <Badge className="bg-warning text-warning-foreground text-[8px] md:text-xs font-bold shadow-lg px-1 md:px-2 py-0 md:py-1">
              +R{member.commission_earned}
            </Badge>
          </div>
        )}

        {/* Avatar Head */}
        <div className="relative">
          <UserCircle2 
            className={`w-16 h-16 md:w-24 md:h-24 transition-all duration-300 ${
              locked 
                ? 'text-muted-foreground/30' 
                : 'text-primary hover:text-accent'
            }`}
            strokeWidth={1.5}
          />
          
          {/* Stage Badge on Avatar */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <Badge variant={locked ? "secondary" : "default"} className="text-[8px] md:text-xs font-semibold px-1 md:px-2 py-0">
              Stage {member.current_stage}
            </Badge>
          </div>

          {/* Locked Overlay */}
          {locked && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Badge className="bg-muted text-muted-foreground text-[8px] md:text-xs font-bold">
                🔒
              </Badge>
            </div>
          )}
        </div>

        {/* Member Info Below Avatar */}
        <div className="text-center mt-3 md:mt-4 space-y-0.5 md:space-y-1 max-w-[100px] md:max-w-[140px]">
          {/* Name */}
          <h4 className="font-bold text-[10px] md:text-sm text-foreground truncate">
            {member.full_name}
          </h4>

          {/* User ID */}
          <p className="text-[8px] md:text-[10px] text-muted-foreground truncate font-mono">
            BW{member.user_id.slice(0, 6).toUpperCase()}
          </p>

          {/* Stage Progress */}
          {!locked && (
            <div className="space-y-0.5 mt-1 md:mt-2">
              <Progress value={stageProgress} className="h-1 md:h-1.5" />
              <p className="text-[8px] md:text-[10px] text-muted-foreground">
                Progress: {member.current_stage}/6
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Empty Slot Component
export const EmptySlot = ({ stageNumber, position }: { stageNumber: number; position: number }) => {
  return (
    <div className="relative flex flex-col items-center animate-fade-in">
      <div className="absolute -top-4 md:-top-8 left-1/2 w-0.5 h-4 md:h-8 bg-border/50" style={{ transform: 'translateX(-50%)' }} />
      
      <div className="relative">
        <UserCircle2 
          className="w-16 h-16 md:w-24 md:h-24 text-muted-foreground/30"
          strokeWidth={1.5}
        />
        
        {/* Stage Badge */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <Badge variant="secondary" className="text-[8px] md:text-xs px-1 md:px-2 py-0">
            Stage {stageNumber}
          </Badge>
        </div>
      </div>

      <div className="text-center mt-3 md:mt-4 space-y-0.5 max-w-[100px] md:max-w-[140px]">
        <p className="text-[8px] md:text-xs text-muted-foreground font-medium">Empty Slot</p>
        <p className="text-[8px] md:text-[10px] text-muted-foreground">
          Share referral link
        </p>
      </div>
    </div>
  );
};
