'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getInventoryReport } from '@/lib/api';
import type { InventoryReportDto, InventoryReportItemDto } from '@/lib/types';

export default function InventoryReportPage() {
  const [data, setData] = useState<InventoryReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getInventoryReport()
      .then(setData)
      .catch(() => toast.error('Failed to load inventory report'))
      .finally(() => setLoading(false));
  }, []);

  const filtered: InventoryReportItemDto[] = (data?.items ?? []).filter((item) => {
    if (filter === 'low' && !item.isLowStock) return false;
    if (filter === 'out' && !item.isOutOfStock) return false;
    if (search && !item.productName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const kpis = data ? [
    { label: 'Total Variants', value: data.totalVariants, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Low Stock', value: data.lowStockVariants, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Out of Stock', value: data.outOfStockVariants, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Total Stock Value', value: `৳${data.totalStockValue.toLocaleString()}`, color: 'text-green-400', bg: 'bg-green-500/10' },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-black text-white">Inventory Report</h1>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-gray-900 rounded-2xl h-24 animate-pulse" />)}
        </div>
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          {(['all', 'low', 'out'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors capitalize ${filter === f ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-700 text-gray-400 hover:border-rose-500 hover:text-white'}`}>
              {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-rose-500 w-48"
        />
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No items found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Product', 'Color', 'Type', 'Size', 'SKU', 'Stock', 'Last Price', 'Stock Value', 'Status'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.variantId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-white font-medium">{item.productName}</td>
                    <td className="px-4 py-3 text-gray-300">{item.color || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 capitalize">{item.jerseyType === 'notApplicable' ? '—' : item.jerseyType}</td>
                    <td className="px-4 py-3 text-gray-300">{item.size}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.sku || '—'}</td>
                    <td className="px-4 py-3 font-bold">
                      <span className={item.isOutOfStock ? 'text-red-400' : item.isLowStock ? 'text-yellow-400' : 'text-green-400'}>
                        {item.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">৳{item.lastPurchasePrice}</td>
                    <td className="px-4 py-3 text-blue-400 font-bold">৳{item.stockValue.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {item.isOutOfStock ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-400">
                          <XCircle size={12} /> Out of Stock
                        </span>
                      ) : item.isLowStock ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-green-400">OK</span>
                      )}
                    </td>
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
