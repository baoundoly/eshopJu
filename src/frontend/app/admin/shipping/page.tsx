'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getShippingZones, createShippingZone, updateShippingZone, deleteShippingZone,
  getShippingMethods, createShippingMethod, updateShippingMethod, deleteShippingMethod,
  getShippingRates, createShippingRate, updateShippingRate, deleteShippingRate,
} from '@/lib/api';
import type { ShippingZoneDto, ShippingMethodDto, ShippingRateDto } from '@/lib/types';

type Tab = 'zones' | 'methods' | 'rates';

export default function ShippingPage() {
  const [tab, setTab] = useState<Tab>('zones');

  // Zones
  const [zones, setZones] = useState<ShippingZoneDto[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zoneModal, setZoneModal] = useState<'create' | number | null>(null);
  const [zoneForm, setZoneForm] = useState({ name: '', description: '', isActive: true, areasText: '' });
  const [zoneSaving, setZoneSaving] = useState(false);

  // Methods
  const [methods, setMethods] = useState<ShippingMethodDto[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(false);
  const [methodModal, setMethodModal] = useState<'create' | number | null>(null);
  const [methodForm, setMethodForm] = useState({ name: '', description: '', isActive: true });
  const [methodSaving, setMethodSaving] = useState(false);

  // Rates
  const [rates, setRates] = useState<ShippingRateDto[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [rateModal, setRateModal] = useState<'create' | number | null>(null);
  const [rateForm, setRateForm] = useState({ zoneId: '', methodId: '', minOrderAmount: '', maxOrderAmount: '', rate: '', isFreeShipping: false });
  const [rateSaving, setRateSaving] = useState(false);

  const loadZones = useCallback(async () => {
    setZonesLoading(true);
    try { setZones(await getShippingZones()); }
    catch { toast.error('Failed to load zones'); }
    finally { setZonesLoading(false); }
  }, []);

  const loadMethods = useCallback(async () => {
    setMethodsLoading(true);
    try { setMethods(await getShippingMethods()); }
    catch { toast.error('Failed to load methods'); }
    finally { setMethodsLoading(false); }
  }, []);

  const loadRates = useCallback(async () => {
    setRatesLoading(true);
    try { setRates(await getShippingRates()); }
    catch { toast.error('Failed to load rates'); }
    finally { setRatesLoading(false); }
  }, []);

  useEffect(() => { loadZones(); }, [loadZones]);
  useEffect(() => {
    if (tab === 'methods') loadMethods();
    if (tab === 'rates') { loadRates(); loadZones(); loadMethods(); }
  }, [tab, loadMethods, loadRates, loadZones]);

  // ── Zones ─────────────────────────────────────────────────────────────────

  const parseAreas = (text: string) =>
    text.split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const parts = l.split(',').map((p) => p.trim());
        return { district: parts[0], thana: parts[1] };
      });

  const openCreateZone = () => { setZoneForm({ name: '', description: '', isActive: true, areasText: '' }); setZoneModal('create'); };
  const openEditZone = (z: ShippingZoneDto) => {
    const areasText = z.areas.map((a) => a.thana ? `${a.district}, ${a.thana}` : a.district).join('\n');
    setZoneForm({ name: z.name, description: z.description ?? '', isActive: z.isActive, areasText });
    setZoneModal(z.id);
  };

  const saveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setZoneSaving(true);
    try {
      const payload = { name: zoneForm.name, description: zoneForm.description || undefined, isActive: zoneForm.isActive, areas: parseAreas(zoneForm.areasText) };
      if (zoneModal === 'create') { await createShippingZone(payload); toast.success('Zone created'); }
      else { await updateShippingZone(zoneModal as number, payload); toast.success('Zone updated'); }
      setZoneModal(null);
      loadZones();
    } catch { toast.error('Failed to save zone'); }
    finally { setZoneSaving(false); }
  };

  const deleteZone = async (id: number) => {
    if (!confirm('Delete this zone? Rates for it will also be removed.')) return;
    try { await deleteShippingZone(id); setZones((p) => p.filter((z) => z.id !== id)); toast.success('Zone deleted'); }
    catch { toast.error('Failed to delete zone'); }
  };

  // ── Methods ───────────────────────────────────────────────────────────────

  const openCreateMethod = () => { setMethodForm({ name: '', description: '', isActive: true }); setMethodModal('create'); };
  const openEditMethod = (m: ShippingMethodDto) => { setMethodForm({ name: m.name, description: m.description ?? '', isActive: m.isActive }); setMethodModal(m.id); };

  const saveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setMethodSaving(true);
    try {
      const payload = { name: methodForm.name, description: methodForm.description || undefined, isActive: methodForm.isActive };
      if (methodModal === 'create') { await createShippingMethod(payload); toast.success('Method created'); }
      else { await updateShippingMethod(methodModal as number, payload); toast.success('Method updated'); }
      setMethodModal(null);
      loadMethods();
    } catch { toast.error('Failed to save method'); }
    finally { setMethodSaving(false); }
  };

  const deleteMethod = async (id: number) => {
    if (!confirm('Delete this shipping method?')) return;
    try { await deleteShippingMethod(id); setMethods((p) => p.filter((m) => m.id !== id)); toast.success('Method deleted'); }
    catch { toast.error('Failed to delete method'); }
  };

  // ── Rates ─────────────────────────────────────────────────────────────────

  const openCreateRate = () => {
    setRateForm({ zoneId: '', methodId: '', minOrderAmount: '', maxOrderAmount: '', rate: '', isFreeShipping: false });
    setRateModal('create');
  };
  const openEditRate = (r: ShippingRateDto) => {
    setRateForm({ zoneId: String(r.zoneId), methodId: String(r.methodId), minOrderAmount: String(r.minOrderAmount ?? ''), maxOrderAmount: String(r.maxOrderAmount ?? ''), rate: String(r.rate), isFreeShipping: r.isFreeShipping });
    setRateModal(r.id);
  };

  const saveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setRateSaving(true);
    try {
      const toN = (v: string) => v === '' ? undefined : Number(v);
      const payload = {
        zoneId: Number(rateForm.zoneId), methodId: Number(rateForm.methodId),
        minOrderAmount: toN(rateForm.minOrderAmount), maxOrderAmount: toN(rateForm.maxOrderAmount),
        rate: Number(rateForm.rate), isFreeShipping: rateForm.isFreeShipping,
      };
      if (rateModal === 'create') { await createShippingRate(payload); toast.success('Rate created'); }
      else { await updateShippingRate(rateModal as number, payload); toast.success('Rate updated'); }
      setRateModal(null);
      loadRates();
    } catch { toast.error('Failed to save rate'); }
    finally { setRateSaving(false); }
  };

  const deleteRate = async (id: number) => {
    if (!confirm('Delete this rate?')) return;
    try { await deleteShippingRate(id); setRates((p) => p.filter((r) => r.id !== id)); toast.success('Rate deleted'); }
    catch { toast.error('Failed to delete rate'); }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'zones', label: 'Zones' },
    { key: 'methods', label: 'Methods' },
    { key: 'rates', label: 'Rates' },
  ];

  const inputCls = 'w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500';

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-black text-white">Shipping</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 w-fit">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === t.key ? 'bg-rose-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Zones */}
      {tab === 'zones' && (
        <>
          <div className="flex justify-end">
            <button onClick={openCreateZone} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm">
              <Plus size={16} /> New Zone
            </button>
          </div>
          <div className="bg-gray-900 rounded-2xl border border-gray-800">
            {zonesLoading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-gray-800 rounded animate-pulse" />)}</div>
            ) : zones.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No shipping zones yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Name', 'Areas', 'Status', ''].map((h) => (
                        <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((z) => (
                      <tr key={z.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-white font-medium">{z.name}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          <div className="flex flex-wrap gap-1">
                            {z.areas.slice(0, 5).map((a) => (
                              <span key={a.id} className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                                {a.thana ? `${a.district}/${a.thana}` : a.district}
                              </span>
                            ))}
                            {z.areas.length > 5 && <span className="text-gray-500 text-xs">+{z.areas.length - 5} more</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${z.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                            {z.isActive ? 'Active' : 'Off'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditZone(z)} className="text-gray-400 hover:text-white"><Pencil size={14} /></button>
                            <button onClick={() => deleteZone(z.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
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

      {/* Methods */}
      {tab === 'methods' && (
        <>
          <div className="flex justify-end">
            <button onClick={openCreateMethod} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm">
              <Plus size={16} /> New Method
            </button>
          </div>
          <div className="bg-gray-900 rounded-2xl border border-gray-800">
            {methodsLoading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
            ) : methods.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No shipping methods yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Name', 'Description', 'Status', ''].map((h) => (
                        <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {methods.map((m) => (
                      <tr key={m.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-white font-medium">{m.name}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{m.description || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${m.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                            {m.isActive ? 'Active' : 'Off'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditMethod(m)} className="text-gray-400 hover:text-white"><Pencil size={14} /></button>
                            <button onClick={() => deleteMethod(m.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
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

      {/* Rates */}
      {tab === 'rates' && (
        <>
          <div className="flex justify-end">
            <button onClick={openCreateRate} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm">
              <Plus size={16} /> New Rate
            </button>
          </div>
          <div className="bg-gray-900 rounded-2xl border border-gray-800">
            {ratesLoading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
            ) : rates.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No shipping rates yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Zone', 'Method', 'Order Range', 'Rate', 'Free?', ''].map((h) => (
                        <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rates.map((r) => (
                      <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-white font-medium">{r.zoneName}</td>
                        <td className="px-4 py-3 text-gray-300">{r.methodName}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {r.minOrderAmount != null ? `৳${r.minOrderAmount}` : '—'} – {r.maxOrderAmount != null ? `৳${r.maxOrderAmount}` : '∞'}
                        </td>
                        <td className="px-4 py-3 text-rose-400 font-bold">৳{r.rate}</td>
                        <td className="px-4 py-3">
                          {r.isFreeShipping && <span className="text-xs bg-green-500/20 text-green-400 font-bold px-2 py-1 rounded-full">Free</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditRate(r)} className="text-gray-400 hover:text-white"><Pencil size={14} /></button>
                            <button onClick={() => deleteRate(r.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
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

      {/* Zone Modal */}
      {zoneModal !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70" onClick={() => setZoneModal(null)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">{zoneModal === 'create' ? 'New Zone' : 'Edit Zone'}</h2>
              <button onClick={() => setZoneModal(null)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>
            <form onSubmit={saveZone} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Zone Name *</label>
                <input value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                <input value={zoneForm.description} onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Areas (one per line: District or District, Thana)</label>
                <textarea value={zoneForm.areasText} onChange={(e) => setZoneForm({ ...zoneForm, areasText: e.target.value })}
                  rows={5} placeholder={'Dhaka\nChittagong, Kotwali\nSylhet'}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500 resize-none font-mono" />
              </div>
              {zoneModal !== 'create' && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={zoneForm.isActive} onChange={(e) => setZoneForm({ ...zoneForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-rose-500" />
                  <span className="text-white text-sm">Active</span>
                </label>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={zoneSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm">
                  <Check size={14} /> {zoneSaving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setZoneModal(null)} className="flex-1 border border-gray-700 text-gray-300 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Method Modal */}
      {methodModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMethodModal(null)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">{methodModal === 'create' ? 'New Method' : 'Edit Method'}</h2>
              <button onClick={() => setMethodModal(null)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>
            <form onSubmit={saveMethod} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Name *</label>
                <input value={methodForm.name} onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                <input value={methodForm.description} onChange={(e) => setMethodForm({ ...methodForm, description: e.target.value })} className={inputCls} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={methodForm.isActive} onChange={(e) => setMethodForm({ ...methodForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-rose-500" />
                <span className="text-white text-sm">Active</span>
              </label>
              <div className="flex gap-3">
                <button type="submit" disabled={methodSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm">
                  <Check size={14} /> {methodSaving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setMethodModal(null)} className="flex-1 border border-gray-700 text-gray-300 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rate Modal */}
      {rateModal !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70" onClick={() => setRateModal(null)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">{rateModal === 'create' ? 'New Rate' : 'Edit Rate'}</h2>
              <button onClick={() => setRateModal(null)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>
            <form onSubmit={saveRate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Zone *</label>
                <select value={rateForm.zoneId} onChange={(e) => setRateForm({ ...rateForm, zoneId: e.target.value })} required className={inputCls}>
                  <option value="">Select zone</option>
                  {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Method *</label>
                <select value={rateForm.methodId} onChange={(e) => setRateForm({ ...rateForm, methodId: e.target.value })} required className={inputCls}>
                  <option value="">Select method</option>
                  {methods.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Min Order (৳)</label>
                  <input type="number" min="0" value={rateForm.minOrderAmount} onChange={(e) => setRateForm({ ...rateForm, minOrderAmount: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Max Order (৳)</label>
                  <input type="number" min="0" value={rateForm.maxOrderAmount} onChange={(e) => setRateForm({ ...rateForm, maxOrderAmount: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rate (৳) *</label>
                <input type="number" min="0" value={rateForm.rate} onChange={(e) => setRateForm({ ...rateForm, rate: e.target.value })} required className={inputCls} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={rateForm.isFreeShipping} onChange={(e) => setRateForm({ ...rateForm, isFreeShipping: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-rose-500" />
                <span className="text-white text-sm">Free Shipping</span>
              </label>
              <div className="flex gap-3">
                <button type="submit" disabled={rateSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm">
                  <Check size={14} /> {rateSaving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setRateModal(null)} className="flex-1 border border-gray-700 text-gray-300 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
