import { Info } from "lucide-react";
import WarmTooltip from "./WarmTooltip";

interface PasswordRequirementsTooltipProps {
  password: string;
}

export const PasswordRequirementsTooltip = ({ password }: PasswordRequirementsTooltipProps) => {
  const requirements = [
    { text: "At least 8 characters", isValid: password.length >= 8 },
    { text: "One lowercase letter", isValid: /[a-z]/.test(password) },
    { text: "One uppercase letter", isValid: /[A-Z]/.test(password) },
    { text: "One number", isValid: /\d/.test(password) },
  ];

  return (
    <WarmTooltip
      content={
        <div className="w-56 space-y-1 whitespace-normal">
          {requirements.map((req) => (
            <div
              key={req.text}
              className={`flex items-center gap-2 ${req.isValid ? "text-green-400" : "text-neutral-400"}`}
            >
              <span className="text-xs leading-none">•</span>
              <span className="leading-snug">{req.text}</span>
            </div>
          ))}
        </div>
      }
      side="top"
      surfaceColor="#1d2024"
      inkColor="#e5e7eb"
      size="sm"
      radius={8}
      gap={8}
      arrow
      popScale={0.94}
    >
      <Info
        className="h-4 w-4 text-neutral-400 hover:text-white transition-colors cursor-help"
        aria-label="Password requirements"
      />
    </WarmTooltip>
  );
};

export default PasswordRequirementsTooltip;
