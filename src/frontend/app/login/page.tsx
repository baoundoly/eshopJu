'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ShoppingBag, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { login, register } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

type Tab = 'login' | 'register';

export default function CustomerLoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [tab, setTab] = useState<Tab>('login');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      setUser({ name: data.name, email: data.email, role: data.role, token: data.token });
      toast.success(`Welcome back, ${data.name}!`);
      // Customers go to home; admins are told to use admin login
      if (data.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regName || !regEmail || !regPhone || !regPassword || !regConfirm) {
      setError('Please fill in all fields');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Passwords do not match');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await register(regName, regEmail, regPhone, regPassword);
      localStorage.setItem('token', data.token);
      setUser({ name: data.name, email: data.email, role: data.role, token: data.token });
      toast.success(`Welcome, ${data.name}! Account created.`);
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('already exists') ? 'An account with this email already exists' : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-black text-3xl">
            <span className="text-rose-500">Eshop</span><span className="text-green-400">Ju</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-2 text-gray-400 text-sm">
            <ShoppingBag size={14} />
            <span>Customer Account</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl overflow-hidden border border-gray-800 mb-6">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              tab === 'login'
                ? 'bg-rose-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              tab === 'register'
                ? 'bg-rose-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 pr-12 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-center text-gray-500 text-xs pt-1">
                No account?{' '}
                <button type="button" onClick={() => { setTab('register'); setError(''); }}
                  className="text-green-400 hover:text-green-300 font-semibold">
                  Create one free
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  autoComplete="tel"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showRegPw ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 pr-12 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowRegPw(!showRegPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showRegPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all mt-2 flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="text-center text-gray-500 text-xs pt-1">
                Already have an account?{' '}
                <button type="button" onClick={() => { setTab('login'); setError(''); }}
                  className="text-rose-400 hover:text-rose-300 font-semibold">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors">← Back to store</Link>
          <Link href="/admin/login" className="text-gray-600 hover:text-gray-400 transition-colors text-xs">
            Admin? Login here →
          </Link>
        </div>
      </div>
    </div>
  );
}
