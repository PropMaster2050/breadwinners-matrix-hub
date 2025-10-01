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
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
        accentColor: "#C0C0C0",
        shadowColor: "#C0C0C0",
        stageName: "SILVER",
        textColor: "#FFFFFF",
        badgeColor: "#C0C0C0"
      };
    case 2:
      return {
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
        accentColor: "#FFD700",
        shadowColor: "#FFD700",
        stageName: "GOLD",
        textColor: "#FFFFFF",
        badgeColor: "#FFD700"
      };
    case 3:
      return {
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
        accentColor: "#E5E4E2",
        shadowColor: "#E5E4E2",
        stageName: "PLATINUM",
        textColor: "#FFFFFF",
        badgeColor: "#E5E4E2"
      };
    case 4:
      return {
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
        accentColor: "#878681",
        shadowColor: "#878681",
        stageName: "TITANIUM",
        textColor: "#FFFFFF",
        badgeColor: "#878681"
      };
    default:
      return {
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
        accentColor: "#C0C0C0",
        shadowColor: "#C0C0C0",
        stageName: "SILVER",
        textColor: "#FFFFFF",
        badgeColor: "#C0C0C0"
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
    <div className="relative w-full max-w-[420px]">
      <Card 
        className="w-full h-[260px] p-6 relative overflow-hidden border-0 shadow-2xl rounded-2xl"
        style={{
          background: cardStyle.background,
          boxShadow: `0 20px 60px -15px ${cardStyle.shadowColor}60, 0 0 30px ${cardStyle.shadowColor}20`
        }}
      >
        {/* Diagonal accent lines */}
        <div 
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: `linear-gradient(135deg, transparent 0%, ${cardStyle.accentColor}15 45%, transparent 50%, ${cardStyle.accentColor}15 95%, transparent 100%)`
          }}
        />
        <div 
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full"
          style={{
            background: `radial-gradient(circle, ${cardStyle.accentColor}10 0%, transparent 70%)`
          }}
        />
        
        {/* Blue accent line */}
        <div 
          className="absolute top-0 left-0 w-1 h-full"
          style={{ background: `linear-gradient(180deg, #1e90ff 0%, transparent 100%)` }}
        />
        
        {/* Golden accent lines */}
        <div 
          className="absolute top-6 left-6 right-6 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${cardStyle.accentColor}80 50%, transparent 100%)` }}
        />
        <div 
          className="absolute bottom-6 left-6 right-6 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${cardStyle.accentColor}80 50%, transparent 100%)` }}
        />
        
        {/* Logo and Network Name */}
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 p-1 shadow-lg">
              <Logo />
            </div>
            <div>
              <div className="text-xs font-bold tracking-wide" style={{ color: cardStyle.textColor }}>
                BREADWINNERS FAMILY
              </div>
              <div className="text-[10px] opacity-70" style={{ color: cardStyle.textColor }}>
                NETWORK
              </div>
            </div>
          </div>
          <div 
            className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${cardStyle.badgeColor}40 0%, ${cardStyle.badgeColor}20 100%)`,
              border: `2px solid ${cardStyle.badgeColor}60`
            }}
          >
            <span className="text-xs font-black" style={{ color: cardStyle.badgeColor }}>
              {user.stage}
            </span>
          </div>
        </div>

        {/* Chip design */}
        <div 
          className="relative z-10 w-12 h-9 rounded mb-6 shadow-md"
          style={{
            background: `linear-gradient(145deg, ${cardStyle.accentColor}60, ${cardStyle.accentColor}30)`,
            border: `1px solid ${cardStyle.accentColor}80`
          }}
        >
          <div className="w-full h-full grid grid-cols-3 gap-[1px] p-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div 
                key={i} 
                className="rounded-[1px]"
                style={{ background: `${cardStyle.textColor}30` }}
              />
            ))}
          </div>
        </div>

        {/* Membership Number */}
        <div className="relative z-10 mb-6">
          <div 
            className="text-xl font-black tracking-[0.25em] font-mono"
            style={{ color: cardStyle.textColor, textShadow: `0 2px 10px ${cardStyle.accentColor}30` }}
          >
            {formatMembershipNumber(user.memberId)}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <div className="text-sm font-bold tracking-wide mb-1" style={{ color: cardStyle.textColor }}>
              {user.fullName.toUpperCase()}
            </div>
            <div className="text-[9px] opacity-60" style={{ color: cardStyle.textColor }}>
              {user.memberId}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] opacity-60 mb-1" style={{ color: cardStyle.textColor }}>
              MONTH/YEAR
            </div>
            <div className="text-sm font-bold tracking-wider" style={{ color: cardStyle.textColor }}>
              EXP 12/29
            </div>
          </div>
        </div>

        {/* Stage Badge Bottom Right */}
        <div 
          className="absolute bottom-6 right-6 px-3 py-1 rounded-full text-[10px] font-black tracking-wider"
          style={{ 
            background: `linear-gradient(135deg, ${cardStyle.badgeColor}40, ${cardStyle.badgeColor}20)`,
            border: `1px solid ${cardStyle.badgeColor}60`,
            color: cardStyle.badgeColor
          }}
        >
          {cardStyle.stageName}
        </div>
      </Card>
    </div>
  );
};