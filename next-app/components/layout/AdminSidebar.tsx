"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

const navItems = [
  { label: "Dashboard",  href: "/admin",           icon: "bar-chart" },
  { label: "Languages",  href: "/admin/languages",  icon: "globe" },
  { label: "Lessons",    href: "/admin/lessons",    icon: "book" },
  { label: "Questions",  href: "/admin/questions",  icon: "edit" },
  { label: "Media",      href: "/admin/media",      icon: "image" },
  { label: "Users",      href: "/admin/users",      icon: "users" },
  { label: "Jobs",       href: "/admin/jobs",       icon: "briefcase" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-n-200 bg-white min-h-screen">
      <nav className="py-4">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-600 border-r-2 border-blue-500"
                  : "text-n-600 hover:bg-n-50 hover:text-n-800"
              )}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
