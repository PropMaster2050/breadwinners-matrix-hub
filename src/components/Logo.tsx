import breadwinnersLogo from "@/assets/breadwinners-handshake-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={breadwinnersLogo} 
        alt="Breadwinners Family Network" 
        className={`${sizeClasses[size]} rounded-lg`}
      />
      {showText && (
        <div>
          <h2 className={`${textSizes[size]} font-bold text-foreground`}>Breadwinners</h2>
          <p className="text-xs text-muted-foreground">Family Network</p>
        </div>
      )}
    </div>
  );
};