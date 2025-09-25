import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, Calendar, Phone, Users, MapPin, Edit } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Your account details and information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <div className="text-lg font-semibold">{user.fullName}</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <div className="text-lg font-semibold">@{user.username}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Member ID</label>
                  <div className="text-lg font-semibold font-mono">{user.memberId}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Mobile Number</label>
                  <div className="text-lg font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {user.mobile}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                  <div className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(user.joinDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                  <div>
                    <Badge className={user.isActive ? "bg-green-500" : "bg-red-500"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {user.sponsorId && (
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Sponsor</label>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {user.sponsorId}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-2xl font-bold text-primary">{user.level}</div>
                <div className="text-sm text-muted-foreground">Current Level</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="text-2xl font-bold text-accent">R{user.earnings.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{user.directRecruits}</div>
                <div className="text-sm text-muted-foreground">Direct Recruits</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{user.totalRecruits}</div>
                <div className="text-sm text-muted-foreground">Total Network</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                Change Password
              </Button>
              <Button className="w-full" variant="outline">
                Update Contact Info
              </Button>
              <Button className="w-full" variant="outline">
                Download Certificate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;