import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const TeamReport = () => {
  const { user } = useAuth();

  // Get ALL users in the network tree recursively (including grandchildren, great-grandchildren, etc.)
  const getAllNetworkMembers = () => {
    if (!user) return [];
    const storedUsers = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
    const currentUser = storedUsers.find((u: any) => u.memberId === user.memberId);
    
    const allMembers: any[] = [];
    
    // Recursive function to get all downlines
    const getDownlinesRecursively = (memberDownlines: any[], level: number = 1) => {
      memberDownlines.forEach((downline: any) => {
        const fullDownline = storedUsers.find((u: any) => u.memberId === downline.memberId);
        if (fullDownline) {
          // Calculate stage based on total recruits (6 members = Stage 1 complete, etc.)
          const totalRecruits = (fullDownline.directRecruits || 0) + (fullDownline.totalRecruits || 0);
          let stage = 1;
          if (totalRecruits >= 6) stage = 2;
          if (totalRecruits >= 84) stage = 3;
          if (totalRecruits >= 252) stage = 4;
          
          allMembers.push({
            ...fullDownline,
            level,
            stage
          });
          
          // Get their downlines recursively
          if (fullDownline.downlines && fullDownline.downlines.length > 0) {
            getDownlinesRecursively(fullDownline.downlines, level + 1);
          }
        }
      });
    };
    
    if (currentUser?.downlines) {
      getDownlinesRecursively(currentUser.downlines);
    }
    
    return allMembers;
  };

  const allNetworkMembers = getAllNetworkMembers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Team Report</h1>
        <p className="text-muted-foreground">Overview of your team performance and growth</p>
      </div>

      {/* Team Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allNetworkMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              Direct recruits under you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allNetworkMembers.filter(m => m.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              Currently active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{(user?.earnings || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total earned from team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              New members this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Your direct recruits and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allNetworkMembers.length > 0 ? (
            <div className="space-y-4">
              {allNetworkMembers.map((member: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {member.fullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.fullName}</p>
                      <p className="text-sm text-muted-foreground">ID: {member.memberId} • Level {member.level}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/5">
                      Stage {member.stage}
                    </Badge>
                    <Badge variant={member.isActive ? "default" : "secondary"}>
                      {member.isActive ? "Active" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Team Members Yet</h3>
              <p className="text-muted-foreground">
                Start recruiting members to build your team and earn rewards
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamReport;