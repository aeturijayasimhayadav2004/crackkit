import Link from "next/link";
import { LayoutDashboard, Package, Users, ShoppingBag, Settings, Zap } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/leads", label: "Leads", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-surface flex flex-col flex-shrink-0 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-primary font-bold text-lg">
              <Zap className="inline w-4 h-4" /> Admin
            </span>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-white hover:bg-background transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <Link href="/" className="flex items-center gap-2 text-xs text-text-secondary hover:text-white transition-colors">
            <Settings className="w-3.5 h-3.5" /> Back to site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
