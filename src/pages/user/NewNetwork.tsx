import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  UserPlus, 
  TrendingUp,
  Crown,
  Share2,
  Copy,
  ExternalLink
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NetworkMember {
  id: string;
  name: string;
  memberId: string;
  level: number;
  position: "left" | "right";
  children?: NetworkMember[];
}

const NewNetwork = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Mock network data for visualization - in real app this would come from backend
  const networkData: NetworkMember = {
    id: user.id,
    name: user.fullName,
    memberId: user.memberId,
    level: 0,
    position: "left",
    children: [
      {
        id: "child1",
        name: "John Doe",
        memberId: "BW000001",
        level: 1,
        position: "left",
        children: [
          {
            id: "grandchild1",
            name: "Sarah Smith",
            memberId: "BW000003",
            level: 2,
            position: "left"
          },
          {
            id: "grandchild2",
            name: "Mike Jones",
            memberId: "BW000004",
            level: 2,
            position: "right"
          }
        ]
      },
      {
        id: "child2",
        name: "Jane Wilson",
        memberId: "BW000002",
        level: 1,
        position: "right",
        children: []
      }
    ]
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${user.memberId}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied!",
      description: "Referral link copied to clipboard"
    });
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${user.memberId}`;
    const message = `Join Breadwinners Family Network with my referral link: ${referralLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Join Breadwinners Family Network",
        text: "Join me on Breadwinners Family Network",
        url: referralLink
      });
    } else {
      // Fallback to WhatsApp
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const NetworkNode = ({ member, isRoot = false }: { member: NetworkMember; isRoot?: boolean }) => (
    <div className="flex flex-col items-center">
      <div className={`
        relative bg-white rounded-lg p-4 border-2 shadow-md min-w-[160px] text-center
        ${isRoot ? 'border-primary bg-gradient-to-br from-primary/5 to-accent/5' : 'border-border'}
      `}>
        {isRoot && (
          <Crown className="absolute -top-3 -right-3 h-6 w-6 text-primary bg-white rounded-full p-1 border-2 border-primary" />
        )}
        <div className="text-sm font-semibold text-foreground">{member.name}</div>
        <div className="text-xs text-muted-foreground">{member.memberId}</div>
        <div className="text-xs text-primary font-medium mt-1">Level {member.level + 1}</div>
      </div>
      
      {member.children && member.children.length > 0 && (
        <>
          <div className="w-px h-6 bg-border"></div>
          <div className="flex gap-8 items-start">
            {member.children.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                {index > 0 && <div className="w-16 h-px bg-border mb-6"></div>}
                <NetworkNode member={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Breadwinners Family Network</h1>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-primary">
                <Users className="h-5 w-5" />
                Direct Referrals
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-foreground">{user.directRecruits}</div>
              <p className="text-sm text-muted-foreground">You need 2 direct referrals</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/20 border border-accent/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-accent">
                <TrendingUp className="h-5 w-5" />
                Total Network
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-foreground">{user.totalRecruits}</div>
              <p className="text-sm text-muted-foreground">All levels combined</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/20 border border-secondary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-secondary">
                <Crown className="h-5 w-5" />
                Current Stage
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-foreground">Stage {user.stage}</div>
              <p className="text-sm text-muted-foreground">Matrix level {user.level}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recruitment Tools */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <UserPlus className="h-5 w-5" />
              Recruit New Members
            </CardTitle>
            <CardDescription>
              Share your referral link to recruit new members to your network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-border/50">
              <Label className="text-sm font-medium text-muted-foreground">Your Referral Link</Label>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-muted rounded-md p-2 text-sm font-mono">
                  {window.location.origin}/register?ref={user.memberId}
                </div>
                <Button variant="outline" size="icon" onClick={copyReferralLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={shareReferralLink}
                className="h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>
              
              <Button 
                variant="outline"
                className="h-12"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join me on Breadwinners Family Network: ${window.location.origin}/register?ref=${user.memberId}`)}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Share on WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Network Tree Visualization */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Users className="h-5 w-5" />
              Network Tree (2×2 Matrix)
            </CardTitle>
            <CardDescription>
              Your network structure showing direct and indirect referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-max py-8">
                <NetworkNode member={networkData} isRoot={true} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stage Progression */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <TrendingUp className="h-5 w-5" />
              Stage Progression
            </CardTitle>
            <CardDescription>
              Complete stages to earn rewards and bonuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((stage) => (
                <div 
                  key={stage}
                  className={`
                    relative bg-white rounded-lg p-4 border-2 text-center
                    ${user.stage >= stage ? 'border-primary bg-gradient-to-br from-primary/5 to-accent/5' : 'border-border'}
                  `}
                >
                  <div className="text-lg font-bold text-foreground">Stage {stage}</div>
                  <div className="text-sm text-muted-foreground">
                    {stage === 1 && "6 Members"}
                    {stage === 2 && "14 Members"}
                    {stage === 3 && "30 Members"}
                    {stage === 4 && "62 Members"}
                    {stage === 5 && "126 Members"}
                  </div>
                  <div className="text-xs text-primary font-medium mt-1">
                    R{stage * 300} Reward
                  </div>
                  {user.stage >= stage && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Crown className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewNetwork;