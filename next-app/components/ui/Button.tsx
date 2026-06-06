"use client";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantMap: Record<ButtonVariant, string> = {
  primary:   "bg-blue-500 hover:bg-blue-600 text-white border-transparent",
  secondary: "bg-white hover:bg-n-50 text-n-700 border border-n-200",
  ghost:     "bg-transparent hover:bg-n-100 text-n-600 border-transparent",
  danger:    "bg-red-500 hover:bg-red-600 text-white border-transparent",
};

const sizeMap: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 font-medium rounded-btn transition-colors",
        variantMap[variant],
        sizeMap[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
