'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import type { Category } from '@/lib/types';

interface FormState {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

const EMPTY: FormState = { name: '', description: '', imageUrl: '', isActive: true };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | number | null>(null); // null=closed, 'create'=new, number=editId
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    getCategories()
      .then(setCategories)
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (c: Category) => {
    setForm({ name: c.name, description: c.description ?? '', imageUrl: c.imageUrl ?? '', isActive: c.isActive });
    setModal(c.id);
  };
  const closeModal = () => setModal(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (modal === 'create') {
        const cat = await createCategory({ name: form.name, description: form.description || undefined, imageUrl: form.imageUrl || undefined });
        setCategories((prev) => [...prev, cat]);
        toast.success('Category created');
      } else {
        const cat = await updateCategory(modal as number, { name: form.name, description: form.description || undefined, imageUrl: form.imageUrl || undefined, isActive: form.isActive });
        setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
        toast.success('Category updated');
      }
      closeModal();
    } catch {
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category? Products in it will be unassigned.')) return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Categories</h1>
          <p className="text-gray-400 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
          <Plus size={16} /> New Category
        </button>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />)}</div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No categories yet. Create one!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Name', 'Slug', 'Products', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-5 py-3 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {cat.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 rounded-lg object-cover bg-gray-800" />
                        )}
                        <span className="text-white font-medium">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400 font-mono text-xs">{cat.slug}</td>
                    <td className="px-5 py-4 text-gray-300">{(cat as unknown as { productCount?: number }).productCount ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${cat.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(cat)} className="text-gray-400 hover:text-white transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(cat.id)} disabled={deletingId === cat.id} className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-40"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={closeModal} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">{modal === 'create' ? 'New Category' : 'Edit Category'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Image URL</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..."
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500" />
              </div>
              {modal !== 'create' && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-rose-500 focus:ring-rose-500" />
                  <span className="text-white text-sm font-medium">Active</span>
                </label>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
                  <Check size={14} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={closeModal}
                  className="flex-1 border border-gray-700 text-gray-300 hover:text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
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
