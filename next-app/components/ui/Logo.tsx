import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-8 text-lg gap-2",
  md: "h-10 text-xl gap-2",
  lg: "h-12 text-2xl gap-3",
};

const iconSizeMap = {
  sm: 18,
  md: 20,
  lg: 24,
};

export function Logo({ className, size = "md" }: LogoProps) {
  return (
    <div className={cn("flex items-center font-bold text-n-900", sizeMap[size], className)}>
      <div className="bg-blue-600 text-white rounded-lg flex items-center justify-center aspect-square h-full">
        <svg width={iconSizeMap[size]} height={iconSizeMap[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </div>
      <span>LangPath</span>
    </div>
  );
}
