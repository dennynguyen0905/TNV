import React from 'react';
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string }[] | string[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-0 border-b-2 border-n-100", className)}>
      {tabs.map(t => {
        const id = typeof t === 'string' ? t : t.id;
        const label = typeof t === 'string' ? t : t.label;
        const isActive = id === active;
        
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "px-5 py-2.5 text-sm font-semibold transition-all mb-[-2px] border-b-2",
              isActive ? "border-blue-500 text-blue-500" : "border-transparent text-n-500 hover:text-n-700 hover:border-n-300"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
