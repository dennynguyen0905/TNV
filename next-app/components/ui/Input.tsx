"use client";

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-n-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "px-3 py-2 text-sm rounded-input border border-n-200 bg-white text-n-900",
          "placeholder:text-n-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500",
          "transition-colors",
          error && "border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-n-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "px-3 py-2 text-sm rounded-input border border-n-200 bg-white text-n-900",
          "placeholder:text-n-400 resize-y min-h-[80px]",
          "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500",
          "transition-colors",
          error && "border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function SelectInput({ label, error, options, className, id, ...props }: SelectInputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-n-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "px-3 py-2 text-sm rounded-input border border-n-200 bg-white text-n-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500",
          "transition-colors",
          error && "border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
