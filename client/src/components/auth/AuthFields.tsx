import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@/utils/helpers";

const baseInputClasses = [
  "w-full",
  "bg-[#131519]",
  "border",
  "border-white/5",
  "focus:border-[#0075FF]",
  "focus:ring-1",
  "focus:ring-[#0075FF]",
  "text-sm",
  "rounded-xl",
  "py-2.5",
  "text-neutral-200",
  "placeholder-neutral-500",
  "transition",
  "duration-150",
  "outline-none",
  "disabled:opacity-50",
];

interface AuthInputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
}

interface AuthPasswordInputProps extends AuthInputProps {
  ref?: React.Ref<HTMLInputElement>;
}

export const AuthInput = ({ icon, className, ...props }: AuthInputProps) => (
  <div className="relative flex items-center">
    {!!icon && (
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
        {icon}
      </span>
    )}
    <input className={cn(baseInputClasses, icon ? "pl-10 pr-3" : "px-3", className)} {...props} />
  </div>
);

export const AuthPasswordInput = ({ icon, className, ref, ...props }: AuthPasswordInputProps) => {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative flex items-center">
      {!!icon && (
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        type={show ? "text" : "password"}
        className={cn(baseInputClasses, "pl-10 pr-10", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-0 inset-y-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 transition"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <EyeOffIcon key="off" className="h-4 w-4 animate-icon-swap" aria-hidden="true" />
        ) : (
          <EyeIcon key="on" className="h-4 w-4 animate-icon-swap" aria-hidden="true" />
        )}
      </button>
    </div>
  );
};
