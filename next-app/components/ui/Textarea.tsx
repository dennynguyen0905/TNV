"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-sm font-medium text-n-700">{label}</label>}
      <textarea
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "px-3.5 py-2.5 rounded-input text-[15px] leading-snug bg-white text-n-900 outline-none transition-colors border-[1.5px] resize-y",
          error ? "border-red-500" : focused ? "border-blue-500" : "border-n-200",
        )}
        {...props}
      />
      {error && <span className="text-[13px] text-red-500">{error}</span>}
    </div>
  );
}
