'use client';

import Link from 'next/link';
import {
  TrendingUp, DollarSign, Package, RefreshCw,
  Tag, Truck, Star, Users, BarChart3,
} from 'lucide-react';

const REPORTS = [
  {
    href: '/admin/reports/sales',
    label: 'Sales Report',
    desc: 'Revenue, orders, AOV, daily trend & payment breakdown',
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    href: '/admin/reports/profit',
    label: 'Profit Report',
    desc: 'Gross profit, net profit, margin % with COGS breakdown',
    icon: DollarSign,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  {
    href: '/admin/reports/inventory',
    label: 'Inventory Report',
    desc: 'Stock levels, stock value, low & out-of-stock alerts',
    icon: Package,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    href: '/admin/reports/stock-movements',
    label: 'Stock Movement',
    desc: 'IN / OUT / Adjustment log with references',
    icon: RefreshCw,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    href: '/admin/reports/discounts',
    label: 'Discount & Coupon',
    desc: 'Coupon usage, discount totals, revenue impact',
    icon: Tag,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  {
    href: '/admin/reports/shipping',
    label: 'Shipping Report',
    desc: 'Shipping collected, zone-wise & method-wise counts',
    icon: Truck,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  {
    href: '/admin/reports/top-products',
    label: 'Top Products',
    desc: 'Best-selling products & variant-level sales',
    icon: Star,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  {
    href: '/admin/reports/customers',
    label: 'Customer Report',
    desc: 'Total, new, repeat customers & top buyers',
    icon: Users,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
  },
];

export default function ReportsHubPage() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="text-rose-400" size={28} />
        <div>
          <h1 className="text-2xl font-black text-white">Reports & Analytics</h1>
          <p className="text-gray-400 text-sm mt-0.5">Business insights & data reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {REPORTS.map(({ href, label, desc, icon: Icon, color, bg, border }) => (
          <Link
            key={href}
            href={href}
            className={`bg-gray-900 rounded-2xl p-5 border ${border} hover:scale-[1.02] transition-transform group`}
          >
            <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon size={22} className={color} />
            </div>
            <h3 className="text-white font-bold text-sm mb-1 group-hover:text-rose-400 transition-colors">{label}</h3>
            <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
