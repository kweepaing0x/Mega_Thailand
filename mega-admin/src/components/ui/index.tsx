'use client'
import { Loader2 } from 'lucide-react'

export function PageHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-white font-display">{title}</h1>
        {subtitle && <p className="text-sm text-surface-700 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, sub, color = 'orange' }: {
  label: string; value: string | number; sub?: string; color?: 'orange'|'green'|'blue'|'purple'
}) {
  const accent = {
    orange: 'border-brand-500/30 bg-brand-500/5',
    green:  'border-green-500/30 bg-green-500/5',
    blue:   'border-blue-500/30 bg-blue-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
  }[color]
  const text = {
    orange: 'text-brand-400',
    green:  'text-green-400',
    blue:   'text-blue-400',
    purple: 'text-purple-400',
  }[color]
  return (
    <div className={`rounded-xl border p-4 ${accent}`}>
      <div className="text-xs text-surface-700 mb-1 uppercase tracking-widest">{label}</div>
      <div className={`text-2xl font-bold font-display ${text}`}>{value}</div>
      {sub && <div className="text-xs text-surface-700 mt-1">{sub}</div>}
    </div>
  )
}

export function Toggle({ checked, onChange, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean
}) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} disabled={disabled} />
      <span className="toggle-slider" />
    </label>
  )
}

export function Badge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    in_stock:    ['badge-green',  'In Stock'],
    limited:     ['badge-amber',  'Limited'],
    out_of_stock:['badge-red',    'Out of Stock'],
    published:   ['badge-green',  'Published'],
    draft:       ['badge-gray',   'Draft'],
    pending:     ['badge-amber',  'Pending'],
    confirmed:   ['badge-blue',   'Confirmed'],
    shipped:     ['badge-orange', 'Shipped'],
    delivered:   ['badge-green',  'Delivered'],
    cancelled:   ['badge-red',    'Cancelled'],
    admin:       ['badge-orange', 'Admin'],
    business:    ['badge-blue',   'Business'],
    user:        ['badge-gray',   'User'],
    active:      ['badge-green',  'Active'],
    suspended:   ['badge-red',    'Suspended'],
    verified:    ['badge-green',  'Verified'],
  }
  const [cls, label] = map[status] ?? ['badge-gray', status]
  return <span className={`badge ${cls}`}>{label}</span>
}

export function Spinner() {
  return <Loader2 size={16} className="spin text-surface-700" />
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-surface-700 text-sm">{message}</div>
  )
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-900 rounded-xl border border-surface-800 ${className}`}>
      {children}
    </div>
  )
}
