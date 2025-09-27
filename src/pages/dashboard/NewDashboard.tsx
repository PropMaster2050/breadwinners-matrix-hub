import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { 
  Users, 
  TrendingUp, 
  Wallet, 
  Crown,
  CheckCircle,
  Clock,
  Award,
  Eye,
  UserPlus,
  Gift,
  CreditCard,
  Download
} from "lucide-react";

const NewDashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Logo Header */}
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-4" />
        </div>

        {/* Welcome Section with User Name */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Welcome, {user.fullName || user.username}!</h2>
            <p className="text-lg text-foreground">You made R{user.earnings.toFixed(2)} from your network</p>
          </CardContent>
        </Card>

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

        {/* Wallets Section */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Wallet className="h-5 w-5" />
              My Wallets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* E-Wallet */}
            <div className="bg-white rounded-lg p-4 border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">E-Wallet</h4>
                    <p className="text-sm text-muted-foreground">Available for withdrawal</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">R {user.wallets?.eWallet || 0}</p>
                  <Button size="sm" className="mt-2 bg-primary text-primary-foreground">
                    Withdraw
                  </Button>
                </div>
              </div>
            </div>

            {/* Registration Wallet */}
            <div className="bg-white rounded-lg p-4 border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Registration Wallet</h4>
                    <p className="text-sm text-muted-foreground">Track voucher purchases</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">R {user.wallets?.registrationWallet || 0}</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    View History
                  </Button>
                </div>
              </div>
            </div>

            {/* Incentive Wallet */}
            <div className="bg-white rounded-lg p-4 border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Incentive Wallet</h4>
                    <p className="text-sm text-muted-foreground">Samsung, Laptop, R5,000 vouchers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">R {user.wallets?.incentiveWallet || 0}</p>
                  <Button size="sm" className="mt-2 bg-gradient-to-r from-primary to-accent text-white">
                    Claim Rewards
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Earning Section */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <TrendingUp className="h-5 w-5" />
              My Earnings
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
                    <p className="text-sm text-muted-foreground">Level Commission (R150 per person)</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">R {user.wallets?.incentiveWallet || 0}</p>
                    <p className="text-sm text-muted-foreground">Incentive Rewards</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            className="h-16 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-semibold"
            size="lg"
          >
            <div className="flex flex-col items-center gap-1">
              <Eye className="h-5 w-5" />
              <span className="text-sm">My Profile</span>
            </div>
          </Button>
          
          <Button 
            className="h-16 bg-gradient-to-r from-accent to-primary text-primary-foreground hover:opacity-90 font-semibold"
            size="lg"
          >
            <div className="flex flex-col items-center gap-1">
              <Users className="h-5 w-5" />
              <span className="text-sm">My Network</span>
            </div>
          </Button>
          
          <Button 
            className="h-16 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-semibold"
            size="lg"
          >
            <div className="flex flex-col items-center gap-1">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Income Report</span>
            </div>
          </Button>
          
          <Button 
            className="h-16 bg-gradient-to-r from-accent to-primary text-primary-foreground hover:opacity-90 font-semibold"
            size="lg"
          >
            <div className="flex flex-col items-center gap-1">
              <Download className="h-5 w-5" />
              <span className="text-sm">Payout Mgmt</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewDashboard;