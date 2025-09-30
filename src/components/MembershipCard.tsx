import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { User } from "@/hooks/useAuth";

interface MembershipCardProps {
  user: User;
}

const getCardStyle = (stage: number) => {
  switch (stage) {
    case 1:
      return {
        background: "linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #C0C0C0 100%)",
        border: "2px solid #B8860B",
        shadowColor: "#C0C0C0",
        stageName: "SILVER",
        textColor: "#2D3748"
      };
    case 2:
      return {
        background: "linear-gradient(135deg, #FFD700 0%, #FFF8DC 50%, #FFD700 100%)",
        border: "2px solid #B8860B",
        shadowColor: "#FFD700",
        stageName: "GOLD",
        textColor: "#2D3748"
      };
    case 3:
      return {
        background: "linear-gradient(135deg, #E5E4E2 0%, #F8F8F8 50%, #E5E4E2 100%)",
        border: "2px solid #B8860B",
        shadowColor: "#E5E4E2",
        stageName: "PLATINUM",
        textColor: "#2D3748"
      };
    case 4:
      return {
        background: "linear-gradient(135deg, #878681 0%, #C4C4C4 50%, #878681 100%)",
        border: "2px solid #B8860B",
        shadowColor: "#878681",
        stageName: "TITANIUM",
        textColor: "#FFFFFF"
      };
    default:
      return {
        background: "linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #C0C0C0 100%)",
        border: "2px solid #B8860B",
        shadowColor: "#C0C0C0",
        stageName: "SILVER",
        textColor: "#2D3748"
      };
  }
};

const formatMembershipNumber = (memberId: string) => {
  // Convert memberId to look like credit card number format
  const cleanId = memberId.replace(/\D/g, ''); // Remove non-digits
  const padded = cleanId.padStart(16, '0'); // Pad to 16 digits
  return padded.replace(/(.{4})/g, '$1 ').trim(); // Add spaces every 4 digits
};

export const MembershipCard = ({ user }: MembershipCardProps) => {
  const cardStyle = getCardStyle(user.stage);
  
  return (
    <div className="relative">
      <Card 
        className="w-full max-w-[400px] h-[250px] p-6 relative overflow-hidden border-0 shadow-2xl"
        style={{
          background: cardStyle.background,
          border: cardStyle.border,
          boxShadow: `0 20px 40px -10px ${cardStyle.shadowColor}50, 0 0 20px ${cardStyle.shadowColor}30`
        }}
      >
        {/* Shiny overlay effect */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)`
          }}
        />
        
        {/* Golden accent lines */}
        <div className="absolute top-4 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />
        <div className="absolute bottom-4 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />
        
        {/* Logo and Card Title */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8">
              <Logo />
            </div>
            <span className="text-xs font-bold" style={{ color: cardStyle.textColor }}>
              BREADWINNERS FAMILY
            </span>
          </div>
          <div 
            className="text-xs font-black tracking-wider px-2 py-1 rounded"
            style={{ 
              color: cardStyle.textColor,
              background: `${cardStyle.shadowColor}30`
            }}
          >
            {cardStyle.stageName}
          </div>
        </div>

        {/* Member Name */}
        <div className="mb-6">
          <div className="text-lg font-bold tracking-wide" style={{ color: cardStyle.textColor }}>
            {user.fullName.toUpperCase()}
          </div>
        </div>

        {/* Membership Number (styled like credit card) */}
        <div className="mb-4">
          <div 
            className="text-lg font-black tracking-[0.2em] font-mono"
            style={{ color: cardStyle.textColor }}
          >
            {formatMembershipNumber(user.memberId)}
          </div>
        </div>

        {/* Bottom Row - Member ID and Expiry */}
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] opacity-70" style={{ color: cardStyle.textColor }}>
              MEMBER ID
            </div>
            <div className="text-sm font-bold" style={{ color: cardStyle.textColor }}>
              {user.memberId}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] opacity-70" style={{ color: cardStyle.textColor }}>
              VALID THRU
            </div>
            <div className="text-sm font-bold" style={{ color: cardStyle.textColor }}>
              12/29
            </div>
          </div>
        </div>

        {/* Chip design */}
        <div 
          className="absolute top-16 left-6 w-10 h-8 rounded border"
          style={{
            background: `linear-gradient(145deg, ${cardStyle.shadowColor}80, ${cardStyle.shadowColor}40)`,
            border: `1px solid ${cardStyle.textColor}40`
          }}
        >
          <div className="w-full h-full grid grid-cols-3 gap-[1px] p-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div 
                key={i} 
                className="rounded-[1px]"
                style={{ background: `${cardStyle.textColor}20` }}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};