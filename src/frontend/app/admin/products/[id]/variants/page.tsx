'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getVariants, addVariant, updateVariant, deleteVariant, getProduct } from '@/lib/api';
import type { ProductVariant } from '@/lib/types';

const JERSEY_TYPES = ['notApplicable', 'home', 'away', 'third'];

interface EditingState {
  variantId: number;
  field: keyof ProductVariant;
  value: string;
}

export default function VariantsPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const [productName, setProductName] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // New variant form
  const [showAdd, setShowAdd] = useState(false);
  const [newColor, setNewColor] = useState('');
  const [newType, setNewType] = useState('notApplicable');
  const [newSize, setNewSize] = useState('');
  const [newStock, setNewStock] = useState(0);
  const [newSku, setNewSku] = useState('');

  const fetchVariants = useCallback(async () => {
    setLoading(true);
    try {
      const [vars, product] = await Promise.all([
        getVariants(productId),
        getProduct(productId),
      ]);
      setVariants(vars);
      setProductName(product.name);
    } catch {
      toast.error('Failed to load variants');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchVariants(); }, [fetchVariants]);

  const startEdit = (variantId: number, field: keyof ProductVariant, value: string | number) => {
    setEditing({ variantId, field, value: String(value) });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const variant = variants.find((v) => v.id === editing.variantId);
    if (!variant) return;
    setSaving(true);
    try {
      const updated = await updateVariant(productId, editing.variantId, {
        color: editing.field === 'color' ? editing.value : variant.color,
        jerseyType: editing.field === 'jerseyType' ? editing.value : variant.jerseyType,
        size: editing.field === 'size' ? editing.value : variant.size,
        stockQuantity: editing.field === 'stockQuantity' ? Number(editing.value) : variant.stockQuantity,
        sku: editing.field === 'sku' ? editing.value : variant.sku,
      });
      setVariants((prev) => prev.map((v) => (v.id === editing.variantId ? updated : v)));
      setEditing(null);
      toast.success('Variant updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => setEditing(null);

  const handleDelete = async (variantId: number) => {
    if (!confirm('Delete this variant?')) return;
    setDeletingId(variantId);
    try {
      await deleteVariant(productId, variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      toast.success('Variant deleted');
    } catch {
      toast.error('Failed to delete variant');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdd = async () => {
    if (!newSize) { toast.error('Size is required'); return; }
    setSaving(true);
    try {
      const added = await addVariant(productId, {
        color: newColor,
        jerseyType: newType,
        size: newSize,
        stockQuantity: newStock,
        sku: newSku || undefined,
      });
      setVariants((prev) => [...prev, added]);
      setShowAdd(false);
      setNewColor(''); setNewType('notApplicable'); setNewSize(''); setNewStock(0); setNewSku('');
      toast.success('Variant added');
    } catch {
      toast.error('Failed to add variant');
    } finally {
      setSaving(false);
    }
  };

  const EditableCell = ({
    variantId,
    field,
    value,
    type = 'text',
    options,
  }: {
    variantId: number;
    field: keyof ProductVariant;
    value: string | number;
    type?: 'text' | 'number' | 'select';
    options?: string[];
  }) => {
    const isEditing = editing?.variantId === variantId && editing?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          {type === 'select' && options ? (
            <select
              value={editing.value}
              onChange={(e) => setEditing({ ...editing, value: e.target.value })}
              autoFocus
              className="bg-gray-800 border border-rose-500 text-white text-xs px-2 py-1 rounded-lg w-24"
            >
              {options.map((o) => <option key={o} value={o}>{o === 'notApplicable' ? 'N/A' : o}</option>)}
            </select>
          ) : (
            <input
              type={type}
              value={editing.value}
              onChange={(e) => setEditing({ ...editing, value: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
              autoFocus
              className="bg-gray-800 border border-rose-500 text-white text-xs px-2 py-1 rounded-lg w-20"
            />
          )}
          <button onClick={saveEdit} disabled={saving} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
          <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-300"><X size={14} /></button>
        </div>
      );
    }

    return (
      <button
        onClick={() => startEdit(variantId, field, value)}
        title="Click to edit"
        className={`text-left text-sm hover:text-rose-300 transition-colors capitalize ${field === 'stockQuantity' ? (Number(value) === 0 ? 'text-red-400' : Number(value) < 5 ? 'text-yellow-400' : 'text-green-400') : 'text-white'}`}
      >
        {field === 'jerseyType' && value === 'notApplicable' ? 'N/A' : String(value)}
      </button>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Variants</h1>
          {productName && <p className="text-gray-400 text-sm">{productName}</p>}
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <p className="text-white font-bold">{variants.length} variant{variants.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm"
          >
            <Plus size={14} /> Add Variant
          </button>
        </div>

        {showAdd && (
          <div className="p-5 border-b border-gray-800 bg-gray-800/40">
            <p className="text-white font-semibold mb-3 text-sm">New Variant</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Color</label>
                <input value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="White"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-xs px-2 py-2 rounded-lg focus:outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Type</label>
                <select value={newType} onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-xs px-2 py-2 rounded-lg focus:outline-none focus:border-rose-500">
                  {JERSEY_TYPES.map((t) => <option key={t} value={t}>{t === 'notApplicable' ? 'N/A' : t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Size *</label>
                <input value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="M"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-xs px-2 py-2 rounded-lg focus:outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Stock</label>
                <input value={newStock} onChange={(e) => setNewStock(Number(e.target.value))} type="number" min="0"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-xs px-2 py-2 rounded-lg focus:outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">SKU</label>
                <input value={newSku} onChange={(e) => setNewSku(e.target.value)} placeholder="Optional"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-xs px-2 py-2 rounded-lg focus:outline-none focus:border-rose-500" />
              </div>
              <div className="flex items-end gap-2">
                <button onClick={handleAdd} disabled={saving}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold text-xs py-2 rounded-lg transition-colors">
                  Add
                </button>
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-700 text-gray-300 text-xs py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : variants.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No variants yet. Add one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Color', 'Type', 'Size', 'Stock', 'SKU', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-5 py-3 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="px-5 py-3">
                      <EditableCell variantId={v.id} field="color" value={v.color} />
                    </td>
                    <td className="px-5 py-3">
                      <EditableCell variantId={v.id} field="jerseyType" value={v.jerseyType} type="select" options={JERSEY_TYPES} />
                    </td>
                    <td className="px-5 py-3">
                      <EditableCell variantId={v.id} field="size" value={v.size} />
                    </td>
                    <td className="px-5 py-3">
                      <EditableCell variantId={v.id} field="stockQuantity" value={v.stockQuantity} type="number" />
                    </td>
                    <td className="px-5 py-3">
                      <EditableCell variantId={v.id} field="sku" value={v.sku ?? ''} />
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={deletingId === v.id}
                        className="text-gray-500 hover:text-red-400 transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-gray-500 text-xs">💡 Click on any cell to edit it inline. Press Enter to save or Escape to cancel.</p>
    </div>
  );
}
