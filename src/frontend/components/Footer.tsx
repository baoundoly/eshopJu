import Link from 'next/link';
import { MessageCircle, Mail, MapPin } from 'lucide-react';

const shopLinks = [
  { href: '/products', label: 'All Jerseys' },
  { href: '/products?category=club', label: 'Club Jerseys' },
  { href: '/products?category=national', label: 'National Teams' },
  { href: '/products?category=custom', label: 'Custom Print' },
];

const infoLinks = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801XXXXXXXXX';

  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-1 font-black text-2xl tracking-tight w-fit">
              <span className="text-rose-500">Eshop</span>
              <span className="text-green-400">Ju</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bangladesh&apos;s #1 jersey store. Authentic football jerseys from top clubs and national teams.
              Fast delivery. Easy WhatsApp ordering.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {shopLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Information</h3>
            <ul className="space-y-2.5">
              {infoLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-gray-400 hover:text-green-400 text-sm transition-colors"
                >
                  <MessageCircle size={16} className="shrink-0" />
                  WhatsApp Order
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@eshopju.com"
                  className="flex items-center gap-2.5 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <Mail size={16} className="shrink-0" />
                  support@eshopju.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-gray-400 text-sm">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                Dhaka, Bangladesh
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            &copy; {year} EshopJu. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
