import Link from "next/link";
import { Logo } from "./Logo";
import { LogoutButton } from "./LogoutButton";
import { getCurrentUser } from "@/lib/auth";
import { Icon } from "@/components/ui/Icon";

export async function Header() {
  const user = await getCurrentUser();

  const navItems = [
    { label: 'Languages', href: '/#languages' },
    { label: 'Reading', href: '/english/reading' },
    { label: 'Listening', href: '/english/listening' },
    { label: 'Dictation', href: '/english/dictation' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-n-200">
      <div className="max-w-container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center flex-1 justify-center gap-7">
          {navItems.map(item => (
            <Link 
              key={item.label} 
              href={item.href}
              className="text-sm font-medium text-n-600 hover:text-blue-500 transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="text-sm font-medium text-n-600 hover:text-n-900 transition-colors mr-2 hidden md:block">
                  Admin
                </Link>
              )}
              <Link href="/dashboard">
                <button className="px-3 py-1.5 text-sm font-medium rounded-btn bg-transparent hover:bg-n-100 text-n-600 transition-colors">
                  Dashboard
                </button>
              </Link>
              <div className="relative group">
                <button className="w-9 h-9 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center cursor-pointer transition-colors hover:bg-blue-100 ml-1">
                  <Icon name="user" size={16} className="text-blue-500" />
                </button>
                <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white shadow-card rounded-xl border border-n-200 py-2 w-48">
                  <div className="px-4 py-2 border-b border-n-100 mb-1">
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div className="text-xs text-n-500 truncate">{user.email}</div>
                  </div>
                  <LogoutButton className="w-full text-left px-4 py-2 text-sm text-n-600 hover:bg-n-50 transition-colors flex items-center gap-2" />
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium rounded-btn bg-transparent hover:bg-n-100 text-n-600 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-btn transition-colors shadow-sm"
              >
                Start learning
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
