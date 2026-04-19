'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getProducts, getCategories } from '@/lib/api';
import type { Product, Category, PaginatedProducts } from '@/lib/types';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const JERSEY_TYPES = ['home', 'away', 'third'];
const COMMON_COLORS = ['white', 'black', 'red', 'blue', 'sky blue', 'green', 'yellow', 'gold', 'navy'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const COLOR_BG: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  red: '#ef4444',
  blue: '#3b82f6',
  'sky blue': '#0ea5e9',
  green: '#22c55e',
  yellow: '#eab308',
  gold: '#f59e0b',
  navy: '#1e3a5f',
};

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [size, setSize] = useState('');
  const [team, setTeam] = useState('');
  const [color, setColor] = useState('');
  const [jerseyType, setJerseyType] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Pre-populate category from query string (e.g. ?category=club)
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) setTeam(catParam);
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProducts({
        categoryId: categoryId !== '' ? categoryId : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        size: size || undefined,
        team: team || undefined,
        color: color || undefined,
        jerseyType: jerseyType || undefined,
        sortBy: sort,
        page,
        pageSize: 12,
      });
      setData(result);
    } catch {
      setData({ items: [], totalCount: 0, page: 1, pageSize: 12, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [categoryId, minPrice, maxPrice, size, team, color, jerseyType, sort, page]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearFilters = () => {
    setCategoryId('');
    setMinPrice('');
    setMaxPrice('');
    setSize('');
    setTeam('');
    setColor('');
    setJerseyType('');
    setPage(1);
  };

  const hasFilters = categoryId !== '' || minPrice || maxPrice || size || team || color || jerseyType;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Search Team</label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={team}
            onChange={(e) => { setTeam(e.target.value); setPage(1); }}
            placeholder="e.g. Barcelona"
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Category</label>
        <div className="space-y-1">
          <button
            onClick={() => { setCategoryId(''); setPage(1); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryId === '' ? 'bg-rose-500/20 text-rose-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCategoryId(c.id); setPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryId === c.id ? 'bg-rose-500/20 text-rose-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Type</label>
        <div className="flex flex-wrap gap-2">
          {JERSEY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => { setJerseyType(jerseyType === t ? '' : t); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold border capitalize transition-colors ${jerseyType === t ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-700 text-gray-400 hover:border-rose-500 hover:text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Color</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_COLORS.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => { setColor(color === c ? '' : c); setPage(1); }}
              className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-rose-500 scale-110' : 'border-gray-700 hover:border-gray-400'}`}
              style={{ backgroundColor: COLOR_BG[c] || '#6b7280' }}
            />
          ))}
        </div>
        {color && (
          <p className="text-xs text-gray-400 mt-1 capitalize">Selected: {color}</p>
        )}
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Price Range (৳)</label>
        <div className="flex gap-2">
          <input
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
            placeholder="Min"
            type="number"
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-rose-500"
          />
          <input
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
            placeholder="Max"
            type="number"
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Size</label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => { setSize(size === s ? '' : s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${size === s ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-700 text-gray-400 hover:border-rose-500 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300">
          <X size={14} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">All Products</h1>
            {data && <p className="text-gray-400 text-sm mt-1">{data.totalCount} products found</p>}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-rose-500"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="lg:hidden flex items-center gap-2 bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
              <h2 className="text-white font-bold mb-4">Filters</h2>
              <FilterPanel />
            </div>
          </aside>

          {showFilter && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/80" onClick={() => setShowFilter(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-gray-900 p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold">Filters</h2>
                  <button onClick={() => setShowFilter(false)}><X size={20} className="text-gray-400" /></button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-2xl aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : data?.items.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-white font-bold text-xl mb-2">No products found</p>
                <p className="text-gray-400 text-sm mb-6">Try adjusting your filters</p>
                <button onClick={clearFilters} className="bg-rose-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-rose-500 transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data?.items.map((p: Product) => <ProductCard key={p.id} product={p} />)}
                </div>

                {data && data.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:opacity-40 hover:bg-gray-800 transition-colors">Prev</button>
                    {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${page === p ? 'bg-rose-500 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}>{p}</button>
                    ))}
                    <button disabled={page === data.totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:opacity-40 hover:bg-gray-800 transition-colors">Next</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
