'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, ChevronLeft, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductBySlug, addToCart } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import type { Product, ProductVariant } from '@/lib/types';

const PLACEHOLDER = 'https://placehold.co/400x400/1a1a1a/ffffff?text=Jersey';

const COLOR_MAP: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  red: '#ef4444',
  blue: '#3b82f6',
  'sky blue': '#0ea5e9',
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  purple: '#a855f7',
  pink: '#ec4899',
  gold: '#f59e0b',
  navy: '#1e3a5f',
  maroon: '#7f1d1d',
  gray: '#6b7280',
  grey: '#6b7280',
};

function colorDot(color: string) {
  const key = color.toLowerCase();
  const bg = COLOR_MAP[key] || '#6b7280';
  return bg;
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding] = useState(false);
  const setCart = useCartStore((s) => s.setCart);

  useEffect(() => {
    if (!slug) return;
    getProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        // Auto-select first available color
        if (p.colors?.length) {
          setSelectedColor(p.colors[0]);
        }
        // Auto-select first available type
        if (p.types?.length) {
          setSelectedType(p.types[0]);
        }
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Derive available types given selected color
  const availableTypes = useMemo(() => {
    if (!product) return [];
    if (!selectedColor) return product.types ?? [];
    return [...new Set(
      product.variants
        .filter((v) => v.color === selectedColor)
        .map((v) => v.jerseyType)
        .filter((t) => t !== 'notApplicable')
    )];
  }, [product, selectedColor]);

  // Derive available sizes given selected color + type
  const availableSizes = useMemo(() => {
    if (!product) return [];
    return product.variants.filter((v) => {
      const colorMatch = !selectedColor || v.color === selectedColor;
      const typeMatch = !selectedType || v.jerseyType === selectedType;
      return colorMatch && typeMatch;
    });
  }, [product, selectedColor, selectedType]);

  // Auto-select the variant when color+type+size combo is unique
  useEffect(() => {
    if (!product || availableSizes.length === 0) {
      setSelectedVariant(null);
      return;
    }
    if (availableSizes.length === 1) {
      setSelectedVariant(availableSizes[0].stockQuantity > 0 ? availableSizes[0] : null);
    } else {
      setSelectedVariant(null);
    }
  }, [product, availableSizes]);

  const handleSelectSize = (variant: ProductVariant) => {
    if (variant.stockQuantity === 0) return;
    setSelectedVariant(variant);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) { toast.error('Please select a size'); return; }
    const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') || undefined : undefined;
    setAdding(true);
    try {
      const cart = await addToCart({
        productId: product!.id,
        variantId: selectedVariant.id,
        size: selectedVariant.size,
        color: selectedVariant.color,
        jerseyType: selectedVariant.jerseyType,
        quantity: qty,
      }, sessionId);
      setCart(cart);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <p className="text-white text-xl font-bold">Product not found</p>
      <Link href="/products" className="text-rose-400 hover:text-rose-300">← Back to products</Link>
    </div>
  );

  const images = product.images?.length ? product.images : [PLACEHOLDER];
  const price = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) : 0;
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801XXXXXXXXX';
  const waMsg = encodeURIComponent(
    `Hi! I want to order:\n${product.name}\n${selectedVariant ? `Color: ${selectedVariant.color} | Type: ${selectedVariant.jerseyType} | Size: ${selectedVariant.size}` : 'Size: TBD'}\nQty: ${qty}\nPrice: ৳${price * qty}`
  );

  const distinctColors = [...new Set(product.variants.map((v) => v.color))];
  const hasColorChoice = distinctColors.length > 1;
  const hasTypeChoice = availableTypes.length > 0;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/products" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
              <Image
                src={images[activeImg] || PLACEHOLDER}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-rose-500 text-white font-black text-sm px-3 py-1 rounded-full">
                  -{discountPct}% OFF
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-rose-500' : 'border-gray-700 hover:border-gray-500'}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.team && <span className="text-rose-400 text-sm font-bold uppercase tracking-wide">{product.team}</span>}
                <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">{product.categoryName}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-rose-400">৳{price}</span>
              {hasDiscount && (
                <span className="text-gray-500 text-xl line-through mb-1">৳{product.price}</span>
              )}
            </div>

            {/* Color swatches */}
            {hasColorChoice && (
              <div>
                <label className="text-sm font-bold text-white uppercase tracking-wide mb-3 block">
                  Color <span className="text-gray-400 font-normal ml-1 capitalize">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {distinctColors.map((c) => (
                    <button
                      key={c}
                      title={c}
                      onClick={() => setSelectedColor(c)}
                      className={`w-8 h-8 rounded-full border-4 transition-all ${selectedColor === c ? 'border-rose-500 scale-110' : 'border-gray-700 hover:border-gray-400'}`}
                      style={{ backgroundColor: colorDot(c) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Type selector (Home/Away/Third) */}
            {hasTypeChoice && (
              <div>
                <label className="text-sm font-bold text-white uppercase tracking-wide mb-3 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {availableTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all capitalize ${
                        selectedType === t
                          ? 'border-rose-500 bg-rose-500/20 text-white'
                          : 'border-gray-700 text-gray-300 hover:border-rose-500 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-white uppercase tracking-wide">Select Size</label>
                {selectedVariant && (
                  <span className={`text-xs font-semibold ${selectedVariant.stockQuantity > 5 ? 'text-green-400' : selectedVariant.stockQuantity > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {selectedVariant.stockQuantity > 0 ? `${selectedVariant.stockQuantity} in stock` : 'Out of stock'}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((v) => (
                  <button
                    key={v.id}
                    disabled={v.stockQuantity === 0}
                    onClick={() => handleSelectSize(v)}
                    className={`w-12 h-12 rounded-xl font-bold text-sm border-2 transition-all ${
                      v.stockQuantity === 0
                        ? 'border-gray-800 text-gray-700 line-through cursor-not-allowed'
                        : selectedVariant?.id === v.id
                        ? 'border-rose-500 bg-rose-500/20 text-white'
                        : 'border-gray-700 text-gray-300 hover:border-rose-500 hover:text-white'
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-bold text-white uppercase tracking-wide mb-3 block">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-xl bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="text-white font-black text-xl w-8 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 rounded-xl bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Plus size={16} />
                </button>
                <span className="text-gray-400 text-sm ml-2">Total: <span className="text-rose-400 font-bold">৳{price * qty}</span></span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={adding || !selectedVariant}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02]"
              >
                <ShoppingCart size={18} />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <a
                href={`https://wa.me/${waNumber}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Order via WhatsApp
              </a>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-white font-bold mb-3">Description</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews placeholder */}
        <div className="mt-16 border-t border-gray-800 pt-10">
          <h2 className="text-xl font-black text-white mb-6">Customer Reviews</h2>
          <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
            <p className="text-gray-400">No reviews yet. Be the first to review!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
