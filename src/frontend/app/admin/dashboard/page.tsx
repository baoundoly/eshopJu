'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Clock, DollarSign, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDashboard } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const kpis = stats ? [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Total Revenue', value: `৳${stats.totalRevenue?.toLocaleString() ?? 0}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ] : [];
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-black text-white">Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
              <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
                <k.icon size={20} className={k.color} />
              </div>
              <p className="text-gray-400 text-xs font-semibold mb-1">{k.label}</p>
              <p className={`${k.color} text-2xl font-black`}>{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800">
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-white font-bold">Recent Orders</h2>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : !stats?.recentOrders?.length ? (
          <div className="p-10 text-center text-gray-500">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Order #', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-5 py-3 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4 text-rose-400 font-bold">#{order.orderNumber}</td>
                    <td className="px-5 py-4 text-white">{order.customerName}</td>
                    <td className="px-5 py-4 text-white font-bold">৳{order.totalAmount}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-700 text-gray-400'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-BD')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Products */}
      {stats?.topProducts && stats.topProducts.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-white font-bold">Top Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Product', 'Total Sold'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-5 py-3 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map(({ id, name, totalSold }) => (
                  <tr key={id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-5 py-4 text-white font-medium">{name}</td>
                    <td className="px-5 py-4 text-green-400 font-bold">{totalSold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
