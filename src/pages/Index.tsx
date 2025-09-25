import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, TrendingUp, Shield, Zap, Award } from "lucide-react";
import breadwinnersLogo from "@/assets/breadwinners-logo.png";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "2x2 Matrix System",
      description: "Progress through 8 levels with our proven matrix structure"
    },
    {
      icon: TrendingUp,
      title: "Guaranteed Income",
      description: "Earn R50 per level as your matrix fills automatically"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Protected transactions and member data security"
    },
    {
      icon: Zap,
      title: "Instant Activation",
      description: "Get started immediately with valid e-pin voucher"
    },
    {
      icon: Award,
      title: "Rewards Program",
      description: "Earn incentives and bonuses for performance"
    }
  ];

  const howItWorks = [
    "Purchase R300 voucher with valid e-pin",
    "Recruit 2 members to advance",
    "Progress through 8 matrix levels",
    "Earn commissions automatically"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Simple Landing Page with Logo and Login/Register */}
      <div className="container mx-auto px-4 py-16 text-center">
        {/* Logo and Title */}
        <div className="mb-12">
          <img 
            src={breadwinnersLogo} 
            alt="Breadwinners Family Network" 
            className="w-32 h-32 mx-auto mb-6 rounded-2xl shadow-lg"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Breadwinners</h1>
          <h2 className="text-2xl md:text-3xl text-muted-foreground font-semibold">Family Network</h2>
        </div>

        {/* Login/Register Options */}
        <div className="max-w-md mx-auto space-y-4">
          <Button 
            size="lg"
            onClick={() => navigate('/login')}
            variant="outline"
            className="w-full py-4 text-lg font-semibold"
          >
            Login to Your Account
          </Button>
          
          <Button 
            size="lg"
            onClick={() => navigate('/register')}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
          >
            Register New Account
          </Button>
        </div>

        {/* Simple Footer */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Breadwinners Family Network. Empowering South Africans financially.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;