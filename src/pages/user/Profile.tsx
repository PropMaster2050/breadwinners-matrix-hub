import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Lock } from "lucide-react";

const Profile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.mobile || "",
    dateOfBirth: "",
    gender: user?.gender || "",
    address: user?.physicalAddress || "",
    city: "",
    province: user?.province || "",
    postalCode: ""
  });

  const handleInputChange = (field: string, value: string) => {
    if (isLocked) return; // Prevent changes when locked
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsLocked(true);
    toast({
      title: "Profile Locked",
      description: "Your profile information has been permanently saved and locked.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and account details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your basic personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                disabled={isLocked}
                className={isLocked ? "bg-muted text-muted-foreground" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isLocked}
                className={isLocked ? "bg-muted text-muted-foreground" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isLocked}
                className={isLocked ? "bg-muted text-muted-foreground" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                disabled={isLocked}
                className={isLocked ? "bg-muted text-muted-foreground" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)} disabled={isLocked}>
                <SelectTrigger className={isLocked ? "bg-muted text-muted-foreground" : ""}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>
              Your residential address and location details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                disabled={isLocked}
                className={isLocked ? "bg-muted text-muted-foreground" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={isLocked}
                className={isLocked ? "bg-muted text-muted-foreground" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)} disabled={isLocked}>
                <SelectTrigger className={isLocked ? "bg-muted text-muted-foreground" : ""}>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gauteng">Gauteng</SelectItem>
                  <SelectItem value="western-cape">Western Cape</SelectItem>
                  <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                  <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                  <SelectItem value="free-state">Free State</SelectItem>
                  <SelectItem value="limpopo">Limpopo</SelectItem>
                  <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                  <SelectItem value="north-west">North West</SelectItem>
                  <SelectItem value="northern-cape">Northern Cape</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                disabled={isLocked}
                className={isLocked ? "bg-muted text-muted-foreground" : ""}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleSave} className="w-full max-w-md" disabled={isLocked}>
          {isLocked ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Profile Locked
            </>
          ) : (
            "Save & Lock Profile"
          )}
        </Button>
      </div>
      {isLocked && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          Your profile has been permanently locked and cannot be edited.
        </p>
      )}
    </div>
  );
};

export default Profile;