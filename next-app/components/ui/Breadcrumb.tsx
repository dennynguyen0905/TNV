import React from 'react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center text-sm font-medium text-n-500 gap-2 mb-6", className)}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-n-400">/</span>}
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-n-900 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-n-900">{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
