'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Tag, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
  getDiscountRules, createDiscountRule, updateDiscountRule, deleteDiscountRule,
} from '@/lib/api';
import type { CouponDto, DiscountRuleDto } from '@/lib/types';

type Tab = 'coupons' | 'rules';

const DISCOUNT_TYPES = [
  { value: 0, label: 'Percentage (%)' },
  { value: 1, label: 'Fixed Amount (৳)' },
];

const APPLIES_TO = [
  { value: 0, label: 'All Orders' },
  { value: 1, label: 'Category' },
  { value: 2, label: 'Product' },
];

const emptyCoupon = () => ({
  code: '', name: '', description: '', discountType: 0, value: '', maxDiscountAmount: '',
  minOrderAmount: '', usageLimit: '', perUserLimit: '', startDate: '', endDate: '', isActive: true,
});

const emptyRule = () => ({
  name: '', description: '', discountType: 0, value: '', maxDiscountAmount: '',
  minOrderAmount: '', appliesTo: 0, targetId: '', startDate: '', endDate: '',
  isActive: true, priority: 10, isStackable: true,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toNum = (v: any) => (v === '' || v == null ? undefined : Number(v));

export default function CouponsPage() {
  const [tab, setTab] = useState<Tab>('coupons');

  // Coupons state
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [couponLoading, setCouponLoading] = useState(true);
  const [couponModal, setCouponModal] = useState<'create' | number | null>(null);
  const [couponForm, setCouponForm] = useState(emptyCoupon());
  const [couponSaving, setCouponSaving] = useState(false);

  // Rules state
  const [rules, setRules] = useState<DiscountRuleDto[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [ruleModal, setRuleModal] = useState<'create' | number | null>(null);
  const [ruleForm, setRuleForm] = useState(emptyRule());
  const [ruleSaving, setRuleSaving] = useState(false);

  const loadCoupons = useCallback(() => {
    setCouponLoading(true);
    getCoupons({ pageSize: 100 })
      .then((r) => setCoupons(r.items))
      .catch(() => toast.error('Failed to load coupons'))
      .finally(() => setCouponLoading(false));
  }, []);

  const loadRules = useCallback(() => {
    setRulesLoading(true);
    getDiscountRules()
      .then(setRules)
      .catch(() => toast.error('Failed to load discount rules'))
      .finally(() => setRulesLoading(false));
  }, []);

  useEffect(() => { loadCoupons(); loadRules(); }, [loadCoupons, loadRules]);

  // ── Coupons ──────────────────────────────────────────────────────────────

  const openCreateCoupon = () => { setCouponForm(emptyCoupon()); setCouponModal('create'); };
  const openEditCoupon = (c: CouponDto) => {
    setCouponForm({
      code: c.code, name: c.name ?? '', description: c.description ?? '',
      discountType: c.discountType === 'Percentage' ? 0 : 1,
      value: String(c.value), maxDiscountAmount: String(c.maxDiscountAmount ?? ''),
      minOrderAmount: String(c.minOrderAmount ?? ''), usageLimit: String(c.usageLimit ?? ''),
      perUserLimit: String(c.perUserLimit ?? ''),
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
      isActive: c.isActive,
    });
    setCouponModal(c.id);
  };

  const saveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponSaving(true);
    try {
      const payload = {
        code: couponForm.code, name: couponForm.name || undefined,
        description: couponForm.description || undefined,
        discountType: couponForm.discountType, value: Number(couponForm.value),
        maxDiscountAmount: toNum(couponForm.maxDiscountAmount),
        minOrderAmount: toNum(couponForm.minOrderAmount),
        usageLimit: toNum(couponForm.usageLimit),
        perUserLimit: toNum(couponForm.perUserLimit),
        startDate: couponForm.startDate || undefined,
        endDate: couponForm.endDate || undefined,
        isActive: couponForm.isActive,
      };
      if (couponModal === 'create') {
        await createCoupon(payload);
        toast.success('Coupon created');
      } else {
        await updateCoupon(couponModal as number, payload);
        toast.success('Coupon updated');
      }
      setCouponModal(null);
      loadCoupons();
    } catch {
      toast.error('Failed to save coupon');
    } finally {
      setCouponSaving(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      setCoupons((p) => p.filter((c) => c.id !== id));
      toast.success('Coupon deleted');
    } catch { toast.error('Failed to delete coupon'); }
  };

  // ── Rules ─────────────────────────────────────────────────────────────────

  const openCreateRule = () => { setRuleForm(emptyRule()); setRuleModal('create'); };
  const openEditRule = (r: DiscountRuleDto) => {
    setRuleForm({
      name: r.name, description: r.description ?? '',
      discountType: r.discountType === 'Percentage' ? 0 : 1,
      value: String(r.value), maxDiscountAmount: String(r.maxDiscountAmount ?? ''),
      minOrderAmount: String(r.minOrderAmount ?? ''),
      appliesTo: ['All', 'Category', 'Product'].indexOf(r.appliesTo),
      targetId: String(r.targetId ?? ''),
      startDate: r.startDate ? r.startDate.slice(0, 10) : '',
      endDate: r.endDate ? r.endDate.slice(0, 10) : '',
      isActive: r.isActive, priority: r.priority, isStackable: r.isStackable,
    });
    setRuleModal(r.id);
  };

  const saveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setRuleSaving(true);
    try {
      const payload = {
        name: ruleForm.name, description: ruleForm.description || undefined,
        discountType: ruleForm.discountType, value: Number(ruleForm.value),
        maxDiscountAmount: toNum(ruleForm.maxDiscountAmount),
        minOrderAmount: toNum(ruleForm.minOrderAmount),
        appliesTo: ruleForm.appliesTo, targetId: toNum(ruleForm.targetId),
        startDate: ruleForm.startDate || undefined,
        endDate: ruleForm.endDate || undefined,
        isActive: ruleForm.isActive, priority: Number(ruleForm.priority),
        isStackable: ruleForm.isStackable,
      };
      if (ruleModal === 'create') {
        await createDiscountRule(payload);
        toast.success('Discount rule created');
      } else {
        await updateDiscountRule(ruleModal as number, payload);
        toast.success('Discount rule updated');
      }
      setRuleModal(null);
      loadRules();
    } catch {
      toast.error('Failed to save rule');
    } finally {
      setRuleSaving(false);
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Delete this discount rule?')) return;
    try {
      await deleteDiscountRule(id);
      setRules((p) => p.filter((r) => r.id !== id));
      toast.success('Rule deleted');
    } catch { toast.error('Failed to delete rule'); }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-black text-white">Coupons & Discounts</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 w-fit">
        {(['coupons', 'rules'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors flex items-center gap-2 ${tab === t ? 'bg-rose-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t === 'coupons' ? <Tag size={14} /> : <Zap size={14} />}
            {t === 'coupons' ? 'Coupon Codes' : 'Auto Rules'}
          </button>
        ))}
      </div>

      {/* Coupons Tab */}
      {tab === 'coupons' && (
        <>
          <div className="flex justify-end">
            <button onClick={openCreateCoupon} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
              <Plus size={16} /> New Coupon
            </button>
          </div>
          <div className="bg-gray-900 rounded-2xl border border-gray-800">
            {couponLoading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />)}</div>
            ) : coupons.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No coupons yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Code', 'Type', 'Value', 'Used', 'Min Order', 'Valid Until', 'Status', ''].map((h) => (
                        <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-rose-400 font-bold font-mono">{c.code}</td>
                        <td className="px-4 py-3 text-gray-300 text-xs">{c.discountType}</td>
                        <td className="px-4 py-3 text-green-400 font-bold">
                          {c.discountType === 'Percentage' ? `${c.value}%` : `৳${c.value}`}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}
                        </td>
                        <td className="px-4 py-3 text-gray-400">{c.minOrderAmount ? `৳${c.minOrderAmount}` : '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{c.endDate ? new Date(c.endDate).toLocaleDateString('en-BD') : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                            {c.isActive ? 'Active' : 'Off'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditCoupon(c)} className="text-gray-400 hover:text-white"><Pencil size={14} /></button>
                            <button onClick={() => handleDeleteCoupon(c.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Rules Tab */}
      {tab === 'rules' && (
        <>
          <div className="flex justify-end">
            <button onClick={openCreateRule} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
              <Plus size={16} /> New Rule
            </button>
          </div>
          <div className="bg-gray-900 rounded-2xl border border-gray-800">
            {rulesLoading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />)}</div>
            ) : rules.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No automatic discount rules yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Name', 'Type', 'Value', 'Applies To', 'Min Order', 'Priority', 'Status', ''].map((h) => (
                        <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((r) => (
                      <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-white font-medium">{r.name}</td>
                        <td className="px-4 py-3 text-gray-300 text-xs">{r.discountType}</td>
                        <td className="px-4 py-3 text-green-400 font-bold">
                          {r.discountType === 'Percentage' ? `${r.value}%` : `৳${r.value}`}
                        </td>
                        <td className="px-4 py-3 text-gray-300 capitalize">{r.appliesTo}</td>
                        <td className="px-4 py-3 text-gray-400">{r.minOrderAmount ? `৳${r.minOrderAmount}` : '—'}</td>
                        <td className="px-4 py-3 text-gray-300">{r.priority}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                            {r.isActive ? 'Active' : 'Off'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditRule(r)} className="text-gray-400 hover:text-white"><Pencil size={14} /></button>
                            <button onClick={() => handleDeleteRule(r.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Coupon Modal */}
      {couponModal !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70" onClick={() => setCouponModal(null)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">{couponModal === 'create' ? 'New Coupon' : 'Edit Coupon'}</h2>
              <button onClick={() => setCouponModal(null)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>
            <form onSubmit={saveCoupon} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Code *</label>
                  <input value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} required
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Discount Type</label>
                  <select value={couponForm.discountType} onChange={(e) => setCouponForm({ ...couponForm, discountType: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500">
                    {DISCOUNT_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Value *</label>
                  <input type="number" min="0" value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })} required
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Min Order (৳)</label>
                  <input type="number" min="0" value={couponForm.minOrderAmount} onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Max Discount (৳)</label>
                  <input type="number" min="0" value={couponForm.maxDiscountAmount} onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Usage Limit</label>
                  <input type="number" min="0" value={couponForm.usageLimit} onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Per User Limit</label>
                  <input type="number" min="0" value={couponForm.perUserLimit} onChange={(e) => setCouponForm({ ...couponForm, perUserLimit: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Start Date</label>
                  <input type="date" value={couponForm.startDate} onChange={(e) => setCouponForm({ ...couponForm, startDate: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">End Date</label>
                  <input type="date" value={couponForm.endDate} onChange={(e) => setCouponForm({ ...couponForm, endDate: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={couponForm.isActive} onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-rose-500" />
                    <span className="text-white text-sm font-medium">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={couponSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm">
                  <Check size={14} /> {couponSaving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setCouponModal(null)}
                  className="flex-1 border border-gray-700 text-gray-300 hover:text-white font-bold py-2.5 rounded-xl text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rule Modal */}
      {ruleModal !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70" onClick={() => setRuleModal(null)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">{ruleModal === 'create' ? 'New Discount Rule' : 'Edit Rule'}</h2>
              <button onClick={() => setRuleModal(null)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>
            <form onSubmit={saveRule} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rule Name *</label>
                  <input value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} required
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Discount Type</label>
                  <select value={ruleForm.discountType} onChange={(e) => setRuleForm({ ...ruleForm, discountType: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500">
                    {DISCOUNT_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Value *</label>
                  <input type="number" min="0" value={ruleForm.value} onChange={(e) => setRuleForm({ ...ruleForm, value: e.target.value })} required
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Applies To</label>
                  <select value={ruleForm.appliesTo} onChange={(e) => setRuleForm({ ...ruleForm, appliesTo: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500">
                    {APPLIES_TO.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Min Order (৳)</label>
                  <input type="number" min="0" value={ruleForm.minOrderAmount} onChange={(e) => setRuleForm({ ...ruleForm, minOrderAmount: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Priority</label>
                  <input type="number" min="0" value={ruleForm.priority} onChange={(e) => setRuleForm({ ...ruleForm, priority: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Start Date</label>
                  <input type="date" value={ruleForm.startDate} onChange={(e) => setRuleForm({ ...ruleForm, startDate: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">End Date</label>
                  <input type="date" value={ruleForm.endDate} onChange={(e) => setRuleForm({ ...ruleForm, endDate: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
                <div className="col-span-2 flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={ruleForm.isActive} onChange={(e) => setRuleForm({ ...ruleForm, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-rose-500" />
                    <span className="text-white text-sm">Active</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={ruleForm.isStackable} onChange={(e) => setRuleForm({ ...ruleForm, isStackable: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-rose-500" />
                    <span className="text-white text-sm">Stackable</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={ruleSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm">
                  <Check size={14} /> {ruleSaving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setRuleModal(null)}
                  className="flex-1 border border-gray-700 text-gray-300 hover:text-white font-bold py-2.5 rounded-xl text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
