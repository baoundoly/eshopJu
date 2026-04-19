'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCart, updateCartItem, removeFromCart } from '@/lib/api';
import { useCartStore } from '@/lib/store';

const PLACEHOLDER = 'https://placehold.co/400x400/1a1a1a/ffffff?text=Jersey';
const DELIVERY = 60;

function getOrCreateSessionId(): string {
  let sid = localStorage.getItem('sessionId');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('sessionId', sid);
  }
  return sid;
}

export default function CartPage() {
  const { cart, setCart } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchCart = useCallback(async () => {
    const sid = getOrCreateSessionId();
    try {
      const c = await getCart(sid);
      setCart(c);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [setCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdate = async (itemId: number, qty: number) => {
    setUpdating(itemId);
    const sid = localStorage.getItem('sessionId') || undefined;
    try {
      const c = await updateCartItem(itemId, qty, sid);
      setCart(c);
    } catch {
      toast.error('Failed to update cart');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    setUpdating(itemId);
    const sid = localStorage.getItem('sessionId') || undefined;
    try {
      const c = await removeFromCart(itemId, sid);
      setCart(c);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const items = cart?.items ?? [];
  const subtotal = cart?.totalAmount ?? 0;
  const total = subtotal + DELIVERY;

  if (items.length === 0) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 px-4">
      <ShoppingBag size={64} className="text-gray-700" />
      <h2 className="text-white font-black text-2xl">Your cart is empty</h2>
      <p className="text-gray-400 text-center max-w-xs">Add some awesome jerseys to your cart and they&apos;ll show up here.</p>
      <Link href="/products" className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-4 rounded-xl transition-colors">
        Browse Jerseys
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-8">Shopping Cart
          <span className="text-rose-400 ml-2 text-lg">({items.length} items)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const img = item.productImage || PLACEHOLDER;
              const price = item.unitPrice;
              return (
                <div key={item.id} className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex gap-4">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-gray-800">
                    <Image src={img} alt={item.productName || 'Jersey'} fill className="object-cover" unoptimized
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white font-bold text-sm sm:text-base line-clamp-2">{item.productName}</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Size: <span className="text-white font-semibold">{item.size}</span>
                          {item.color && <> · Color: <span className="text-white font-semibold capitalize">{item.color}</span></>}
                          {item.jerseyType && item.jerseyType !== 'notApplicable' && <> · <span className="text-white font-semibold capitalize">{item.jerseyType}</span></>}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={updating === item.id}
                        className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdate(item.id, Math.max(1, item.quantity - 1))}
                          disabled={updating === item.id || item.quantity <= 1}
                          className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 disabled:opacity-40 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-white font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdate(item.id, item.quantity + 1)}
                          disabled={updating === item.id}
                          className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-rose-400 font-black">৳{price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link href="/products" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors mt-2">
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 sticky top-20">
              <h2 className="text-white font-black text-lg mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="text-white">৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery</span>
                  <span className="text-white">৳{DELIVERY}</span>
                </div>
                <div className="border-t border-gray-800 pt-3 flex justify-between font-bold text-base">
                  <span className="text-white">Total</span>
                  <span className="text-rose-400 text-xl">৳{total}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-rose-500/20"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
