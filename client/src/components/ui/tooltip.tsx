import { useState, ReactNode } from "react";
import classNames from "classnames";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export const Tooltip = ({ 
  children, 
  content, 
  position = "top",
  className = "",
  contentClassName = "",
  disabled = false 
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  if (disabled) {
    return <>{children}</>;
  }

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return {
          content: "bottom-full mb-2",
          arrow: "top-full border-t-popover border-l-transparent border-r-transparent border-b-transparent"
        };
      case "bottom":
        return {
          content: "top-full mt-2",
          arrow: "bottom-full border-b-popover border-l-transparent border-r-transparent border-t-transparent"
        };
      case "left":
        return {
          content: "right-full mr-2",
          arrow: "left-full border-l-popover border-t-transparent border-b-transparent border-r-transparent"
        };
      case "right":
        return {
          content: "left-full ml-2",
          arrow: "right-full border-r-popover border-t-transparent border-b-transparent border-l-transparent"
        };
      default:
        return {
          content: "bottom-full mb-2",
          arrow: "top-full border-t-popover border-l-transparent border-r-transparent border-b-transparent"
        };
    }
  };

  const positionClasses = getPositionClasses();

  return (
    <div 
      className={classNames("relative inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
          className={classNames(
            "absolute z-50 px-3 py-2 bg-popover border rounded-md shadow-lg",
            "text-sm text-popover-foreground",
            "whitespace-nowrap max-w-xs",
            positionClasses.content,
            contentClassName
          )}
        >
          {content}
          
          <div 
            className={classNames(
              "absolute w-0 h-0 border-4",
              positionClasses.arrow,
              position === "top" && "left-1/2 transform -translate-x-1/2",
              position === "bottom" && "left-1/2 transform -translate-x-1/2",
              position === "left" && "top-1/2 transform -translate-y-1/2",
              position === "right" && "top-1/2 transform -translate-y-1/2"
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
