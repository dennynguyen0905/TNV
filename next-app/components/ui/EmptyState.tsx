import { Icon } from "@/components/ui/Icon";

interface EmptyStateProps {
  /** Icon name from the shared Icon set. Defaults to a neutral search glyph. */
  icon?: string;
  title: string;
  description?: string;
  /** Optional call-to-action rendered below the description (e.g. a Link/Button). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Consistent empty / no-results placeholder used across admin tables, the
 * learner dashboard, and public lesson lists. Keep the markup centralized so
 * every surface looks the same.
 */
export function EmptyState({
  icon = "search",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={`py-16 px-6 text-center ${className ?? ""}`}>
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-n-100 text-n-400">
        <Icon name={icon} size={24} />
      </div>
      <p className="text-sm font-medium text-n-700">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-n-400">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
