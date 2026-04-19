'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import { getSalesReport } from '@/lib/api';
import type { SalesReportDto } from '@/lib/types';
import DateRangeFilter from '@/components/DateRangeFilter';

const PIE_COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const defaultFrom = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};
const defaultTo = () => new Date().toISOString().slice(0, 10);

export default function SalesReportPage() {
  const [data, setData] = useState<SalesReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSalesReport({ from, to });
      setData(result);
    } catch {
      toast.error('Failed to load sales report');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { fetch(); }, [fetch]);

  const kpis = data ? [
    { label: 'Total Revenue', value: `৳${data.totalRevenue.toLocaleString()}`, color: 'text-green-400' },
    { label: 'Total Orders', value: data.totalOrders, color: 'text-blue-400' },
    { label: 'Avg Order Value', value: `৳${data.averageOrderValue.toLocaleString()}`, color: 'text-purple-400' },
    { label: 'Total Discounts', value: `৳${data.totalDiscounts.toLocaleString()}`, color: 'text-yellow-400' },
    { label: 'Shipping Collected', value: `৳${data.totalShipping.toLocaleString()}`, color: 'text-cyan-400' },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-white">Sales Report</h1>
        <DateRangeFilter from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} loading={loading} />
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-gray-900 rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <p className="text-gray-400 text-xs font-semibold mb-1">{k.label}</p>
              <p className={`${k.color} text-xl font-black`}>{k.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h2 className="text-white font-bold mb-4">Sales Trend</h2>
          {loading || !data ? (
            <div className="h-56 bg-gray-800 rounded animate-pulse" />
          ) : data.byDay.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-500 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#f43f5e' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={2} dot={false} name="Revenue (৳)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment Method Pie */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h2 className="text-white font-bold mb-4">Payment Methods</h2>
          {loading || !data ? (
            <div className="h-56 bg-gray-800 rounded animate-pulse" />
          ) : data.byPaymentMethod.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-500 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.byPaymentMethod} dataKey="revenue" nameKey="paymentMethod" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {data.byPaymentMethod.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(v: unknown) => [`৳${(v as number).toLocaleString()}`, 'Revenue']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      {!loading && data && data.byStatus.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h2 className="text-white font-bold mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.byStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="status" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="count" fill="#3b82f6" name="Orders" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily Table */}
      {!loading && data && data.byDay.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-white font-bold">Daily Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Date', 'Orders', 'Revenue'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-5 py-3 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.byDay.map((row) => (
                  <tr key={row.date} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-5 py-3 text-gray-300">{row.date}</td>
                    <td className="px-5 py-3 text-blue-400 font-bold">{row.orders}</td>
                    <td className="px-5 py-3 text-green-400 font-bold">৳{row.revenue.toLocaleString()}</td>
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
