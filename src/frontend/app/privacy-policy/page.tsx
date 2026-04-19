import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - EshopJu',
  description: 'Privacy policy and data practices for EshopJu, Bangladesh\'s #1 jersey store.',
};

const sections = [
  {
    title: '1. Information We Collect',
    content: `When you place an order or create an account on EshopJu, we collect the following information:
• Name, phone number, and delivery address
• Email address (for registered accounts)
• Order details and payment references (bKash/Nagad transaction IDs)
• Device and browser information for improving our website`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use your information solely to:
• Process and fulfil your orders
• Contact you via WhatsApp or phone regarding your order status
• Send order confirmations and updates
• Improve our products and services
• Resolve disputes and prevent fraud

We do not sell, rent, or share your personal information with third parties for marketing purposes.`,
  },
  {
    title: '3. Payment Information',
    content: `EshopJu does not store full payment credentials. When you pay via bKash or Nagad, we only record the transaction reference ID you provide, which is used solely to verify and confirm your payment. All payment transactions happen directly through your bKash or Nagad app.`,
  },
  {
    title: '4. Order Data',
    content: `Order information (items, amounts, delivery address) is stored securely and used to manage your purchase history and improve our service. Registered customers can view their order history in their account dashboard.`,
  },
  {
    title: '5. WhatsApp Communication',
    content: `If you place an order or contact us via WhatsApp, your messages and phone number will be visible to our team. We use these only to process your order and provide support. We do not share your WhatsApp information with third parties.`,
  },
  {
    title: '6. Cookies',
    content: `We use essential cookies to keep your shopping cart active across pages and to maintain your login session. We do not use tracking cookies or third-party advertising cookies.`,
  },
  {
    title: '7. Data Security',
    content: `We take reasonable technical and organisational measures to protect your data. Passwords are stored using industry-standard bcrypt hashing and are never stored in plain text.`,
  },
  {
    title: '8. Your Rights',
    content: `You have the right to:
• Access the personal information we hold about you
• Request correction of inaccurate data
• Request deletion of your account and associated data

To exercise any of these rights, contact us via WhatsApp or email at support@eshopju.com.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Any significant changes will be communicated via our website. Continued use of EshopJu after changes are posted constitutes your acceptance of the updated policy.`,
  },
  {
    title: '10. Contact',
    content: `If you have questions about this Privacy Policy, please reach out:
• WhatsApp: available on our website
• Email: support@eshopju.com
• Location: Dhaka, Bangladesh`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="bg-gradient-to-br from-black via-gray-950 to-rose-950/20 border-b border-gray-800 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            Legal
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Privacy <span className="text-rose-500">Policy</span>
          </h1>
          <p className="text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-gray-400 text-sm leading-relaxed mb-10">
          EshopJu (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This
          Privacy Policy explains how we collect, use, and safeguard your information when you use our website and
          services. By using EshopJu, you agree to the practices described in this policy.
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-white font-black text-xl mb-3">{section.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
