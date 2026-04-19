'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts, deleteProduct } from '@/lib/api';
import type { Product } from '@/lib/types';

const PLACEHOLDER = 'https://placehold.co/400x400/1a1a1a/ffffff?text=Jersey';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    getProducts({ page, pageSize: 15 })
      .then((d) => {
        setProducts(d.items);
        setTotalPages(d.totalPages);
        setTotal(d.totalCount);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Products</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['', 'Name', 'Category', 'Team', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                        <Image src={p.images?.[0] || p.primaryImage || PLACEHOLDER} alt={p.name} fill className="object-cover" unoptimized
                          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white font-medium max-w-[200px]">
                      <span className="line-clamp-2">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{p.categoryName}</td>
                    <td className="px-4 py-3 text-gray-400">{p.team ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-rose-400 font-bold">৳{p.discountPrice ?? p.price}</span>
                      {p.discountPrice && <span className="text-gray-600 line-through text-xs ml-1">৳{p.price}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${p.totalStock === 0 ? 'text-red-400' : p.totalStock < 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {p.totalStock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${p.id}/edit`} title="Edit" className="text-gray-400 hover:text-white transition-colors">
                          <Edit size={16} />
                        </Link>
                        <Link href={`/admin/products/${p.id}/variants`} title="Manage Variants" className="text-gray-400 hover:text-blue-400 transition-colors">
                          <Layers size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deletingId === p.id}
                          title="Delete"
                          className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
            <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${page === p ? 'bg-rose-500 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}>{p}</button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:opacity-40 hover:bg-gray-800">Next</button>
        </div>
      )}
    </div>
  );
}
