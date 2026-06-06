import Link from "next/link";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Logo } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/Badge";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-n-50 flex flex-col">
      {/* Admin header */}
      <header className="sticky top-0 z-40 bg-white border-b border-n-200 h-16 flex items-center px-6 gap-4">
        <Logo />
        <Badge color="amber">Admin</Badge>
        <div className="flex-1" />
        <Link
          href="/"
          className="text-sm font-medium text-n-600 hover:text-n-900 transition-colors"
        >
          View site →
        </Link>
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
          A
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
