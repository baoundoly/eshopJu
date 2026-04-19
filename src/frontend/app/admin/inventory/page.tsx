'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, X, Check, AlertTriangle, Package, TrendingDown, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getInventoryDashboard, getInventory, getSuppliers, createSupplier,
  getStockIns, addStock, adjustStock, getStockHistory,
} from '@/lib/api';
import type { InventoryDashboardDto, InventoryVariantDto, SupplierDto, StockInDto, StockMovementDto, PagedResult } from '@/lib/types';

type Tab = 'overview' | 'stock-in' | 'suppliers' | 'history';

function KPI({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-white font-black text-xl">{value}</p>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>('overview');

  // Overview
  const [dashboard, setDashboard] = useState<InventoryDashboardDto | null>(null);
  const [inventory, setInventory] = useState<InventoryVariantDto[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  // Stock In
  const [stockIns, setStockIns] = useState<PagedResult<StockInDto> | null>(null);
  const [stockInLoading, setStockInLoading] = useState(false);
  const [stockInModal, setStockInModal] = useState(false);
  const [variants, setVariants] = useState<InventoryVariantDto[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
  const [stockForm, setStockForm] = useState<{ supplierId: string; notes: string; items: { variantId: string; quantity: string; purchasePrice: string }[] }>({
    supplierId: '', notes: '', items: [{ variantId: '', quantity: '', purchasePrice: '' }],
  });
  const [stockSaving, setStockSaving] = useState(false);

  // Adjust stock
  const [adjustModal, setAdjustModal] = useState<InventoryVariantDto | null>(null);
  const [adjustForm, setAdjustForm] = useState({ quantityChange: '', notes: '' });
  const [adjustSaving, setAdjustSaving] = useState(false);

  // Suppliers
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [supplierModal, setSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '', contactPhone: '', email: '', address: '' });
  const [supplierSaving, setSupplierSaving] = useState(false);

  // History
  const [history, setHistory] = useState<PagedResult<StockMovementDto> | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const [dash, inv] = await Promise.all([getInventoryDashboard(), getInventory()]);
      setDashboard(dash);
      setInventory(inv);
    } catch { toast.error('Failed to load inventory'); }
    finally { setOverviewLoading(false); }
  }, []);

  const loadStockIns = useCallback(async () => {
    setStockInLoading(true);
    try {
      const result = await getStockIns({ pageSize: 50 });
      setStockIns(result);
    } catch { toast.error('Failed to load stock-in records'); }
    finally { setStockInLoading(false); }
  }, []);

  const loadSuppliers = useCallback(async () => {
    setSuppliersLoading(true);
    try { setSuppliers(await getSuppliers()); }
    catch { toast.error('Failed to load suppliers'); }
    finally { setSuppliersLoading(false); }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try { setHistory(await getStockHistory({ pageSize: 100 })); }
    catch { toast.error('Failed to load history'); }
    finally { setHistoryLoading(false); }
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => {
    if (tab === 'stock-in') { loadStockIns(); loadSuppliers(); getInventory().then(setVariants); }
    if (tab === 'suppliers') loadSuppliers();
    if (tab === 'history') loadHistory();
  }, [tab, loadStockIns, loadSuppliers, loadHistory]);

  // Stock In submit
  const saveStockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStockSaving(true);
    try {
      await addStock({
        supplierId: stockForm.supplierId ? Number(stockForm.supplierId) : undefined,
        notes: stockForm.notes || undefined,
        items: stockForm.items
          .filter((i) => i.variantId && i.quantity)
          .map((i) => ({ productVariantId: Number(i.variantId), quantity: Number(i.quantity), purchasePrice: Number(i.purchasePrice) })),
      });
      toast.success('Stock added!');
      setStockInModal(false);
      setStockForm({ supplierId: '', notes: '', items: [{ variantId: '', quantity: '', purchasePrice: '' }] });
      loadStockIns();
      loadOverview();
    } catch { toast.error('Failed to add stock'); }
    finally { setStockSaving(false); }
  };

  // Adjust submit
  const saveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModal) return;
    setAdjustSaving(true);
    try {
      await adjustStock(adjustModal.variantId, Number(adjustForm.quantityChange), adjustForm.notes || undefined);
      toast.success('Stock adjusted!');
      setAdjustModal(null);
      loadOverview();
    } catch { toast.error('Failed to adjust stock'); }
    finally { setAdjustSaving(false); }
  };

  // Save supplier
  const saveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupplierSaving(true);
    try {
      const s = await createSupplier(supplierForm);
      setSuppliers((p) => [...p, s]);
      toast.success('Supplier created');
      setSupplierModal(false);
      setSupplierForm({ name: '', contactPhone: '', email: '', address: '' });
    } catch { toast.error('Failed to save supplier'); }
    finally { setSupplierSaving(false); }
  };

  const filteredInventory = inventory.filter((v) => {
    if (filter === 'low') return v.isLowStock && v.stockQuantity > 0;
    if (filter === 'out') return v.stockQuantity === 0;
    return true;
  });

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Stock Overview' },
    { key: 'stock-in', label: 'Stock In' },
    { key: 'suppliers', label: 'Suppliers' },
    { key: 'history', label: 'Movement History' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-black text-white">Inventory</h1>

      {/* KPI Cards */}
      {dashboard && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Total Variants" value={dashboard.totalVariants} icon={Package} color="bg-blue-500" />
          <KPI label="Low Stock" value={dashboard.lowStockVariants} icon={AlertTriangle} color="bg-amber-500" />
          <KPI label="Out of Stock" value={dashboard.outOfStockVariants} icon={TrendingDown} color="bg-red-500" />
          <KPI label="Stock Value" value={`৳${dashboard.totalStockValue.toLocaleString()}`} icon={DollarSign} color="bg-green-500" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 flex-wrap">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === t.key ? 'bg-rose-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <>
          <div className="flex gap-2">
            {(['all', 'low', 'out'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === f ? 'bg-rose-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                {f === 'all' ? 'All' : f === 'low' ? '⚠ Low Stock' : '❌ Out of Stock'}
              </button>
            ))}
          </div>
          <div className="bg-gray-900 rounded-2xl border border-gray-800">
            {overviewLoading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
            ) : filteredInventory.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No items found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Product', 'Variant', 'SKU', 'Stock', 'Status', 'Adjust'].map((h) => (
                        <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((v) => (
                      <tr key={v.variantId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-white font-medium">{v.productName}</td>
                        <td className="px-4 py-3 text-gray-300 capitalize text-xs">
                          {[v.color, v.jerseyType !== 'NotApplicable' ? v.jerseyType : null, v.size].filter(Boolean).join(' · ')}
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{v.sku || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`font-black ${v.stockQuantity === 0 ? 'text-red-400' : v.isLowStock ? 'text-amber-400' : 'text-green-400'}`}>
                            {v.stockQuantity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {v.stockQuantity === 0 ? (
                            <span className="text-xs bg-red-500/20 text-red-400 font-bold px-2 py-1 rounded-full">Out</span>
                          ) : v.isLowStock ? (
                            <span className="text-xs bg-amber-500/20 text-amber-400 font-bold px-2 py-1 rounded-full">Low</span>
                          ) : (
                            <span className="text-xs bg-green-500/20 text-green-400 font-bold px-2 py-1 rounded-full">OK</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => { setAdjustModal(v); setAdjustForm({ quantityChange: '', notes: '' }); }}
                            className="text-xs text-rose-400 hover:text-rose-300 font-bold">Adjust</button>
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

      {/* Stock In Tab */}
      {tab === 'stock-in' && (
        <>
          <div className="flex justify-end">
            <button onClick={() => setStockInModal(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm">
              <Plus size={16} /> Add Stock
            </button>
          </div>
          <div className="bg-gray-900 rounded-2xl border border-gray-800">
            {stockInLoading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />)}</div>
            ) : !stockIns || stockIns.items.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No stock-in records yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['#', 'Supplier', 'Items', 'Notes', 'Date'].map((h) => (
                        <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stockIns.items.map((si) => (
                      <tr key={si.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-gray-400 font-mono">#{si.id}</td>
                        <td className="px-4 py-3 text-gray-300">{si.supplierName ?? '—'}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            {si.items.map((item, i) => (
                              <div key={i} className="text-xs text-gray-400">
                                {item.productName} · {item.variantLabel} × <span className="text-white font-bold">{item.quantity}</span>
                                <span className="text-gray-500 ml-1">@৳{item.purchasePrice}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{si.notes || '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(si.createdAt).toLocaleDateString('en-BD')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Suppliers Tab */}
      {tab === 'suppliers' && (
        <>
          <div className="flex justify-end">
            <button onClick={() => setSupplierModal(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm">
              <Plus size={16} /> New Supplier
            </button>
          </div>
          <div className="bg-gray-900 rounded-2xl border border-gray-800">
            {suppliersLoading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />)}</div>
            ) : suppliers.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No suppliers yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Name', 'Phone', 'Email', 'Address', 'Status'].map((h) => (
                        <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((s) => (
                      <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                        <td className="px-4 py-3 text-gray-300">{s.contactPhone || '—'}</td>
                        <td className="px-4 py-3 text-gray-300">{s.email || '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{s.address || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                            {s.isActive ? 'Active' : 'Inactive'}
                          </span>
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

      {/* History Tab */}
      {tab === 'history' && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          {historyLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
          ) : !history || history.items.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No movement history</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['Product', 'Variant', 'Type', 'Qty', 'Ref', 'Notes', 'Date'].map((h) => (
                      <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.items.map((m) => (
                    <tr key={m.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-white">{m.productName}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{m.variantLabel}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          m.movementType === 'In' ? 'bg-green-500/20 text-green-400' :
                          m.movementType === 'Out' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>{m.movementType}</span>
                      </td>
                      <td className={`px-4 py-3 font-black ${m.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {m.quantity > 0 ? '+' : ''}{m.quantity}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{m.referenceType}{m.referenceId ? ` #${m.referenceId}` : ''}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{m.notes || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(m.createdAt).toLocaleDateString('en-BD')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setAdjustModal(null)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">Adjust Stock</h2>
              <button onClick={() => setAdjustModal(null)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>
            <p className="text-gray-400 text-sm">{adjustModal.productName} · <span className="capitalize">{adjustModal.size}</span> · Current: <span className="text-white font-bold">{adjustModal.stockQuantity}</span></p>
            <form onSubmit={saveAdjust} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Quantity Change (+ to add, - to remove)</label>
                <input type="number" value={adjustForm.quantityChange} onChange={(e) => setAdjustForm({ ...adjustForm, quantityChange: e.target.value })} required
                  placeholder="e.g. 10 or -5"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Notes</label>
                <input value={adjustForm.notes} onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })} placeholder="Reason for adjustment"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={adjustSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm">
                  <Check size={14} /> {adjustSaving ? 'Saving...' : 'Adjust'}
                </button>
                <button type="button" onClick={() => setAdjustModal(null)}
                  className="flex-1 border border-gray-700 text-gray-300 hover:text-white font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock In Modal */}
      {stockInModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70" onClick={() => setStockInModal(false)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Add Stock</h2>
              <button onClick={() => setStockInModal(false)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>
            <form onSubmit={saveStockIn} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Supplier</label>
                  <select value={stockForm.supplierId} onChange={(e) => setStockForm({ ...stockForm, supplierId: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500">
                    <option value="">None</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Notes</label>
                  <input value={stockForm.notes} onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-400 uppercase">Items</label>
                  <button type="button" onClick={() => setStockForm({ ...stockForm, items: [...stockForm.items, { variantId: '', quantity: '', purchasePrice: '' }] })}
                    className="text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1"><Plus size={12} /> Row</button>
                </div>
                {stockForm.items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <select value={item.variantId} onChange={(e) => { const items = [...stockForm.items]; items[i].variantId = e.target.value; setStockForm({ ...stockForm, items }); }}
                      className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-rose-500">
                      <option value="">Select variant</option>
                      {variants.map((v) => (
                        <option key={v.variantId} value={v.variantId}>
                          {v.productName} · {[v.color, v.size].filter(Boolean).join(' ')}
                        </option>
                      ))}
                    </select>
                    <input type="number" min="1" placeholder="Qty" value={item.quantity}
                      onChange={(e) => { const items = [...stockForm.items]; items[i].quantity = e.target.value; setStockForm({ ...stockForm, items }); }}
                      className="w-16 bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-rose-500" />
                    <input type="number" min="0" placeholder="Price" value={item.purchasePrice}
                      onChange={(e) => { const items = [...stockForm.items]; items[i].purchasePrice = e.target.value; setStockForm({ ...stockForm, items }); }}
                      className="w-20 bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-rose-500" />
                    {stockForm.items.length > 1 && (
                      <button type="button" onClick={() => setStockForm({ ...stockForm, items: stockForm.items.filter((_, j) => j !== i) })}
                        className="text-gray-500 hover:text-red-400"><X size={14} /></button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={stockSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm">
                  <Check size={14} /> {stockSaving ? 'Saving...' : 'Add Stock'}
                </button>
                <button type="button" onClick={() => setStockInModal(false)}
                  className="flex-1 border border-gray-700 text-gray-300 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {supplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSupplierModal(false)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">New Supplier</h2>
              <button onClick={() => setSupplierModal(false)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>
            <form onSubmit={saveSupplier} className="space-y-3">
              {[
                { label: 'Name *', key: 'name' as const, required: true },
                { label: 'Phone', key: 'contactPhone' as const },
                { label: 'Email', key: 'email' as const },
                { label: 'Address', key: 'address' as const },
              ].map(({ label, key, required }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{label}</label>
                  <input value={supplierForm[key]} onChange={(e) => setSupplierForm({ ...supplierForm, [key]: e.target.value })} required={required}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500" />
                </div>
              ))}
              <div className="flex gap-3">
                <button type="submit" disabled={supplierSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm">
                  <Check size={14} /> {supplierSaving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setSupplierModal(false)}
                  className="flex-1 border border-gray-700 text-gray-300 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
