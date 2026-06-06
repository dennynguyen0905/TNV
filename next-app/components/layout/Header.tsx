import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-n-200">
      <div className="max-w-container mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-n-600 hover:text-n-900 transition-colors">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-n-600 hover:text-n-900 transition-colors">
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-n-600 hover:text-n-900 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-btn transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
