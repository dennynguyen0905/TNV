"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Icon } from './Icon';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (val: string) => void;
}

export function SearchInput({ value, onChange, className, ...props }: SearchInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Icon 
        name="search" 
        size={18} 
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-n-400" 
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "w-full py-2.5 pl-10 pr-3.5 rounded-input text-[15px] bg-white text-n-900 outline-none transition-colors border-[1.5px]",
          focused ? "border-blue-500" : "border-n-200"
        )}
        {...props}
      />
    </div>
  );
}
