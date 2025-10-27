import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Network as NetworkIcon, Users, UserPlus, TreePine, Share2 } from "lucide-react";

const Network = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Mock network data - in a real app, this would come from API
  const networkData = [
    {
      id: "1",
      name: "John Doe",
      memberId: "BW000002",
      level: 1,
      recruits: 2,
      earnings: 50,
      joinDate: "2024-01-15"
    },
    {
      id: "2", 
      name: "Sarah Smith",
      memberId: "BW000003",
      level: 1,
      recruits: 1,
      earnings: 25,
      joinDate: "2024-01-20"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">My Network</h1>
        <Button className="bg-gradient-to-r from-primary to-accent">
          <Share2 className="h-4 w-4 mr-2" />
          Share Referral Link
        </Button>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Direct Recruits</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.directRecruits}</div>
            <p className="text-xs text-muted-foreground">
              {2 - user.directRecruits > 0 ? `${2 - user.directRecruits} more needed` : 'Target reached!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Network</CardTitle>
            <NetworkIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalRecruits}</div>
            <p className="text-xs text-muted-foreground">All levels combined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Earnings</CardTitle>
            <TreePine className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{(networkData.reduce((sum, member) => sum + member.earnings, 0)).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From your network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserPlus className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkData.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Stage Tree Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-primary" />
            Network Market
          </CardTitle>
          <CardDescription>
            View detailed tree structure for each stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/network/stage/1'}
            >
              <TreePine className="h-6 w-6 mb-2 text-primary" />
              <span className="font-semibold">Stage 1 Tree</span>
              <span className="text-xs text-muted-foreground">2x2 Matrix</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/network/stage/2'}
            >
              <TreePine className="h-6 w-6 mb-2 text-primary" />
              <span className="font-semibold">Stage 2 Tree</span>
              <span className="text-xs text-muted-foreground">2x2 Matrix</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/network/stage/3'}
            >
              <TreePine className="h-6 w-6 mb-2 text-primary" />
              <span className="font-semibold">Stage 3 Tree</span>
              <span className="text-xs text-muted-foreground">2x2 Matrix</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/network/stage/4'}
            >
              <TreePine className="h-6 w-6 mb-2 text-primary" />
              <span className="font-semibold">Stage 4 Tree</span>
              <span className="text-xs text-muted-foreground">2x2 Matrix</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/network/stage/5'}
            >
              <TreePine className="h-6 w-6 mb-2 text-primary" />
              <span className="font-semibold">Stage 5 Tree</span>
              <span className="text-xs text-muted-foreground">2x2 Matrix</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/network/stage/6'}
            >
              <TreePine className="h-6 w-6 mb-2 text-primary" />
              <span className="font-semibold">Stage 6 Tree</span>
              <span className="text-xs text-muted-foreground">2x2 Matrix</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Matrix Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NetworkIcon className="h-5 w-5 text-primary" />
            2x2 Matrix Structure (Stage 1 Preview)
          </CardTitle>
          <CardDescription>
            Your current position and direct network structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6 p-6">
            {/* Your Position */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold mb-2">
                YOU
              </div>
              <div className="text-sm font-medium">{user.fullName}</div>
              <Badge className="text-xs mt-1">Level {user.level}</Badge>
            </div>

            {/* Direct Recruits */}
            <div className="flex gap-8">
              {[0, 1].map((index) => {
                const recruit = networkData[index];
                return (
                  <div key={index} className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold mb-2 ${
                      recruit 
                        ? 'bg-green-100 border-2 border-green-500 text-green-800' 
                        : 'bg-gray-100 border-2 border-dashed border-gray-300 text-gray-500'
                    }`}>
                      {recruit ? recruit.name.split(' ').map(n => n[0]).join('') : `${index + 1}`}
                    </div>
                    <div className="text-xs">
                      {recruit ? (
                        <>
                          <div className="font-medium">{recruit.name}</div>
                          <div className="text-muted-foreground">{recruit.memberId}</div>
                        </>
                      ) : (
                        <div className="text-muted-foreground">Empty Slot</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connection Lines */}
            <div className="relative w-full max-w-md h-8">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-border"></div>
              <div className="absolute top-1/2 left-1/4 right-1/4 h-px bg-border"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Network Members</CardTitle>
          <CardDescription>
            Detailed view of your direct recruits and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {networkData.length > 0 ? (
            <div className="space-y-4">
              {networkData.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.memberId}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm font-medium">Level</div>
                      <Badge variant="secondary">{member.level}</Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium">Recruits</div>
                      <div className="text-lg font-bold">{member.recruits}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium">Earnings</div>
                      <div className="text-lg font-bold text-green-600">R{member.earnings}</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium">Joined</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(member.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No network members yet</h3>
              <p className="text-muted-foreground mb-6">
                Start building your network by recruiting your first 2 members
              </p>
              <Button className="bg-gradient-to-r from-primary to-accent">
                <UserPlus className="h-4 w-4 mr-2" />
                Share Referral Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Network;