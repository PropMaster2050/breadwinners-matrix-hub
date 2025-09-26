import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  TrendingUp, 
  Wallet, 
  Crown,
  CheckCircle,
  Clock,
  Award,
  Eye,
  UserPlus
} from "lucide-react";

const NewDashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Logo and User Info */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Breadwinners Family Network</h1>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">you made R{user.earnings.toFixed(2)} from your network</h2>
            </div>
          </div>
        </div>

        {/* My Rank Section */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-primary/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg text-primary">My Rank</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-primary-foreground mb-2">Current Rank:</h3>
              <h2 className="text-3xl font-bold text-primary-foreground mb-2">Stage {user.stage}</h2>
              <p className="text-primary-foreground/80 mb-4">You have achieved Stage {user.stage} Rank</p>
              <div className="border border-primary-foreground/30 rounded-lg p-2 inline-block">
                <span className="text-primary-foreground font-medium">Stage {user.stage}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth Monitoring */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="text-accent text-center">keep monitoring your growth</CardTitle>
          </CardHeader>
        </Card>

        {/* Payouts Section */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <TrendingUp className="h-5 w-5" />
              Payouts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground">Pending Payout</h4>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground">Success Payout</h4>
                    <p className="text-2xl font-bold text-foreground">{Math.floor(user.earnings / 150)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Team Section */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Users className="h-5 w-5" />
              My Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground">Referral Members</h4>
                    <p className="text-3xl font-bold text-foreground">{user.directRecruits}</p>
                    <p className="text-sm text-muted-foreground">you have referred {user.directRecruits} members personally.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground">Team Members</h4>
                    <p className="text-3xl font-bold text-foreground">{user.totalRecruits}</p>
                    <p className="text-sm text-muted-foreground">you have total {user.totalRecruits} members in your network, including referral members.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Build Your Team Button */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardContent className="p-6">
            <Button 
              className="w-full h-12 bg-gradient-to-r from-accent to-primary text-primary-foreground hover:opacity-90 font-semibold"
              size="lg"
            >
              build your team
            </Button>
          </CardContent>
        </Card>

        {/* Wallet Section */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Wallet className="h-5 w-5" />
              Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-6 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Wallet className="h-8 w-8 text-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">AVAILABLE</p>
                    <p className="font-semibold">Ewallet Balance</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-foreground mb-2">R {user.wallets.eWallet}</p>
                <p className="text-sm text-muted-foreground mb-4">Available for Withdrawl Only</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Balance Section */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardContent className="p-6">
            <Button 
              className="w-full h-12 bg-gradient-to-r from-accent to-primary text-primary-foreground hover:opacity-90 font-semibold"
              variant="outline"
            >
              available balance in your wallets
            </Button>
          </CardContent>
        </Card>

        {/* My Earning Section */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <TrendingUp className="h-5 w-5" />
              My Earning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg p-4 border border-accent/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">R {user.earnings.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Level Commission</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">R 0</p>
                    <p className="text-sm text-muted-foreground">Incentive</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewDashboard;