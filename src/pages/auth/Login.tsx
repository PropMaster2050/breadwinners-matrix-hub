import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import breadwinnersLogo from "@/assets/breadwinners-logo.png";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedCredentials = localStorage.getItem('rememberedCredentials');
    if (rememberedCredentials) {
      try {
        const { email: savedEmail, password: savedPassword } = JSON.parse(rememberedCredentials);
        setEmail(savedEmail || "");
        setPassword(savedPassword || "");
      } catch (error) {
        console.error("Error loading saved credentials");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        // Save credentials to localStorage for next time
        localStorage.setItem('rememberedCredentials', JSON.stringify({ email, password }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src={breadwinnersLogo} 
              alt="Breadwinners Family Society" 
              className="w-12 h-12 rounded-xl"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Breadwinners</h1>
              <p className="text-sm text-muted-foreground">Family Society</p>
            </div>
          </Link>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Join Breadwinners
                  </Link>
                </p>
              </div>

              <div className="text-center">
                <Link 
                  to="/" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Login;