'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get('order') || '';
  const waLink = params.get('wa') ? decodeURIComponent(params.get('wa')!) : '';
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801XXXXXXXXX';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle size={48} className="text-green-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Order Placed! 🎉</h1>
        {orderNumber && (
          <p className="text-gray-400 mb-2">
            Your order number is{' '}
            <span className="text-rose-400 font-black text-lg">#{orderNumber}</span>
          </p>
        )}
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Thank you for your order! Please message us on WhatsApp to confirm your order and arrange payment.
        </p>

        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6 text-left">
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">Track Your Order</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Keep your order number <span className="text-rose-400 font-bold">#{orderNumber}</span> safe.
            Message us on WhatsApp with your order number to get real-time updates on your delivery.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02]"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Confirm on WhatsApp
            </a>
          ) : (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all"
            >
              Contact WhatsApp
            </a>
          )}
          <Link
            href="/products"
            className="flex-1 flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 text-white font-bold py-4 rounded-xl transition-all hover:bg-gray-900"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
