import type { Metadata } from 'next';
import { MessageCircle, Mail, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - EshopJu',
  description: 'Get in touch with EshopJu for orders, inquiries, and support.',
};

const contactItems = [
  {
    icon: MessageCircle,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    title: 'WhatsApp',
    description: 'Fastest way to reach us. Order directly via WhatsApp.',
    action: { label: 'Chat on WhatsApp', href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801XXXXXXXXX'}`, external: true },
  },
  {
    icon: Mail,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Email',
    description: 'For general inquiries and support.',
    action: { label: 'support@eshopju.com', href: 'mailto:support@eshopju.com', external: false },
  },
  {
    icon: MapPin,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    title: 'Location',
    description: 'Dhaka, Bangladesh',
    action: null,
  },
  {
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    title: 'Business Hours',
    description: 'Saturday – Thursday: 9 AM – 9 PM\nFriday: 2 PM – 9 PM',
    action: null,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="bg-gradient-to-br from-black via-gray-950 to-rose-950/20 border-b border-gray-800 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            We&apos;re here to help
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Contact <span className="text-rose-500">Us</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Have a question or need help with your order? Reach out — we respond fast.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {contactItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={`rounded-2xl border ${item.bg} p-6 flex flex-col gap-4`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} border`}>
                  <Icon size={22} className={item.color} />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{item.description}</p>
                </div>
                {item.action && (
                  <a
                    href={item.action.href}
                    target={item.action.external ? '_blank' : undefined}
                    rel={item.action.external ? 'noopener noreferrer' : undefined}
                    className={`inline-flex items-center gap-2 text-sm font-bold ${item.color} hover:underline`}
                  >
                    {item.action.label}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-black text-white mb-10 text-center">
            Frequently Asked <span className="text-rose-500">Questions</span>
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'How do I place an order?',
                a: 'Add items to your cart, proceed to checkout, fill in your details, and confirm. You can also send us a message on WhatsApp to order directly.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept bKash, Nagad, and Cash on Delivery.',
              },
              {
                q: 'How long does delivery take?',
                a: 'Inside Dhaka: 1–2 business days. Outside Dhaka: 3–5 business days.',
              },
              {
                q: 'Can I exchange or return a jersey?',
                a: 'Yes. Contact us within 48 hours of receiving your order if there is a defect or size issue. WhatsApp is the fastest way to resolve it.',
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h4 className="text-white font-bold mb-2">{faq.q}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
