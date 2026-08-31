"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Database,
  Folders,
  FileText,
  HelpCircle,
  LogOut,
  Activity,
} from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/results", label: "Résultats & Export", icon: Database },
  { href: "/admin/participants", label: "Participants", icon: Users },
  { href: "/admin/groups", label: "Groupes", icon: Folders },
  { href: "/admin/cases", label: "Cas d'étude", icon: FileText },
  { href: "/admin/questions", label: "Questions", icon: HelpCircle },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar py-6 px-4 flex flex-col h-full border-r-0 lg:border-r border-slate-200">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
          <Activity size={18} />
        </div>
        <span className="font-bold text-slate-900 tracking-tight text-lg">
          ALMOMKIN
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-item", isActive && "active")}
              onClick={onClose}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <form action={logoutAction}>
          <button type="submit" className="nav-item text-red-600 hover:bg-red-50 hover:text-red-700">
            <LogOut size={18} />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
