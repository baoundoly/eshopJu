'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getProfitReport } from '@/lib/api';
import type { ProfitReportDto } from '@/lib/types';
import DateRangeFilter from '@/components/DateRangeFilter';

const defaultFrom = () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); };
const defaultTo = () => new Date().toISOString().slice(0, 10);

export default function ProfitReportPage() {
  const [data, setData] = useState<ProfitReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getProfitReport({ from, to })); }
    catch { toast.error('Failed to load profit report'); }
    finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { fetch(); }, [fetch]);

  const kpis = data ? [
    { label: 'Total Revenue', value: `৳${data.totalRevenue.toLocaleString()}`, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total COGS', value: `৳${data.totalCost.toLocaleString()}`, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Gross Profit', value: `৳${data.grossProfit.toLocaleString()}`, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Net Profit', value: `৳${data.netProfit.toLocaleString()}`, color: data.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400', bg: data.netProfit >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10' },
    { label: 'Profit Margin', value: `${data.profitMarginPercent}%`, color: data.profitMarginPercent >= 20 ? 'text-green-400' : data.profitMarginPercent >= 10 ? 'text-yellow-400' : 'text-red-400', bg: 'bg-purple-500/10' },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Profit Report</h1>
          <p className="text-gray-400 text-xs mt-0.5">Formula: Revenue − COGS − Discounts</p>
        </div>
        <DateRangeFilter from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} loading={loading} />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-gray-900 rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className={`${k.bg} rounded-2xl p-4 border border-gray-800`}>
              <p className="text-gray-400 text-xs font-semibold mb-1">{k.label}</p>
              <p className={`${k.color} text-xl font-black`}>{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Profit formula breakdown */}
      {!loading && data && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h2 className="text-white font-bold mb-4">Profit Breakdown</h2>
          <div className="space-y-2 text-sm max-w-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Revenue</span>
              <span className="text-white font-bold">৳{data.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">− Cost of Goods (COGS)</span>
              <span className="text-red-400 font-bold">−৳{data.totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-2">
              <span className="text-gray-300 font-semibold">= Gross Profit</span>
              <span className="text-green-400 font-black">৳{data.grossProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">− Discounts</span>
              <span className="text-yellow-400 font-bold">−৳{data.totalDiscounts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-2">
              <span className="text-white font-black">= Net Profit</span>
              <span className={`font-black text-lg ${data.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>৳{data.netProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 pt-1">
              <span>Shipping collected</span>
              <span className="text-cyan-400">+৳{data.totalShippingCollected.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Per-product table */}
      {!loading && data && data.byProduct.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-white font-bold">Per-Product Profit</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Product', 'Qty Sold', 'Revenue', 'COGS', 'Gross Profit', 'Margin'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-5 py-3 text-xs uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.byProduct.map((row) => (
                  <tr key={row.productId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-5 py-3 text-white font-medium">{row.productName}</td>
                    <td className="px-5 py-3 text-gray-300">{row.quantitySold}</td>
                    <td className="px-5 py-3 text-blue-400 font-bold">৳{row.revenue.toLocaleString()}</td>
                    <td className="px-5 py-3 text-red-400">৳{row.cost.toLocaleString()}</td>
                    <td className="px-5 py-3 text-green-400 font-bold">৳{row.grossProfit.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${row.profitMarginPercent >= 20 ? 'bg-green-500/20 text-green-400' : row.profitMarginPercent >= 10 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {row.profitMarginPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && data && data.byProduct.length === 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-10 text-center text-gray-500">
          No delivered orders found for the selected period
        </div>
      )}
    </div>
  );
}
