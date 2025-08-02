import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-z0-9]/i.test(password)) score++;
  if (password.length >= 12) score++;
  if (score <= 2) return { color: "bg-red-500", label: "Weak" };
  if (score <= 4) return { color: "bg-yellow-400", label: "Medium" };
  return { color: "bg-green-500", label: "Strong" };
}
