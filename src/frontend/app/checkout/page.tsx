'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { createOrder, generateWhatsAppLink, getShippingOptions, validateCoupon } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import type { ShippingOptionDto } from '@/lib/types';

const PLACEHOLDER = 'https://placehold.co/400x400/1a1a1a/ffffff?text=Jersey';
const DEFAULT_DELIVERY = 60;

type PaymentMethod = 'bkash' | 'nagad' | 'cod';

const PAYMENTS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'bkash', label: 'bKash', icon: '💳' },
  { value: 'nagad', label: 'Nagad', icon: '📱' },
  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOptionDto[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOptionDto | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!cart?.items?.length) router.push('/cart');
  }, [cart, router]);

  const subtotal = cart?.totalAmount ?? 0;
  const items = cart?.items ?? [];

  // Fetch shipping options when district changes
  const fetchShipping = useCallback(async () => {
    if (!district.trim()) { setShippingOptions([]); setSelectedShipping(null); return; }
    setShippingLoading(true);
    try {
      const opts = await getShippingOptions(district.trim(), thana.trim() || undefined, subtotal);
      setShippingOptions(opts);
      if (opts.length > 0) setSelectedShipping(opts[0]);
      else setSelectedShipping(null);
    } catch {
      setShippingOptions([]);
      setSelectedShipping(null);
    } finally {
      setShippingLoading(false);
    }
  }, [district, thana, subtotal]);

  useEffect(() => {
    const timer = setTimeout(fetchShipping, 500);
    return () => clearTimeout(timer);
  }, [fetchShipping]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponCode.trim(), subtotal);
      if (result.isValid) {
        setCouponApplied({ code: couponCode.trim(), discount: result.discountAmount });
        toast.success(`Coupon applied! ৳${result.discountAmount} off`);
      } else {
        toast.error(result.errorMessage ?? 'Invalid coupon');
        setCouponApplied(null);
      }
    } catch {
      toast.error('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const deliveryCost = selectedShipping
    ? (selectedShipping.isFreeShipping ? 0 : selectedShipping.shippingCost)
    : DEFAULT_DELIVERY;

  const discount = couponApplied?.discount ?? 0;
  const total = subtotal - discount + deliveryCost;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!phone.trim()) e.phone = 'Phone is required';
    else if (!/^01[3-9]\d{8}$/.test(phone)) e.phone = 'Enter a valid BD phone number';
    if (!address.trim()) e.address = 'Address is required';
    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !transactionId.trim())
      e.transactionId = 'Transaction ID is required for mobile payments';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') || undefined : undefined;
      const paymentMethodMap: Record<PaymentMethod, number> = { bkash: 0, nagad: 1, cod: 2 };
      const order = await createOrder({
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        district: district.trim() || undefined,
        thana: thana.trim() || undefined,
        shippingMethodId: selectedShipping?.methodId,
        paymentMethod: paymentMethodMap[paymentMethod],
        transactionId: transactionId || undefined,
        sessionId,
        couponCode: couponApplied?.code,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          size: item.size,
          color: item.color,
          jerseyType: item.jerseyType,
          quantity: item.quantity,
        })),
      });
      clearCart();
      const waLink = generateWhatsAppLink({
        orderNumber: order.orderNumber,
        customerName: name,
        total: order.totalAmount,
      });
      router.push(`/order-success?order=${order.orderNumber}&wa=${encodeURIComponent(waLink)}`);
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer info */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-white font-black text-lg mb-5">Customer Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Full Name *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
                      className={`w-full bg-gray-800 border text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500 ${errors.name ? 'border-red-500' : 'border-gray-700'}`} />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Phone *</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX"
                      className={`w-full bg-gray-800 border text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500 ${errors.phone ? 'border-red-500' : 'border-gray-700'}`} />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Delivery Address *</label>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House, Road, Area, District"
                      rows={3}
                      className={`w-full bg-gray-800 border text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500 resize-none ${errors.address ? 'border-red-500' : 'border-gray-700'}`} />
                    {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">District</label>
                    <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. Dhaka"
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Thana / Upazila</label>
                    <input value={thana} onChange={(e) => setThana(e.target.value)} placeholder="Optional"
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Email (optional)</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" type="email"
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500" />
                  </div>
                </div>
              </div>

              {/* Shipping Options */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-white font-black text-lg mb-4">Shipping Method</h2>
                {shippingLoading ? (
                  <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-14 bg-gray-800 rounded-xl animate-pulse" />)}</div>
                ) : shippingOptions.length > 0 ? (
                  <div className="space-y-2">
                    {shippingOptions.map((opt) => (
                      <label key={`${opt.zoneId}-${opt.methodId}`}
                        className={`flex items-center justify-between gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedShipping?.methodId === opt.methodId ? 'border-rose-500 bg-rose-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
                        <input type="radio" name="shipping" checked={selectedShipping?.methodId === opt.methodId}
                          onChange={() => setSelectedShipping(opt)} className="hidden" />
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedShipping?.methodId === opt.methodId ? 'border-rose-500' : 'border-gray-600'}`}>
                            {selectedShipping?.methodId === opt.methodId && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">{opt.methodName}</p>
                            <p className="text-gray-400 text-xs">{opt.zoneName}</p>
                          </div>
                        </div>
                        <span className={`font-black text-sm ${opt.isFreeShipping ? 'text-green-400' : 'text-rose-400'}`}>
                          {opt.isFreeShipping ? 'FREE' : `৳${opt.shippingCost}`}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    {district.trim()
                      ? 'No shipping options available for this district. Default rate will apply.'
                      : 'Enter your district above to see available shipping options.'}
                  </p>
                )}
                {!shippingOptions.length && (
                  <p className="text-gray-500 text-xs mt-2">Default delivery charge: ৳{DEFAULT_DELIVERY}</p>
                )}
              </div>

              {/* Payment */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-white font-black text-lg mb-5">Payment Method</h2>
                <div className="space-y-3">
                  {PAYMENTS.map((pm) => (
                    <label key={pm.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === pm.value ? 'border-rose-500 bg-rose-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
                      <input type="radio" name="payment" value={pm.value} checked={paymentMethod === pm.value}
                        onChange={() => setPaymentMethod(pm.value)} className="hidden" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === pm.value ? 'border-rose-500' : 'border-gray-600'}`}>
                        {paymentMethod === pm.value && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                      </div>
                      <span className="text-xl">{pm.icon}</span>
                      <span className="text-white font-bold">{pm.label}</span>
                    </label>
                  ))}
                </div>

                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                  <div className="mt-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Transaction ID *</label>
                    <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction ID after payment"
                      className={`w-full bg-gray-800 border text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500 ${errors.transactionId ? 'border-red-500' : 'border-gray-700'}`} />
                    {errors.transactionId && <p className="text-red-400 text-xs mt-1">{errors.transactionId}</p>}
                    <p className="text-gray-500 text-xs mt-2">
                      Send money to our {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} number and enter the transaction ID above.
                    </p>
                  </div>
                )}
              </div>

              {/* Coupon */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-white font-black text-lg mb-4">Coupon Code</h2>
                {couponApplied ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                    <div>
                      <span className="text-green-400 font-bold font-mono">{couponApplied.code}</span>
                      <span className="text-green-400 text-sm ml-2">— ৳{couponApplied.discount} off</span>
                    </div>
                    <button type="button" onClick={() => { setCouponApplied(null); setCouponCode(''); }}
                      className="text-gray-400 hover:text-red-400 text-xs font-bold">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500 font-mono uppercase" />
                    <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                      className="bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm">
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 sticky top-20">
                <h2 className="text-white font-black text-lg mb-5">Order Summary</h2>
                <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-800">
                        <Image src={item.productImage || PLACEHOLDER} alt={item.productName || ''} fill className="object-cover" unoptimized
                          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold line-clamp-1">{item.productName}</p>
                        <p className="text-gray-400 text-xs">Size: {item.size} × {item.quantity}</p>
                      </div>
                      <span className="text-rose-400 text-sm font-bold shrink-0">৳{item.unitPrice * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm border-t border-gray-800 pt-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span><span className="text-white">৳{subtotal}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount ({couponApplied.code})</span><span>−৳{couponApplied.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Delivery</span>
                    <span className={deliveryCost === 0 ? 'text-green-400 font-bold' : 'text-white'}>
                      {deliveryCost === 0 ? 'FREE' : `৳${deliveryCost}`}
                    </span>
                  </div>
                  {selectedShipping && (
                    <p className="text-gray-500 text-xs">{selectedShipping.methodName} · {selectedShipping.zoneName}</p>
                  )}
                  <div className="flex justify-between font-bold text-base border-t border-gray-800 pt-2">
                    <span className="text-white">Total</span>
                    <span className="text-rose-400 text-xl">৳{total}</span>
                  </div>
                </div>
                <button type="submit" disabled={submitting}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.01]">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {submitting ? 'Placing Order...' : 'Confirm & Message via WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

