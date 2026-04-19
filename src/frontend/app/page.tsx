'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowRight, Zap, Shield, Truck, MessageCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getFeatured, getActiveSlides } from '@/lib/api';
import type { Product, SlideDto } from '@/lib/types';

const categories = [
  { name: 'Club Jerseys', desc: 'Premier League, La Liga, Serie A & more', color: 'from-rose-600 to-rose-900', icon: '⚽', href: '/products?category=club' },
  { name: 'National Team', desc: 'World Cup & international favorites', color: 'from-green-600 to-green-900', icon: '🏆', href: '/products?category=national' },
  { name: 'Custom Print', desc: 'Your name & number on any jersey', color: 'from-blue-600 to-blue-900', icon: '✨', href: '/products?category=custom' },
];

const stats = [
  { label: '500+ Products', icon: <Zap size={20} className="text-rose-400" /> },
  { label: 'Fast Delivery', icon: <Truck size={20} className="text-green-400" /> },
  { label: 'Authentic Quality', icon: <Shield size={20} className="text-blue-400" /> },
  { label: 'WhatsApp Orders', icon: <MessageCircle size={20} className="text-green-400" /> },
];

const steps = [
  { step: '01', title: 'Browse', desc: 'Explore 500+ jerseys from top clubs & national teams' },
  { step: '02', title: 'Add to Cart', desc: 'Select your size and add items to your cart' },
  { step: '03', title: 'Order via WhatsApp', desc: 'Confirm your order and pay easily via bKash/Nagad' },
];

const SLIDE_INTERVAL = 5000;

function HeroSlideshow({ slides }: { slides: SlideDto[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(next, SLIDE_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, next]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, SLIDE_INTERVAL);
  };

  const goTo = (i: number) => { setCurrent(i); resetTimer(); };
  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };

  if (slides.length === 0) return null;

  const slide = slides[current];

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden group">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={slide.imageUrl}
          alt={slide.title}
          fill
          className="object-cover transition-opacity duration-700"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-gray-200 text-lg sm:text-xl mb-8 leading-relaxed">{slide.subtitle}</p>
          )}
          {slide.linkUrl && (
            <Link
              href={slide.linkUrl}
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-rose-500/30"
            >
              {slide.linkLabel || 'Shop Now'} <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>

      {/* Prev / Next buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 border border-white/10 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 border border-white/10 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-rose-500 w-6' : 'bg-white/40 hover:bg-white/70'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function StaticHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-rose-950/20" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 40px,#e11d48 40px,#e11d48 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#e11d48 40px,#e11d48 41px)',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          <span className="inline-block bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            🔥 Bangladesh&apos;s #1 Jersey Store
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight mb-6">
            Premium<br />
            <span className="text-rose-500">Football</span><br />
            Jerseys
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-xl leading-relaxed">
            Authentic jerseys from top clubs worldwide. Fast delivery across Bangladesh. Order via WhatsApp in minutes.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-rose-500/30"
            >
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-white font-bold px-8 py-4 rounded-xl transition-all hover:bg-gray-900"
            >
              Browse Categories <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [slides, setSlides] = useState<SlideDto[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingSlides, setLoadingSlides] = useState(true);

  useEffect(() => {
    getFeatured(8)
      .then(setFeatured)
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false));

    getActiveSlides()
      .then(setSlides)
      .catch(() => setSlides([]))
      .finally(() => setLoadingSlides(false));
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero / Slideshow */}
      {loadingSlides ? (
        <div className="min-h-[70vh] bg-gray-950 animate-pulse" />
      ) : slides.length > 0 ? (
        <HeroSlideshow slides={slides} />
      ) : (
        <StaticHero />
      )}

      {/* Stats bar */}
      <section className="bg-gray-950 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                {s.icon}
                <span className="text-white font-bold text-sm sm:text-base">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Shop by <span className="text-rose-500">Category</span>
          </h2>
          <p className="text-gray-400">Find the perfect jersey for every fan</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} p-8 group hover:scale-[1.02] transition-all duration-300 border border-white/5`}
            >
              <div className="text-5xl mb-4">{cat.icon}</div>
              <h3 className="text-white font-black text-xl mb-2">{cat.name}</h3>
              <p className="text-white/60 text-sm">{cat.desc}</p>
              <ArrowRight
                size={20}
                className="absolute bottom-6 right-6 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Featured <span className="text-rose-500">Jerseys</span>
            </h2>
            <p className="text-gray-400">Our most popular picks</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold text-sm transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl aspect-square animate-pulse" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-semibold mb-4">No featured products yet</p>
            <Link href="/products" className="text-rose-400 hover:text-rose-300 font-bold">
              Browse all products →
            </Link>
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link href="/products" className="inline-flex items-center gap-1 text-rose-400 font-bold">
            View All <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* How to Order */}
      <section className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              How to <span className="text-green-400">Order</span>
            </h2>
            <p className="text-gray-400">Get your jersey in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-rose-400 font-black text-xl">{s.step}</span>
                </div>
                <h3 className="text-white font-black text-xl mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
