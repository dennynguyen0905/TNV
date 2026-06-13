"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[] | string[];
}

export function SelectInput({ label, options, className, ...props }: SelectInputProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-sm font-medium text-n-700">{label}</label>}
      <select
        className="px-3.5 py-2.5 rounded-input text-[15px] bg-white text-n-900 outline-none border-[1.5px] border-n-200 cursor-pointer appearance-auto"
        {...props}
      >
        {options.map((o, idx) => {
          const val = typeof o === 'string' ? o : o.value;
          const text = typeof o === 'string' ? o : o.label;
          return <option key={idx} value={val}>{text}</option>;
        })}
      </select>
    </div>
  );
}
