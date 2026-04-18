'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { getShippingReport } from '@/lib/api';
import type { ShippingReportDto } from '@/lib/types';
import DateRangeFilter from '@/components/DateRangeFilter';

const defaultFrom = () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); };
const defaultTo = () => new Date().toISOString().slice(0, 10);

export default function ShippingReportPage() {
  const [data, setData] = useState<ShippingReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getShippingReport({ from, to })); }
    catch { toast.error('Failed to load shipping report'); }
    finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-white">Shipping Report</h1>
        <DateRangeFilter from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} loading={loading} />
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-gray-900 rounded-2xl h-24 animate-pulse" />)}</div>
      ) : data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-orange-500/10 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs font-semibold mb-1">Total Shipping Collected</p>
            <p className="text-orange-400 text-xl font-black">৳{data.totalShippingCollected.toLocaleString()}</p>
          </div>
          <div className="bg-blue-500/10 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs font-semibold mb-1">Orders With Shipping</p>
            <p className="text-blue-400 text-xl font-black">{data.totalOrdersWithShipping}</p>
          </div>
          <div className="bg-green-500/10 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs font-semibold mb-1">Free Shipping Orders</p>
            <p className="text-green-400 text-xl font-black">{data.freeShippingOrders}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone breakdown */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h2 className="text-white font-bold mb-4">Deliveries by Zone</h2>
          {loading ? (
            <div className="h-48 bg-gray-800 rounded animate-pulse" />
          ) : !data || data.byZone.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.byZone} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis type="category" dataKey="zoneName" tick={{ fill: '#9ca3af', fontSize: 11 }} width={100} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(v: unknown, name: unknown) => [(name as string) === 'deliveryCount' ? (v as number) : `৳${(v as number).toLocaleString()}`, (name as string) === 'deliveryCount' ? 'Deliveries' : 'Collected']}
                />
                <Bar dataKey="deliveryCount" fill="#f97316" name="deliveryCount" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Method breakdown */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h2 className="text-white font-bold mb-4">Deliveries by Method</h2>
          {loading ? (
            <div className="h-48 bg-gray-800 rounded animate-pulse" />
          ) : !data || data.byMethod.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No data</div>
          ) : (
            <div className="space-y-3">
              {data.byMethod.map((m) => (
                <div key={m.methodName} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{m.methodName}</p>
                    <p className="text-gray-500 text-xs">{m.deliveryCount} deliveries</p>
                  </div>
                  <p className="text-orange-400 font-bold">৳{m.totalCollected.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
