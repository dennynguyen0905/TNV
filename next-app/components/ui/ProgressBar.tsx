import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "blue" | "green" | "amber";
  className?: string;
  showLabel?: boolean;
}

const colorMap = {
  blue:  "bg-blue-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
};

export function ProgressBar({ value, max = 100, color = "blue", className, showLabel }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-2 bg-n-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", colorMap[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-n-500 w-10 text-right">{Math.round(pct)}%</span>}
    </div>
  );
}
