import { cn } from "@/utils/helpers";

interface SpinnerProps {
  className?: string;
  label?: string;
}

export default function Spinner({ className, label = "Cargando..." }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("size-8 animate-spin rounded-full border-4 border-primary border-t-transparent", className)}
    />
  );
}
