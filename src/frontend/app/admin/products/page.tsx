'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts } from '@/lib/api';
import type { Product, Category } from '@/lib/types';

const PLACEHOLDER = 'https://placehold.co/400x400/1a1a1a/ffffff?text=Jersey';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    getProducts({ page, limit: 15 })
      .then((d) => {
        setProducts(d.products);
        setTotalPages(d.pages);
        setTotal(d.total);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, [page]);

  const getCatName = (cat: Category | string) =>
    typeof cat === 'object' ? cat.name : cat;

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
                  {['', 'Name', 'Category', 'Team', 'Price', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                        <Image src={p.images?.[0] || PLACEHOLDER} alt={p.name} fill className="object-cover" unoptimized
                          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white font-medium max-w-[200px]">
                      <span className="line-clamp-2">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{getCatName(p.category)}</td>
                    <td className="px-4 py-3 text-gray-400">{p.team}</td>
                    <td className="px-4 py-3">
                      <span className="text-rose-400 font-bold">৳{p.discountPrice ?? p.price}</span>
                      {p.discountPrice && <span className="text-gray-600 line-through text-xs ml-1">৳{p.price}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${p._id}/edit`} className="text-gray-400 hover:text-white transition-colors">
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => toast.error('Delete not implemented in this view')}
                          className="text-gray-400 hover:text-red-400 transition-colors"
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${page === p ? 'bg-rose-500 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}>{p}</button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:opacity-40 hover:bg-gray-800">Next</button>
        </div>
      )}
    </div>
  );
}
