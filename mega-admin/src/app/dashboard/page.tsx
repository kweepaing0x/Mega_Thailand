'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { StatCard, Card, Badge, Spinner } from '@/components/ui'
import { TrendingUp } from 'lucide-react'
import type { Settings, Order } from '@/lib/types'

export default function DashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({ videos: 0, users: 0, orders: 0, products: 0 })
  const [settings, setSettings] = useState<Settings | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: videos },
        { count: users },
        { count: orders },
        { count: products },
        { data: settingsData },
        { data: ordersData },
      ] = await Promise.all([
        supabase.from('videos').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('settings').select('*').single(),
        supabase.from('orders').select('*, product:products(name), seller:profiles!orders_seller_id_fkey(display_name, telegram_username)')
          .order('created_at', { ascending: false }).limit(8),
      ])
      setStats({ videos: videos ?? 0, users: users ?? 0, orders: orders ?? 0, products: products ?? 0 })
      setSettings(settingsData)
      setRecentOrders(ordersData ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white font-display">Dashboard</h1>
          <p className="text-sm text-surface-700 mt-0.5">ဒက်ရှ်ဘုတ်</p>
        </div>
        {settings && (
          <div className="flex items-center gap-2 bg-surface-900 border border-surface-800 rounded-xl px-4 py-2.5">
            <TrendingUp size={14} className="text-brand-400" />
            <span className="text-xs text-surface-700">1 THB =</span>
            <span className="text-sm font-bold text-brand-400">{settings.exchange_rate_thb_mmk.toLocaleString()} MMK</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Videos · ဗီဒီယိုအားလုံး" value={stats.videos} color="orange" />
        <StatCard label="Total Users · အသုံးပြုသူ" value={stats.users} color="blue" />
        <StatCard label="Total Orders · အော်ဒါ" value={stats.orders} color="green" />
        <StatCard label="Total Products · ကုန်ပစ္စည်း" value={stats.products} color="purple" />
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="px-5 py-4 border-b border-surface-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Recent Orders</div>
            <div className="text-xs text-surface-700">မကြာသေးမီ အော်ဒါများ</div>
          </div>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-surface-700 text-sm">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <div className="text-white text-sm">{order.buyer_name}</div>
                      <div className="text-xs text-surface-700">{order.buyer_phone}</div>
                    </td>
                    <td className="text-surface-200 text-sm">{(order as any).product?.name ?? '—'}</td>
                    <td>
                      <div className="text-white text-sm font-mono">{order.price_mmk.toLocaleString()} MMK</div>
                      <div className="text-xs text-surface-700">{order.price_thb} THB</div>
                    </td>
                    <td><Badge status={order.status} /></td>
                    <td className="text-surface-700 text-xs">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
