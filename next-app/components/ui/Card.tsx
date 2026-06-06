import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-card shadow-card",
        hover && "hover:shadow-hover transition-shadow cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
