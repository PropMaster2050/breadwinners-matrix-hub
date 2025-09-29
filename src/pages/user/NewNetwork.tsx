import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, TrendingUp } from "lucide-react";

function NewNetwork() {
  // Mock data - new user starts with empty network
  const networkData = {
    totalDownlines: 0,
    activeMembers: 0,
    pendingMembers: 0,
    levels: []
  };

  const renderPyramidLevel = (level: any, levelNumber: number) => {
    const maxPerLevel = Math.pow(2, levelNumber);
    const emptySlots = maxPerLevel - level.members.length;

    return (
      <div key={levelNumber} className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-center">Level {levelNumber}</h3>
        <div className={`flex justify-center gap-4 flex-wrap`}>
          {level.members.map((member: any) => (
            <Card key={member.id} className="w-48 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-foreground rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-sm">{member.name}</h4>
                <Badge 
                  variant={member.status === "active" ? "default" : "secondary"}
                  className="mt-2"
                >
                  {member.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Joined: {new Date(member.joined).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: emptySlots }).map((_, index) => (
            <Card key={`empty-${index}`} className="w-48 border-dashed border-2 border-muted-foreground/30">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Available Slot</p>
                <p className="text-xs text-muted-foreground mt-1">Recruit to fill</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Network</h1>
        <p className="text-muted-foreground">2×2 Matrix pyramid view of your downlines</p>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downlines</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkData.totalDownlines}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkData.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((networkData.activeMembers / networkData.totalDownlines) * 100)}% active rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Members</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkData.pendingMembers}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting activation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pyramid Network View */}
      <Card>
        <CardHeader>
          <CardTitle>Network Pyramid (2×2 Matrix)</CardTitle>
        </CardHeader>
        <CardContent>
          {networkData.levels.length > 0 ? (
            <div className="space-y-8">
              {networkData.levels.map((level, index) => renderPyramidLevel(level, index + 1))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Network Yet</h3>
              <p className="text-muted-foreground">
                Start recruiting members to build your network pyramid. You can have up to 2 direct recruits per level.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default NewNetwork;