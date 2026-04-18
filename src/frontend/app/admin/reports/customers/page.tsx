'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getCustomerReport } from '@/lib/api';
import type { CustomerReportDto } from '@/lib/types';
import DateRangeFilter from '@/components/DateRangeFilter';

const defaultFrom = () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); };
const defaultTo = () => new Date().toISOString().slice(0, 10);

export default function CustomerReportPage() {
  const [data, setData] = useState<CustomerReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getCustomerReport({ from, to })); }
    catch { toast.error('Failed to load customer report'); }
    finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { fetch(); }, [fetch]);

  const kpis = data ? [
    { label: 'Total Customers', value: data.totalCustomers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'New (Period)', value: data.newCustomers, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Repeat Customers', value: data.repeatCustomers, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Guest Orders', value: data.guestOrderCount, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-white">Customer Report</h1>
        <DateRangeFilter from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} loading={loading} />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-gray-900 rounded-2xl h-24 animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className={`${k.bg} rounded-2xl p-4 border border-gray-800`}>
              <p className="text-gray-400 text-xs font-semibold mb-1">{k.label}</p>
              <p className={`${k.color} text-xl font-black`}>{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Top Buyers */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800">
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-white font-bold">Top Buyers</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
        ) : !data || data.topBuyers.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No orders in the selected period</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['#', 'Name', 'Phone', 'Type', 'Orders', 'Total Spent'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-5 py-3 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.topBuyers.map((buyer, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-5 py-3 text-gray-500 font-bold">{i + 1}</td>
                    <td className="px-5 py-3 text-white font-medium">{buyer.customerName}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{buyer.customerPhone}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${buyer.userId ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                        {buyer.userId ? 'Registered' : 'Guest'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-purple-400 font-bold">{buyer.orderCount}</td>
                    <td className="px-5 py-3 text-green-400 font-black">৳{buyer.totalSpent.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
