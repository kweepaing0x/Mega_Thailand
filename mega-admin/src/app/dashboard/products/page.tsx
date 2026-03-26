'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { PageHeader, Card, Badge, Toggle, Spinner, EmptyState } from '@/components/ui'
import { Search, ExternalLink, Pencil, Trash2, X, Save } from 'lucide-react'
import type { Product, Settings } from '@/lib/types'

export default function ProductsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    const [{ data: prods }, { data: s }] = await Promise.all([
      supabase.from('products')
        .select('*, seller:profiles(display_name, telegram_username)')
        .order('created_at', { ascending: false }),
      supabase.from('settings').select('*').single(),
    ])
    setProducts(prods ?? [])
    setFiltered(prods ?? [])
    setSettings(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!search) { setFiltered(products); return }
    const q = search.toLowerCase()
    setFiltered(products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q)
    ))
  }, [search, products])

  function mmk(thb: number) {
    if (!settings) return '—'
    return Math.round(thb * settings.exchange_rate_thb_mmk).toLocaleString()
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('products').update({ is_active: !current }).eq('id', id)
    setProducts(ps => ps.map(p => p.id === id ? { ...p, is_active: !current } : p))
    if (editing?.id === id) setEditing(e => e ? { ...e, is_active: !current } : e)
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(ps => ps.filter(p => p.id !== id))
    if (editing?.id === id) setEditing(null)
  }

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    await supabase.from('products').update({
      name: editing.name,
      description: editing.description,
      price_thb: editing.price_thb,
      original_link: editing.original_link,
      source_platform: editing.source_platform,
      stock_status: editing.stock_status,
      estimated_days_min: editing.estimated_days_min,
      estimated_days_max: editing.estimated_days_max,
    }).eq('id', editing.id)
    setProducts(ps => ps.map(p => p.id === editing.id ? { ...p, ...editing } : p))
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="space-y-4 animate-slide-up">
      <PageHeader
        title="Products · ကုန်ပစ္စည်းများ"
        subtitle={`${products.length} total · 1 THB = ${settings?.exchange_rate_thb_mmk.toLocaleString() ?? '—'} MMK`}
      />

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700" />
        <input className="input pl-8" placeholder="Search products..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <Card className="flex-1 overflow-hidden">
          {filtered.length === 0 ? <EmptyState message="No products found." /> : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price THB</th>
                    <th>Price MMK</th>
                    <th>Stock</th>
                    <th>Seller</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className={editing?.id === p.id ? 'bg-brand-500/5' : ''}>
                      <td>
                        <div className="text-sm text-white font-medium">{p.name}</div>
                        {p.description && <div className="text-xs text-surface-700 truncate max-w-[180px]">{p.description}</div>}
                        <div className="text-xs text-surface-700">{p.source_platform} · {p.estimated_days_min}–{p.estimated_days_max} days</div>
                      </td>
                      <td className="font-mono text-sm text-white">{p.price_thb} ฿</td>
                      <td className="font-mono text-sm text-brand-400">{mmk(p.price_thb)} K</td>
                      <td><Badge status={p.stock_status} /></td>
                      <td>
                        <div className="text-xs text-surface-200">{(p as any).seller?.display_name ?? '—'}</div>
                        {(p as any).seller?.telegram_username && (
                          <div className="text-xs text-surface-700 font-mono">@{(p as any).seller.telegram_username}</div>
                        )}
                      </td>
                      <td>
                        <Toggle checked={p.is_active} onChange={() => toggleActive(p.id, p.is_active)} />
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditing({ ...p })} className="btn btn-secondary btn-sm">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="btn btn-danger btn-sm">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Edit panel */}
        {editing && (
          <Card className="w-72 shrink-0 p-5 space-y-4 self-start animate-slide-up">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <div className="text-sm font-semibold text-white">Edit Product</div>
              <button onClick={() => setEditing(null)} className="text-surface-700 hover:text-white"><X size={15} /></button>
            </div>

            <div>
              <label className="block text-xs text-surface-700 mb-1">Name · ကုန်ပစ္စည်းအမည်</label>
              <input className="input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            </div>

            <div>
              <label className="block text-xs text-surface-700 mb-1">Description</label>
              <textarea className="input" value={editing.description ?? ''}
                onChange={e => setEditing({ ...editing, description: e.target.value })} />
            </div>

            <div>
              <label className="block text-xs text-surface-700 mb-1">Price THB · ဘတ်</label>
              <input className="input font-mono" type="number" step="0.01" value={editing.price_thb}
                onChange={e => setEditing({ ...editing, price_thb: parseFloat(e.target.value) })} />
              {settings && (
                <div className="text-xs text-brand-400 mt-1 font-mono">
                  = {Math.round(editing.price_thb * settings.exchange_rate_thb_mmk).toLocaleString()} MMK
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-surface-700 mb-1">Stock · ကုန်လက်ကျန်</label>
              <select className="input" value={editing.stock_status}
                onChange={e => setEditing({ ...editing, stock_status: e.target.value as any })}>
                <option value="in_stock">In Stock</option>
                <option value="limited">Limited</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-surface-700 mb-1">Min days</label>
                <input className="input" type="number" value={editing.estimated_days_min}
                  onChange={e => setEditing({ ...editing, estimated_days_min: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs text-surface-700 mb-1">Max days</label>
                <input className="input" type="number" value={editing.estimated_days_max}
                  onChange={e => setEditing({ ...editing, estimated_days_max: parseInt(e.target.value) })} />
              </div>
            </div>

            <div>
              <label className="block text-xs text-surface-700 mb-1">Source Link (Admin only)</label>
              <div className="flex gap-1">
                <input className="input text-xs" value={editing.original_link ?? ''}
                  onChange={e => setEditing({ ...editing, original_link: e.target.value })}
                  placeholder="https://..." />
                {editing.original_link && (
                  <a href={editing.original_link} target="_blank" rel="noreferrer"
                    className="btn btn-secondary btn-sm shrink-0">
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            <button onClick={saveEdit} disabled={saving} className="btn btn-primary w-full justify-center">
              {saving ? 'Saving...' : <><Save size={13} /> Save Changes</>}
            </button>
          </Card>
        )}
      </div>
    </div>
  )
}
