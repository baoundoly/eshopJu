'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllSlides, createSlide, updateSlide, deleteSlide } from '@/lib/api';
import type { SlideDto } from '@/lib/types';

interface SlideForm {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  linkLabel: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm = (): SlideForm => ({
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '',
  linkLabel: '',
  sortOrder: '0',
  isActive: true,
});

function slideToForm(s: SlideDto): SlideForm {
  return {
    title: s.title,
    subtitle: s.subtitle ?? '',
    imageUrl: s.imageUrl,
    linkUrl: s.linkUrl ?? '',
    linkLabel: s.linkLabel ?? '',
    sortOrder: String(s.sortOrder),
    isActive: s.isActive,
  };
}

const PLACEHOLDER = 'https://placehold.co/1200x500/1a1a1a/ffffff?text=Slide';

export default function AdminSlidesPage() {
  const [slides, setSlides] = useState<SlideDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SlideForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchSlides = useCallback(() => {
    setLoading(true);
    getAllSlides()
      .then(setSlides)
      .catch(() => toast.error('Failed to load slides'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (slide: SlideDto) => {
    setEditingId(slide.id);
    setForm(slideToForm(slide));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.imageUrl.trim()) {
      toast.error('Title and Image URL are required.');
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      subtitle: form.subtitle || undefined,
      imageUrl: form.imageUrl,
      linkUrl: form.linkUrl || undefined,
      linkLabel: form.linkLabel || undefined,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };
    try {
      if (editingId) {
        await updateSlide(editingId, payload);
        toast.success('Slide updated!');
      } else {
        await createSlide(payload);
        toast.success('Slide created!');
      }
      setShowModal(false);
      fetchSlides();
    } catch {
      toast.error('Failed to save slide');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this slide? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteSlide(id);
      toast.success('Slide deleted');
      fetchSlides();
    } catch {
      toast.error('Failed to delete slide');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Home Slides</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage hero slideshow displayed on the home page</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={16} /> Add Slide
        </button>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : slides.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <p className="text-lg font-semibold mb-2">No slides yet</p>
            <p className="text-sm">Create your first slide to display on the home page hero.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Preview', 'Title', 'Link', 'Order', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-gray-500 font-semibold px-4 py-3 text-xs uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slides.map((s) => (
                  <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="relative w-24 h-12 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                        <Image
                          src={s.imageUrl || PLACEHOLDER}
                          alt={s.title}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{s.title}</p>
                      {s.subtitle && <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{s.subtitle}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[160px]">
                      {s.linkUrl ? (
                        <span className="truncate block">{s.linkLabel || s.linkUrl}</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{s.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-white transition-colors" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={deletingId === s.id}
                          className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-white font-black text-lg">{editingId ? 'Edit Slide' : 'New Slide'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500"
                  placeholder="e.g. Shop New Arrivals"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Subtitle</label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500"
                  placeholder="Optional tagline"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Image URL *</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Link URL</label>
                  <input
                    value={form.linkUrl}
                    onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500"
                    placeholder="/products"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Button Label</label>
                  <input
                    value={form.linkLabel}
                    onChange={(e) => setForm({ ...form, linkLabel: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500"
                    placeholder="Shop Now"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    min="0"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                </div>
                <label className="flex items-center gap-2 mt-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-white text-sm font-medium">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-800">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Check size={15} /> {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Slide'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="border border-gray-700 text-gray-300 hover:text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
