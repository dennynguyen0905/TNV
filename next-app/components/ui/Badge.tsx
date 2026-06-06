"use client";

import { cn } from "@/lib/utils";

type BadgeColor = "blue" | "green" | "amber" | "red" | "gray" | "purple";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorMap: Record<BadgeColor, string> = {
  blue:   "bg-blue-50   text-blue-700   border border-blue-200",
  green:  "bg-green-50  text-green-700  border border-green-200",
  amber:  "bg-amber-50  text-amber-600  border border-amber-200",
  red:    "bg-red-50    text-red-600    border border-red-200",
  gray:   "bg-n-100     text-n-600      border border-n-200",
  purple: "bg-purple-50 text-purple-700 border border-purple-200",
};

export function Badge({ children, color = "blue", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-badge",
        colorMap[color],
        className
      )}
    >
      {children}
    </span>
  );
}
