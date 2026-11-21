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
  isNetworkError,
}: EmailStatusIndicatorProps) => {
  if (isChecking) {
    return (
      <div className={classNames("text-xs text-blue-400 flex items-center")}>
        <span className="animate-pulse">Checking email...</span>
      </div>
    );
  }

  if (message) {
    return (
      <div
        className={classNames("text-xs flex items-center gap-1", {
          "text-green-400": hasSuccess,
          "text-red-400": hasError,
          "text-orange-400": isNetworkError,
        })}
      >
        {message}
      </div>
    );
  }

  return null;
};
