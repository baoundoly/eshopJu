'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getStockMovementReport } from '@/lib/api';
import type { StockMovementReportDto } from '@/lib/types';
import DateRangeFilter from '@/components/DateRangeFilter';

const defaultFrom = () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); };
const defaultTo = () => new Date().toISOString().slice(0, 10);

const TYPE_COLORS: Record<string, string> = {
  in: 'bg-green-500/20 text-green-400',
  out: 'bg-red-500/20 text-red-400',
  adjustment: 'bg-yellow-500/20 text-yellow-400',
  return: 'bg-blue-500/20 text-blue-400',
};

export default function StockMovementReportPage() {
  const [data, setData] = useState<StockMovementReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [typeFilter, setTypeFilter] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getStockMovementReport({ from, to })); }
    catch { toast.error('Failed to load stock movement report'); }
    finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { fetch(); }, [fetch]);

  const movements = (data?.movements ?? []).filter(
    (m) => !typeFilter || m.movementType.toLowerCase() === typeFilter,
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-white">Stock Movement</h1>
        <DateRangeFilter from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} loading={loading} />
      </div>

      {/* KPI */}
      {!loading && data && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-500/10 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs font-semibold mb-1">Total IN</p>
            <p className="text-green-400 text-xl font-black">+{data.totalIn}</p>
          </div>
          <div className="bg-red-500/10 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs font-semibold mb-1">Total OUT</p>
            <p className="text-red-400 text-xl font-black">−{data.totalOut}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs font-semibold mb-1">Adjustments</p>
            <p className="text-yellow-400 text-xl font-black">{data.totalAdjustment}</p>
          </div>
        </div>
      )}

      {/* Type filter */}
      <div className="flex gap-1">
        {['', 'in', 'out', 'adjustment', 'return'].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border capitalize transition-colors ${typeFilter === t ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-700 text-gray-400 hover:border-rose-500 hover:text-white'}`}>
            {t || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
        ) : movements.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No movements found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Date', 'Product', 'Variant', 'Type', 'Qty', 'Reference', 'Notes'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(m.date).toLocaleDateString('en-BD')}</td>
                    <td className="px-4 py-3 text-white font-medium">{m.productName}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{m.variantLabel}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${TYPE_COLORS[m.movementType.toLowerCase()] ?? 'bg-gray-700 text-gray-400'}`}>
                        {m.movementType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black">
                      <span className={m.quantity > 0 ? 'text-green-400' : 'text-red-400'}>
                        {m.quantity > 0 ? '+' : ''}{m.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {m.referenceType}{m.referenceId ? ` #${m.referenceId}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{m.notes || '—'}</td>
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
