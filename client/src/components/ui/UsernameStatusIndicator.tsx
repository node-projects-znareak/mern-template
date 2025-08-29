import classNames from "classnames";

interface UsernameStatusIndicatorProps {
  isChecking: boolean;
  message: string;
  hasError: boolean;
  hasSuccess: boolean;
  isNetworkError: boolean;
}

export const UsernameStatusIndicator = ({ 
  isChecking, 
  message,
  hasError,
  hasSuccess,
  isNetworkError
}: UsernameStatusIndicatorProps) => {
  if (isChecking) {
    return (
      <div className={classNames("text-xs text-blue-600 flex items-center gap-1 mt-1")}>
        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Checking username availability...</span>
      </div>
    );
  }

  if (message) {
    return (
      <div className={classNames("text-xs flex items-center gap-1 mt-1 font-medium", {
        "text-green-600": hasSuccess,
        "text-red-600": hasError && !isNetworkError,
        "text-orange-600": isNetworkError
      })}>
        {hasSuccess ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : null}
        {(hasError && !isNetworkError) ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : null}
        {isNetworkError ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : null}
        <span>{message}</span>
      </div>
    );
  }

  return null;
};
