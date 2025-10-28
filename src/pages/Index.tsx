import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Eye, EyeOff, User, Lock } from "lucide-react";
import breadwinnersLogo from "@/assets/breadwinners-handshake-logo.png";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(username, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-8 pt-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src={breadwinnersLogo} 
                alt="Breadwinners Family Network" 
                className="w-28 h-28"
              />
            </div>
            
            {/* Company Name */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-800">Breadwinners</h1>
              <h2 className="text-lg font-semibold text-green-600">Family Network</h2>
            </div>
            
            {/* Section Title */}
            <div className="pt-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Member Login</CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                Login into Your Personal Back Office
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isLoading ? "Signing in..." : "Sign in"}
                {!isLoading && (
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-4 text-center">
              <Link 
                to="/forgot-password" 
                className="text-blue-500 hover:text-blue-700 text-sm font-medium block"
              >
                Forgot password?
              </Link>
              
              <div className="text-sm text-gray-600">
                Don't have account?{" "}
                <Link 
                  to="/register" 
                  className="text-blue-500 hover:text-blue-700 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2025 <span className="text-blue-600 font-medium">Breadwinners Family Network</span>. All right reserved
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Empowering South Africans financially
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;