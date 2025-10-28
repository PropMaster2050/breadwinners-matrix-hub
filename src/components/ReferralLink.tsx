import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ReferralLinkProps {
  referralCode: string;
  className?: string;
}

export const ReferralLink = ({ referralCode, className }: ReferralLinkProps) => {
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Breadwinners Network',
          text: `Join my network using my referral code: ${referralCode}`,
          url: referralLink,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Card className={`p-6 bg-gradient-to-br from-primary/10 to-accent/10 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Your Referral Link</h3>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Share this code with new recruits:
          </p>
          <div className="flex gap-2">
            <Input 
              value={referralCode} 
              readOnly 
              className="font-mono font-bold text-lg text-center bg-background"
            />
            <Button 
              onClick={copyToClipboard} 
              variant="outline"
              size="icon"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Full link:</p>
          <div className="flex gap-2">
            <Input 
              value={referralLink} 
              readOnly 
              className="font-mono text-sm bg-background"
            />
            <Button 
              onClick={shareLink} 
              variant="default"
              size="icon"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            💰 Earn R100 for each direct recruit + bonuses when you complete stages!
          </p>
        </div>
      </div>
    </Card>
  );
};