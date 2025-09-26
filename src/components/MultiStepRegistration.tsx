import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, CreditCard, User, MapPin, Shield, ArrowLeft, ArrowRight } from "lucide-react";
import breadwinnersLogo from "@/assets/breadwinners-logo.png";
import { Progress } from "@/components/ui/progress";

interface RegisterData {
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
  transactionPin: string;
  confirmTransactionPin: string;
  mobile: string;
  email: string;
  physicalAddress: string;
  province: string;
  age: string;
  gender: string;
  sponsorId: string;
  epin: string;
}

const provinces = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
];

const MultiStepRegistration = () => {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterData>({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    transactionPin: "",
    confirmTransactionPin: "",
    mobile: "",
    email: "",
    physicalAddress: "",
    province: "",
    age: "",
    gender: "",
    sponsorId: "",
    epin: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showTransactionPin, setShowTransactionPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    return formData.fullName && formData.username && formData.password && 
           formData.confirmPassword && formData.mobile && formData.email && 
           formData.physicalAddress && formData.province && formData.age && 
           formData.gender && formData.transactionPin && formData.confirmTransactionPin;
  };

  const validatePasswords = () => {
    return formData.password === formData.confirmPassword && 
           formData.transactionPin === formData.confirmTransactionPin &&
           formData.password.length >= 6 && 
           formData.transactionPin.length === 4;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1() && validatePasswords()) {
      setStep(2);
    }
  };

  const handlePrevious = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 2 || !formData.epin) return;
    
    setIsLoading(true);
    
    try {
      const registrationData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined
      };
      await register(registrationData);
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / 2) * 100;

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
              <p className="text-sm text-muted-foreground">Family Network</p>
            </div>
          </Link>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {step === 1 ? "Personal Details" : "Voucher Purchase"}
            </CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              {step === 1 ? (
                <>
                  <User className="h-4 w-4" />
                  Complete your profile information
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Enter your R300 voucher code
                </>
              )}
            </CardDescription>
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">Step {step} of 2</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full legal name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 6 characters"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm *</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="transactionPin">Transaction PIN *</Label>
                      <div className="relative">
                        <Input
                          id="transactionPin"
                          name="transactionPin"
                          type={showTransactionPin ? "text" : "password"}
                          placeholder="4-digit PIN"
                          value={formData.transactionPin}
                          onChange={handleInputChange}
                          required
                          maxLength={4}
                          className="h-11 pr-10 font-mono"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowTransactionPin(!showTransactionPin)}
                        >
                          {showTransactionPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmTransactionPin">Confirm PIN *</Label>
                      <Input
                        id="confirmTransactionPin"
                        name="confirmTransactionPin"
                        type="password"
                        placeholder="Confirm PIN"
                        value={formData.confirmTransactionPin}
                        onChange={handleInputChange}
                        required
                        maxLength={4}
                        className="h-11 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number *</Label>
                      <Input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        placeholder="+27123456789"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="physicalAddress">Physical Address *</Label>
                    <Input
                      id="physicalAddress"
                      name="physicalAddress"
                      type="text"
                      placeholder="Your full physical address"
                      value={formData.physicalAddress}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="province">Province *</Label>
                      <Select value={formData.province} onValueChange={(value) => handleSelectChange("province", value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province} value={province}>{province}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="18+"
                        min="18"
                        max="100"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sponsorId">Sponsor ID (Optional)</Label>
                    <Input
                      id="sponsorId"
                      name="sponsorId"
                      type="text"
                      placeholder="Enter sponsor member ID"
                      value={formData.sponsorId}
                      onChange={handleInputChange}
                      className="h-11"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-semibold"
                    disabled={!validateStep1() || !validatePasswords()}
                  >
                    Continue to Voucher
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="epin" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Voucher E-Pin Code *
                    </Label>
                    <Input
                      id="epin"
                      name="epin"
                      type="text"
                      placeholder="Enter your R300 voucher code"
                      value={formData.epin}
                      onChange={handleInputChange}
                      required
                      className="h-11 font-mono text-center text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the voucher code you purchased for R300
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handlePrevious}
                      variant="outline"
                      className="flex-1 h-12"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-semibold"
                      disabled={isLoading || !formData.epin}
                    >
                      {isLoading ? "Processing..." : "Join Network"}
                    </Button>
                  </div>
                </>
              )}

              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Sign In
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

export default MultiStepRegistration;