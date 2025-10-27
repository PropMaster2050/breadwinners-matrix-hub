import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";

const TeamReport = () => {
  const { user } = useAuth();
  const [allNetworkMembers, setAllNetworkMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetworkMembers = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch all profiles with their network tree and wallet data
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select(`
            *,
            wallets(*),
            network_tree(*)
          `);

        if (error) {
          console.error('Error fetching network members:', error);
          return;
        }

        if (profiles) {
          // Transform profiles to match the expected format
          const members = profiles
            .filter((profile: any) => {
              // Include users who have the current user as parent in network tree
              return profile.network_tree?.some((nt: any) => nt.parent_id === user.id);
            })
            .map((profile: any) => ({
              fullName: profile.full_name,
              memberId: profile.id,
              level: profile.network_tree?.[0]?.level || 1,
              stage: profile.network_tree?.[0]?.stage || 1,
              isActive: true,
              joinDate: profile.created_at,
              directRecruits: profile.direct_recruits,
              totalRecruits: profile.total_recruits
            }));

          setAllNetworkMembers(members);
        }
      } catch (error) {
        console.error('Error in fetchNetworkMembers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkMembers();
  }, [user?.id]);

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
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading team members...</p>
            </div>
          ) : allNetworkMembers.length > 0 ? (
            <div className="space-y-4">
              {allNetworkMembers.map((member: any, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {member.fullName.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{member.fullName}</p>
                      <p className="text-sm text-muted-foreground truncate">ID: {member.memberId}</p>
                      <p className="text-xs text-muted-foreground">Level {member.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
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