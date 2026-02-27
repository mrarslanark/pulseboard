"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLogout } from "@/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { Activity, FolderKanban, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/activity", label: "Activity", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-800 px-4 py-6">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-lg font-mono font-bold text-white">
          PulseBoard
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === href
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-slate-400 hover:text-white hover:bg-slate-800",
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <Separator className="bg-slate-800 my-4" />

      {/* User */}
      <div className="flex items-center gap-3 px-2">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">
            {user?.name?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {user?.name}
          </p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white"
          onClick={() => logout.mutate()}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </aside>
  );
}
