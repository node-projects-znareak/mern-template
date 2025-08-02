import classNames from "classnames";

interface EmailStatusIndicatorProps {
  isChecking: boolean;
  message: string;
  hasError: boolean;
  hasSuccess: boolean;
  isNetworkError: boolean;
}

export const EmailStatusIndicator = ({ 
  isChecking, 
  message,
  hasError,
  hasSuccess,
  isNetworkError
}: EmailStatusIndicatorProps) => {
  if (isChecking) {
    return (
      <div className={classNames("text-xs text-blue-600 flex items-center")}>
        <span className="animate-pulse">Checking email...</span>
      </div>
    );
  }

  if (message) {
    return (
      <div className={classNames("text-xs flex items-center gap-1", {
        "text-green-600": hasSuccess,
        "text-red-600": hasError,
        "text-orange-600": isNetworkError
      })}>
        {message}
      </div>
    );
  }

  return null;
};
