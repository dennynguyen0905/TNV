import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md";
}

export function Logo({ size = "md" }: LogoProps) {
  const textSize = size === "sm" ? "text-lg" : "text-xl";
  return (
    <Link href="/" className="flex items-center gap-2 no-underline">
      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">L</span>
      </div>
      <span className={`${textSize} font-bold text-n-900`}>LangPath</span>
    </Link>
  );
}
