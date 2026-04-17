'use client';

import { useEffect, useState, useCallback } from 'react';
import { Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrders, updateOrderStatus } from '@/lib/api';
import type { OrderDto } from '@/lib/types';

const STATUSES = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};
const STATUS_TO_NUM: Record<string, number> = {
  pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4, cancelled: 5,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<OrderDto | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOrders({ status: statusFilter || undefined, page, pageSize: 20 });
      const data = result as unknown as { items?: OrderDto[]; totalCount?: number; totalPages?: number } | OrderDto[];
      if (Array.isArray(data)) {
        setOrders(data);
        setTotal(data.length);
        setTotalPages(1);
      } else {
        setOrders(data.items ?? []);
        setTotal(data.totalCount ?? 0);
        setTotalPages(data.totalPages ?? 1);
      }
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (order: OrderDto, newStatus: string) => {
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderStatus(order.id, STATUS_TO_NUM[newStatus] ?? 0);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      if (selected?.id === order.id) setSelected(updated);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Orders</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} total orders</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors capitalize ${statusFilter === s ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-700 text-gray-400 hover:border-rose-500 hover:text-white'}`}>
            {s === '' ? 'All' : s}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Order', 'Customer', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-rose-400 font-bold">#{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{o.customerName}</p>
                      <p className="text-gray-500 text-xs">{o.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-white font-bold">৳{o.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${o.paymentStatus === 'verified' ? 'bg-green-500/20 text-green-400' : o.paymentStatus === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={o.status} onChange={(e) => handleStatusChange(o, e.target.value)} disabled={updatingId === o.id}
                        className={`text-xs font-bold px-2 py-1 rounded-full border-0 bg-transparent capitalize cursor-pointer disabled:opacity-60 ${STATUS_COLORS[o.status] || 'text-gray-400'}`}>
                        {STATUSES.filter(Boolean).map((s) => <option key={s} value={s} className="bg-gray-900 text-white capitalize">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('en-BD')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(o)} className="text-gray-400 hover:text-white"><Eye size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:opacity-40 hover:bg-gray-800">Prev</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-sm font-bold ${page === p ? 'bg-rose-500 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}>{p}</button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:opacity-40 hover:bg-gray-800">Next</button>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-gray-900 border-l border-gray-800 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Order #{selected.orderNumber}</h2>
                  <p className="text-gray-400 text-sm">{new Date(selected.createdAt).toLocaleString('en-BD')}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Customer</p>
                  <p className="text-white font-semibold">{selected.customerName}</p>
                  <p className="text-gray-400 text-sm">{selected.customerPhone}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Address</p>
                  <p className="text-white text-sm">{selected.customerAddress}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Payment</p>
                  <p className="text-white text-sm capitalize">{selected.paymentMethod}</p>
                  {selected.transactionId && <p className="text-gray-400 text-xs">TXN: {selected.transactionId}</p>}
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Payment Status</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${selected.paymentStatus === 'verified' ? 'bg-green-500/20 text-green-400' : selected.paymentStatus === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {selected.paymentStatus}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-3">Items</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-3 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{item.productName}</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Size: {item.size}
                          {item.color && ` · ${item.color}`}
                          {item.jerseyType && item.jerseyType !== 'notApplicable' && ` · ${item.jerseyType}`}
                          {' · '}Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-rose-400 font-bold text-sm shrink-0">৳{item.totalPrice}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-400"><span>Subtotal</span><span className="text-white">৳{selected.subTotal}</span></div>
                <div className="flex justify-between text-sm text-gray-400"><span>Delivery</span><span className="text-white">৳{selected.deliveryCharge}</span></div>
                <div className="flex justify-between font-black text-lg"><span className="text-white">Total</span><span className="text-rose-400">৳{selected.totalAmount}</span></div>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-2">Update Status</p>
                <select value={selected.status} onChange={(e) => handleStatusChange(selected, e.target.value)} disabled={updatingId === selected.id}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-rose-500 disabled:opacity-60 capitalize">
                  {STATUSES.filter(Boolean).map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
