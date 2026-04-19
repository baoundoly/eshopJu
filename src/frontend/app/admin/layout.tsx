'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, BarChart3, FolderOpen, Tag, Warehouse, Truck } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/admin/shipping', label: 'Shipping', icon: Truck },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();

  useEffect(() => {
    if (!user || !isAdmin) router.replace('/admin/login');
  }, [user, isAdmin, router]);

  if (!user || !isAdmin) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-950 border-r border-gray-800 shrink-0 hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Admin Panel</p>
          <p className="text-white font-bold text-sm mt-0.5">{user.name}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <p className="text-gray-600 text-xs">EshopJu Admin</p>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-950">
        {children}
      </div>
    </div>
  );
}
