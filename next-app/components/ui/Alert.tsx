type AlertVariant = "error" | "success" | "info" | "warning";

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-green-200 bg-green-50 text-green-800",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

/**
 * Inline feedback banner shared across admin clients (errors, success notices,
 * placeholder warnings). Centralized so every banner is styled identically.
 */
export function Alert({ variant = "error", children, className }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-input border px-4 py-2.5 text-sm ${VARIANT_STYLES[variant]} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
