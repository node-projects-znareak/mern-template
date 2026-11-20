import { cn } from "@/utils/helpers";

interface SpinnerProps {
  label?: string;
  className?: string;
}

const Spinner = ({ label, className }: SpinnerProps) => {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)} role="status" aria-live="polite">
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      {label ? <span className="text-sm text-muted-foreground">{label}</span> : null}
    </div>
  );
};

export default Spinner;
