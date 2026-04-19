'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getDiscountReport } from '@/lib/api';
import type { DiscountReportDto } from '@/lib/types';
import DateRangeFilter from '@/components/DateRangeFilter';

const defaultFrom = () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); };
const defaultTo = () => new Date().toISOString().slice(0, 10);

export default function DiscountReportPage() {
  const [data, setData] = useState<DiscountReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getDiscountReport({ from, to })); }
    catch { toast.error('Failed to load discount report'); }
    finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-white">Discount & Coupon Report</h1>
        <DateRangeFilter from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} loading={loading} />
      </div>

      {/* KPI */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="bg-gray-900 rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-yellow-500/10 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs font-semibold mb-1">Total Discount Given</p>
            <p className="text-yellow-400 text-xl font-black">৳{data.totalDiscountGiven.toLocaleString()}</p>
          </div>
          <div className="bg-blue-500/10 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs font-semibold mb-1">Orders With Discount</p>
            <p className="text-blue-400 text-xl font-black">{data.totalOrdersWithDiscount}</p>
          </div>
        </div>
      )}

      {/* Coupon usage */}
      {!loading && data && data.couponUsage.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-white font-bold">Coupon Usage</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Coupon Code', 'Usage Count', 'Discount Given', 'Revenue Impact'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-5 py-3 text-xs uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.couponUsage.map((row) => (
                  <tr key={row.couponCode} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-5 py-3 text-rose-400 font-bold font-mono">{row.couponCode}</td>
                    <td className="px-5 py-3 text-blue-400 font-bold">{row.usageCount}</td>
                    <td className="px-5 py-3 text-yellow-400 font-bold">৳{row.totalDiscountGiven.toLocaleString()}</td>
                    <td className="px-5 py-3 text-green-400 font-bold">৳{row.revenueImpact.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Discount by source */}
      {!loading && data && data.bySource.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-white font-bold">Discount by Source</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Source', 'Count', 'Total Amount'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-5 py-3 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.bySource.map((row) => (
                  <tr key={row.source} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-5 py-3 text-white font-medium capitalize">{row.source}</td>
                    <td className="px-5 py-3 text-blue-400 font-bold">{row.count}</td>
                    <td className="px-5 py-3 text-yellow-400 font-bold">৳{row.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && data && data.totalOrdersWithDiscount === 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-10 text-center text-gray-500">
          No discounts applied in the selected period
        </div>
      )}
    </div>
  );
}
