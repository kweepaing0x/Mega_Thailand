'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { PageHeader, Card, Badge, Spinner, EmptyState } from '@/components/ui'
import { Search, X } from 'lucide-react'
import type { Order, OrderStatus } from '@/lib/types'

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function OrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [filtered, setFiltered] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)

  async function load() {
    const { data } = await supabase
      .from('orders')
      .select('*, product:products(name, price_thb), seller:profiles!orders_seller_id_fkey(display_name, telegram_username)')
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setFiltered(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let list = orders
    if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        o.buyer_name.toLowerCase().includes(q) ||
        o.buyer_phone.includes(q) ||
        (o.delivery_address ?? '').toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [search, statusFilter, orders])

  async function updateStatus(id: string, status: OrderStatus) {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o))
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : s)
  }

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length
    return acc
  }, {} as Record<string, number>)

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="space-y-4 animate-slide-up">
      <PageHeader title="Orders · အော်ဒါများ" subtitle={`${orders.length} total`} />

      {/* Status pills */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatusFilter('all')}
          className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}>
          All ({orders.length})
        </button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700" />
        <input className="input pl-8" placeholder="Search buyer name, phone, address..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-4">
        <Card className="flex-1 overflow-hidden">
          {filtered.length === 0 ? <EmptyState message="No orders found." /> : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Buyer · ဝယ်သူ</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Seller</th>
                    <th>Status · အခြေအနေ</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <tr key={o.id} className={selected?.id === o.id ? 'bg-brand-500/5' : ''}>
                      <td>
                        <div className="text-sm text-white">{o.buyer_name}</div>
                        <div className="text-xs text-surface-700 font-mono">{o.buyer_phone}</div>
                      </td>
                      <td>
                        <div className="text-sm text-surface-200">{(o as any).product?.name ?? '—'}</div>
                        <div className="text-xs text-surface-700">Qty: {o.quantity}</div>
                      </td>
                      <td>
                        <div className="text-sm font-mono text-brand-400">{o.price_mmk.toLocaleString()} K</div>
                        <div className="text-xs text-surface-700 font-mono">{o.price_thb} THB</div>
                      </td>
                      <td>
                        <div className="text-xs text-surface-200">{(o as any).seller?.display_name ?? '—'}</div>
                        {(o as any).seller?.telegram_username && (
                          <div className="text-xs text-surface-700">@{(o as any).seller.telegram_username}</div>
                        )}
                      </td>
                      <td><Badge status={o.status} /></td>
                      <td className="text-xs text-surface-700">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button onClick={() => setSelected(o)} className="btn btn-secondary btn-sm">
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Order detail panel */}
        {selected && (
          <Card className="w-72 shrink-0 p-5 space-y-4 self-start animate-slide-up">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <div className="text-sm font-semibold text-white">Order Detail</div>
              <button onClick={() => setSelected(null)} className="text-surface-700 hover:text-white"><X size={15} /></button>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-700">Buyer</span>
                <span className="text-white">{selected.buyer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-700">Phone</span>
                <span className="text-white font-mono">{selected.buyer_phone}</span>
              </div>
              <div>
                <span className="text-surface-700 block mb-1">Address · လိပ်စာ</span>
                <span className="text-surface-200 text-xs">{selected.delivery_address}</span>
              </div>
              {selected.notes && (
                <div>
                  <span className="text-surface-700 block mb-1">Notes</span>
                  <span className="text-surface-200 text-xs">{selected.notes}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-surface-700">Qty</span>
                <span className="text-white">{selected.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-700">Price</span>
                <div className="text-right">
                  <div className="text-brand-400 font-mono">{selected.price_mmk.toLocaleString()} K</div>
                  <div className="text-xs text-surface-700">{selected.price_thb} THB</div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-700">Rate used</span>
                <span className="text-surface-200 font-mono text-xs">{selected.exchange_rate_used}</span>
              </div>
            </div>

            {/* Status update */}
            <div className="border-t border-surface-800 pt-4">
              <label className="block text-xs text-surface-700 mb-2 uppercase tracking-wider">Update Status · အခြေအနေပြောင်းမည်</label>
              <div className="space-y-1.5">
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)}
                    className={`w-full text-left btn btn-sm ${selected.status === s ? 'btn-primary' : 'btn-secondary'}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                    {selected.status === s && ' ✓'}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
