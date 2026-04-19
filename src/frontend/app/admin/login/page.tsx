'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function AdminLoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role !== 'admin') {
        setError('Access denied. This portal is for administrators only.');
        return;
      }
      localStorage.setItem('token', data.token);
      setUser({ name: data.name, email: data.email, role: data.role, token: data.token });
      toast.success(`Welcome, ${data.name}!`);
      router.push('/admin/dashboard');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-600/10 border border-rose-600/20 mb-4">
            <Shield className="text-rose-500" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">
            <Link href="/" className="font-black">
              <span className="text-rose-500">Eshop</span><span className="text-green-400">Ju</span>
            </Link>
            {' '}— Restricted access
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-xl shadow-black/50">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eshopju.com"
                autoComplete="username"
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 pr-12 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Shield size={16} />
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600 text-xs">
            This area is restricted to authorized administrators only.
          </p>
          <Link href="/login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors block">
            ← Customer login
          </Link>
        </div>
      </div>
    </div>
  );
}
