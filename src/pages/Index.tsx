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
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={breadwinnersLogo} 
                alt="Breadwinners Family Society" 
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">Breadwinners</h1>
                <p className="text-sm text-muted-foreground">Family Society</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="hidden sm:flex"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              >
                Join Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            South Africa's Premier MLM Platform
          </Badge>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
            Build Your Financial Future
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of South Africans earning through our proven 2x2 matrix system. 
            Start with just R300 and watch your network grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg px-8 py-3 text-lg"
            >
              Start Earning Today
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
              className="px-8 py-3 text-lg"
            >
              Member Login
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">R300</div>
              <div className="text-sm text-muted-foreground">One-time Fee</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Matrix Levels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2</div>
              <div className="text-sm text-muted-foreground">Recruits Needed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">R50</div>
              <div className="text-sm text-muted-foreground">Per Level Earned</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-foreground">How It Works</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our simple 4-step process gets you started earning immediately
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {index + 1}
                </div>
                <p className="text-foreground font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-foreground">Why Choose Breadwinners?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for South Africans, by South Africans. Experience the most reliable MLM platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader className="text-center">
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto text-center max-w-4xl">
          <h3 className="text-4xl font-bold mb-6 text-white">Ready to Join Our Family?</h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Don't wait - every day you delay is money left on the table. 
            Join thousands of successful members today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => navigate('/register')}
              className="bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg font-semibold"
            >
              Get Started Now - R300
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
            >
              Already a Member?
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src={breadwinnersLogo} 
              alt="Breadwinners Family Society" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-semibold text-foreground">Breadwinners Family Society</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 Breadwinners Family Society. Empowering South Africans financially.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;