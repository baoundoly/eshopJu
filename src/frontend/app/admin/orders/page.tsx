'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getOrders, updateOrderStatus, verifyPayment } from '@/lib/api';
import type { OrderDto } from '@/lib/types';

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: 'text-yellow-400',
  paid: 'text-green-400',
  failed: 'text-red-400',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit: 15,
      });
      setOrders(data.orders);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, status);
      toast.success('Status updated');
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleVerifyPayment = async (id: string) => {
    setUpdatingId(id);
    try {
      await verifyPayment(id, {});
      toast.success('Payment verified');
      fetchOrders();
    } catch {
      toast.error('Failed to verify payment');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Orders</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} total orders</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-rose-500"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Order #', 'Customer', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-4 text-rose-400 font-bold whitespace-nowrap">#{order.orderNumber}</td>
                    <td className="px-4 py-4">
                      <p className="text-white font-medium">{order.customer.name}</p>
                      <p className="text-gray-500 text-xs">{order.customer.phone}</p>
                    </td>
                    <td className="px-4 py-4 text-white font-bold whitespace-nowrap">৳{order.total}</td>
                    <td className="px-4 py-4">
                      <div>
                        <span className="text-gray-400 text-xs">{order.paymentMethod}</span>
                        <span className={`block text-xs font-bold ${PAYMENT_COLORS[order.paymentStatus] || 'text-gray-400'}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[order.status] || 'bg-gray-700 text-gray-400'}`}
                      >
                        {STATUSES.filter((s) => s !== 'all').map((s) => (
                          <option key={s} value={s} className="bg-gray-900 text-white">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 text-gray-400 whitespace-nowrap text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-BD')}
                    </td>
                    <td className="px-4 py-4">
                      {order.paymentStatus === 'pending' && order.paymentMethod !== 'cod' && (
                        <button
                          onClick={() => handleVerifyPayment(order._id)}
                          disabled={updatingId === order._id}
                          className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Verify Payment
                        </button>
                      )}
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
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${page === p ? 'bg-rose-500 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}>{p}</button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:opacity-40 hover:bg-gray-800">Next</button>
        </div>
      )}
    </div>
  );
}
