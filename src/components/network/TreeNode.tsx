import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, CheckCircle2 } from "lucide-react";
import { NetworkMember } from "@/hooks/useNetworkTree";

interface TreeNodeProps {
  member: NetworkMember;
  stageNumber: number;
  level: number;
  onMemberClick?: (memberId: string) => void;
  isLocked?: boolean;
}

export const TreeNode = ({ member, stageNumber, level, onMemberClick, isLocked }: TreeNodeProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
      
      {/* Member Card */}
      <Card
        className={`relative w-32 md:w-52 p-2 md:p-4 transition-all duration-300 group border bg-gradient-to-br from-card to-card/80 ${
          locked 
            ? 'cursor-not-allowed grayscale border-muted' 
            : 'cursor-pointer hover:shadow-xl hover:scale-105 hover:border-primary'
        }`}
        onClick={() => !locked && onMemberClick?.(member.user_id)}
      >
        {/* Locked Badge */}
        {locked && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <Badge className="bg-muted text-muted-foreground text-[8px] md:text-xs font-bold">
              🔒 Locked
            </Badge>
          </div>
        )}

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

        {/* Avatar */}
        <div className="flex justify-center mb-1 md:mb-3">
          <Avatar className="h-10 w-10 md:h-16 md:w-16 border-2 md:border-4 border-primary/20 group-hover:border-primary transition-all">
            <AvatarImage src={member.avatar_url} alt={member.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs md:text-lg font-bold">
              {getInitials(member.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Member Info */}
        <div className="text-center space-y-0.5 md:space-y-2">
          {/* Stage Badge */}
          <Badge variant="outline" className="text-[8px] md:text-xs font-semibold px-1 md:px-2.5 py-0 md:py-0.5">
            Stage {member.current_stage}
          </Badge>

          {/* Name */}
          <h4 className="font-bold text-[10px] md:text-sm text-foreground truncate">
            {member.full_name}
          </h4>

          {/* Username */}
          <p className="text-[8px] md:text-xs text-muted-foreground">@{member.username}</p>

          {/* Stage Progress */}
          <div className="space-y-0.5 md:space-y-1">
            <Progress value={stageProgress} className="h-1 md:h-1.5" />
            <p className="text-[8px] md:text-[10px] text-muted-foreground">
              Stage Progress: {member.current_stage}/6
            </p>
          </div>

          {/* Joined Date */}
          <p className="text-[8px] md:text-[10px] text-muted-foreground">
            Joined: {new Date(member.joined_at).toLocaleDateString()}
          </p>
        </div>

        {/* Hover Overlay */}
        {!locked && (
          <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-[8px] md:text-xs font-medium text-primary">View Details</span>
          </div>
        )}
      </Card>
    </div>
  );
};

// Empty Slot Component
export const EmptySlot = ({ stageNumber, position }: { stageNumber: number; position: number }) => {
  return (
    <div className="relative flex flex-col items-center animate-fade-in">
      <div className="absolute -top-4 md:-top-8 left-1/2 w-0.5 h-4 md:h-8 bg-border/50" style={{ transform: 'translateX(-50%)' }} />
      
      <Card className="w-32 md:w-52 p-2 md:p-4 border border-dashed md:border-2 border-border/50 bg-muted/30">
        <div className="flex justify-center mb-1 md:mb-3">
          <div className="h-10 w-10 md:h-16 md:w-16 rounded-full border-2 md:border-4 border-dashed border-border/50 bg-muted flex items-center justify-center">
            <Users className="h-5 w-5 md:h-8 md:w-8 text-muted-foreground/50" />
          </div>
        </div>

        <div className="text-center space-y-0.5 md:space-y-2">
          <Badge variant="secondary" className="text-[8px] md:text-xs px-1 md:px-2.5 py-0 md:py-0.5">
            Stage {stageNumber}
          </Badge>
          <p className="text-[8px] md:text-xs text-muted-foreground font-medium">Empty Slot</p>
          <p className="text-[8px] md:text-[10px] text-muted-foreground">Position {position}</p>
          <p className="text-[8px] md:text-[10px] text-muted-foreground mt-1 md:mt-2">
            Share referral link to recruit
          </p>
        </div>
      </Card>
    </div>
  );
};
