import { Info } from "lucide-react";
import { Tooltip } from "./tooltip";

interface PasswordRequirementsTooltipProps {
  password: string;
  className?: string;
}

export const PasswordRequirementsTooltip = ({ 
  password, 
  className = "" 
}: PasswordRequirementsTooltipProps) => {
  const requirements = [
    {
      text: "At least 8 characters",
      isValid: password.length >= 8
    },
    {
      text: "One lowercase letter",
      isValid: /[a-z]/.test(password)
    },
    {
      text: "One uppercase letter", 
      isValid: /[A-Z]/.test(password)
    },
    {
      text: "One number",
      isValid: /\d/.test(password)
    }
  ];

  const tooltipContent = (
    <div className="text-xs space-y-1 whitespace-normal w-48">
      {requirements.map((req, index) => (
        <div 
          key={index}
          className={`flex items-center gap-2 ${
            req.isValid ? 'text-green-600' : 'text-muted-foreground'
          }`}
        >
          <span className="text-xs">•</span>
          <span>{req.text}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Tooltip 
      content={tooltipContent}
      position="top"
      className={className}
      contentClassName="w-auto whitespace-normal"
    >
      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
    </Tooltip>
  );
};

export default PasswordRequirementsTooltip;
