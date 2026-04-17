'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProduct, updateProduct, getCategories } from '@/lib/api';
import type { Category, Product } from '@/lib/types';

interface VariantRow {
  color: string;
  jerseyType: string;
  size: string;
  stockQuantity: number;
  sku: string;
}

const JERSEY_TYPES = ['notApplicable', 'home', 'away', 'third'];

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [jerseyType, setJerseyType] = useState('notApplicable');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<string[]>(['']);
  const [variants, setVariants] = useState<VariantRow[]>([
    { color: '', jerseyType: 'notApplicable', size: '', stockQuantity: 0, sku: '' },
  ]);

  useEffect(() => {
    Promise.all([
      getCategories(),
      getProduct(Number(id)),
    ]).then(([cats, product]: [Category[], Product]) => {
      setCategories(cats);
      setName(product.name);
      setTeam(product.team ?? '');
      setCategoryId(String(product.categoryId));
      setPrice(String(product.price));
      setDiscountPrice(product.discountPrice ? String(product.discountPrice) : '');
      setDescription(product.description ?? '');
      setColor(product.color ?? '');
      setJerseyType(product.jerseyType ?? 'notApplicable');
      setIsFeatured(product.isFeatured);
      setIsActive(product.isActive);
      setImages(product.images?.length ? product.images : ['']);
      setVariants(
        product.variants?.length
          ? product.variants.map((v) => ({
              color: v.color,
              jerseyType: v.jerseyType,
              size: v.size,
              stockQuantity: v.stockQuantity,
              sku: v.sku ?? '',
            }))
          : [{ color: '', jerseyType: 'notApplicable', size: '', stockQuantity: 0, sku: '' }]
      );
    })
    .catch(() => toast.error('Failed to load product'))
    .finally(() => setLoading(false));
  }, [id]);

  const addImage = () => setImages([...images, '']);
  const removeImage = (i: number) => setImages(images.filter((_, idx) => idx !== i));
  const updateImage = (i: number, val: string) => {
    const updated = [...images];
    updated[i] = val;
    setImages(updated);
  };

  const addVariant = () =>
    setVariants([...variants, { color: '', jerseyType: 'notApplicable', size: '', stockQuantity: 0, sku: '' }]);
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: keyof VariantRow, val: string | number) => {
    const updated = [...variants];
    updated[i] = { ...updated[i], [field]: val };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) {
      toast.error('Name, price, and category are required.');
      return;
    }
    setSubmitting(true);
    try {
      await updateProduct(Number(id), {
        name,
        team: team || undefined,
        categoryId: Number(categoryId),
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        description: description || undefined,
        color: color || undefined,
        jerseyType,
        isFeatured,
        isActive,
        images: images.filter(Boolean),
        variants: variants.filter((v) => v.size),
      });
      toast.success('Product updated!');
      router.push('/admin/products');
    } catch {
      toast.error('Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black text-white">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
          <h2 className="text-white font-bold text-lg">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Product Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Team</label>
              <input value={team} onChange={(e) => setTeam(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Category *</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Price (৳) *</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" required
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Discount Price (৳)</label>
              <input value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} type="number" min="0"
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Primary Color</label>
              <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. White"
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Jersey Type</label>
              <select value={jerseyType} onChange={(e) => setJerseyType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500">
                {JERSEY_TYPES.map((t) => <option key={t} value={t}>{t === 'notApplicable' ? 'N/A' : t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500 resize-none" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-rose-500 focus:ring-rose-500" />
                <span className="text-white text-sm font-medium">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-rose-500 focus:ring-rose-500" />
                <span className="text-white text-sm font-medium">Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">Images</h2>
            <button type="button" onClick={addImage} className="text-rose-400 hover:text-rose-300 text-sm font-bold flex items-center gap-1">
              <Plus size={14} /> Add URL
            </button>
          </div>
          {images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input value={img} onChange={(e) => updateImage(i, e.target.value)} placeholder={`Image URL ${i + 1}`}
                className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500" />
              {images.length > 1 && (
                <button type="button" onClick={() => removeImage(i)} className="text-gray-500 hover:text-red-400"><Trash2 size={16} /></button>
              )}
            </div>
          ))}
        </div>

        {/* Variants */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">Variants</h2>
            <button type="button" onClick={addVariant} className="text-rose-400 hover:text-rose-300 text-sm font-bold flex items-center gap-1">
              <Plus size={14} /> Add Row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase">
                  <th className="text-left pb-2 pr-2">Color</th>
                  <th className="text-left pb-2 pr-2">Type</th>
                  <th className="text-left pb-2 pr-2">Size</th>
                  <th className="text-left pb-2 pr-2">Stock</th>
                  <th className="text-left pb-2 pr-2">SKU</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={i}>
                    <td className="pr-2 pb-2">
                      <input value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} placeholder="White"
                        className="w-24 bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-rose-500" />
                    </td>
                    <td className="pr-2 pb-2">
                      <select value={v.jerseyType} onChange={(e) => updateVariant(i, 'jerseyType', e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-rose-500">
                        {JERSEY_TYPES.map((t) => <option key={t} value={t}>{t === 'notApplicable' ? 'N/A' : t}</option>)}
                      </select>
                    </td>
                    <td className="pr-2 pb-2">
                      <input value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} placeholder="M"
                        className="w-16 bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-rose-500" />
                    </td>
                    <td className="pr-2 pb-2">
                      <input value={v.stockQuantity} onChange={(e) => updateVariant(i, 'stockQuantity', Number(e.target.value))} type="number" min="0"
                        className="w-16 bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-rose-500" />
                    </td>
                    <td className="pr-2 pb-2">
                      <input value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} placeholder="Optional"
                        className="w-24 bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-rose-500" />
                    </td>
                    <td className="pb-2">
                      {variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(i)} className="text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting}
            className="bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-colors">
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/admin/products" className="border border-gray-700 text-gray-300 hover:text-white font-bold px-8 py-3 rounded-xl transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
