'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import { getTopProductsReport } from '@/lib/api';
import type { TopProductsReportDto } from '@/lib/types';
import DateRangeFilter from '@/components/DateRangeFilter';

const defaultFrom = () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); };
const defaultTo = () => new Date().toISOString().slice(0, 10);

export default function TopProductsReportPage() {
  const [data, setData] = useState<TopProductsReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [tab, setTab] = useState<'products' | 'variants'>('products');

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getTopProductsReport({ from, to, top: 10 })); }
    catch { toast.error('Failed to load top products report'); }
    finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-white">Top Products</h1>
        <DateRangeFilter from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} loading={loading} />
      </div>

      {/* Bar chart */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <h2 className="text-white font-bold mb-4">Best-Selling Products (by quantity)</h2>
        {loading ? (
          <div className="h-64 bg-gray-800 rounded animate-pulse" />
        ) : !data || data.products.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.products} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis type="category" dataKey="productName" tick={{ fill: '#9ca3af', fontSize: 11 }} width={140} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="totalSold" fill="#f43f5e" name="Units Sold" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {(['products', 'variants'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border capitalize transition-colors ${tab === t ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-700 text-gray-400 hover:border-rose-500 hover:text-white'}`}>
            {t === 'products' ? 'By Product' : 'By Variant'}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
          ) : !data || data.products.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['#', 'Product', 'Units Sold', 'Revenue', 'Orders'].map((h) => (
                      <th key={h} className="text-left text-gray-500 font-semibold px-5 py-3 text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((p, i) => (
                    <tr key={p.productId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-5 py-3 text-gray-500 font-bold">{i + 1}</td>
                      <td className="px-5 py-3 text-white font-medium">{p.productName}</td>
                      <td className="px-5 py-3 text-rose-400 font-black">{p.totalSold}</td>
                      <td className="px-5 py-3 text-green-400 font-bold">৳{p.revenue.toLocaleString()}</td>
                      <td className="px-5 py-3 text-blue-400">{p.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'variants' && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
          ) : !data || data.variants.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['#', 'Product', 'Variant', 'Units Sold', 'Revenue'].map((h) => (
                      <th key={h} className="text-left text-gray-500 font-semibold px-5 py-3 text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.variants.map((v, i) => (
                    <tr key={v.variantId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-5 py-3 text-gray-500 font-bold">{i + 1}</td>
                      <td className="px-5 py-3 text-white font-medium">{v.productName}</td>
                      <td className="px-5 py-3 text-gray-300 text-xs">{v.variantLabel}</td>
                      <td className="px-5 py-3 text-rose-400 font-black">{v.totalSold}</td>
                      <td className="px-5 py-3 text-green-400 font-bold">৳{v.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
