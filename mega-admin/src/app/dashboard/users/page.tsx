'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { PageHeader, Card, Badge, Toggle, Spinner, EmptyState } from '@/components/ui'
import { Search, ChevronRight } from 'lucide-react'
import type { Profile, UserRole } from '@/lib/types'

export default function UsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<Profile[]>([])
  const [filtered, setFiltered] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')

  async function load() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data ?? [])
    setFiltered(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let list = users
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        u.display_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.business_name?.toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [search, roleFilter, users])

  async function saveUser() {
    if (!selected) return
    setSaving(true)
    await supabase.from('profiles').update({
      role: selected.role,
      is_verified: selected.is_verified,
      is_active: selected.is_active,
      business_name: selected.business_name,
      telegram_username: selected.telegram_username,
      display_name: selected.display_name,
    }).eq('id', selected.id)
    setUsers(us => us.map(u => u.id === selected.id ? selected : u))
    setSaving(false)
  }

  async function resetPassword() {
    if (!selected || !newPassword) return
    setPwMsg('')
    const { error } = await supabase.auth.admin.updateUserById(selected.id, { password: newPassword })
    setPwMsg(error ? `Error: ${error.message}` : 'Password updated!')
    setNewPassword('')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="space-y-4 animate-slide-up">
      <PageHeader title="Users · အသုံးပြုသူများ" subtitle={`${users.length} total`} />

      <div className="flex gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700" />
          <input className="input pl-8" placeholder="Search name, email, phone..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {/* Role filter */}
        <select className="input w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="business">Business</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <Card className="flex-1 overflow-hidden">
          {filtered.length === 0 ? <EmptyState message="No users found." /> : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Status</th>
                    <th>Telegram</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} className={selected?.id === u.id ? 'bg-brand-500/5' : ''}>
                      <td>
                        <div className="text-sm text-white">{u.display_name ?? '—'}</div>
                        <div className="text-xs text-surface-700">{u.email ?? u.phone ?? '—'}</div>
                        {u.business_name && <div className="text-xs text-brand-400">{u.business_name}</div>}
                      </td>
                      <td><Badge status={u.role} /></td>
                      <td>
                        {u.is_verified
                          ? <span className="badge badge-green">Verified</span>
                          : <span className="badge badge-gray">—</span>}
                      </td>
                      <td><Badge status={u.is_active ? 'active' : 'suspended'} /></td>
                      <td className="text-surface-700 text-xs font-mono">
                        {u.telegram_username ? `@${u.telegram_username}` : '—'}
                      </td>
                      <td>
                        <button onClick={() => { setSelected(u); setNewPassword(''); setPwMsg('') }}
                          className="btn btn-secondary btn-sm">
                          <ChevronRight size={12} /> Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Detail panel */}
        {selected && (
          <Card className="w-72 shrink-0 p-5 space-y-4 self-start animate-slide-up">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <div>
                <div className="text-sm font-semibold text-white">{selected.display_name ?? 'User'}</div>
                <div className="text-xs text-surface-700">{selected.email ?? selected.phone}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-surface-700 hover:text-white text-lg leading-none">×</button>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs text-surface-700 mb-1.5 uppercase tracking-wider">Role · အခန်းကဏ္ဍ</label>
              <select className="input" value={selected.role}
                onChange={e => setSelected({ ...selected, role: e.target.value as UserRole })}>
                <option value="user">User</option>
                <option value="business">Business</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Business name */}
            <div>
              <label className="block text-xs text-surface-700 mb-1.5 uppercase tracking-wider">Business Name · စီးပွားရေးအမည်</label>
              <input className="input" value={selected.business_name ?? ''}
                onChange={e => setSelected({ ...selected, business_name: e.target.value })}
                placeholder="e.g. Kyaw Fashion Shop" />
            </div>

            {/* Display name */}
            <div>
              <label className="block text-xs text-surface-700 mb-1.5 uppercase tracking-wider">Display Name · အမည်</label>
              <input className="input" value={selected.display_name ?? ''}
                onChange={e => setSelected({ ...selected, display_name: e.target.value })} />
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-xs text-surface-700 mb-1.5 uppercase tracking-wider">Telegram · တယ်လီဂရမ်</label>
              <div className="flex items-center gap-1">
                <span className="text-surface-700 text-sm">@</span>
                <input className="input" value={selected.telegram_username ?? ''}
                  onChange={e => setSelected({ ...selected, telegram_username: e.target.value })}
                  placeholder="username" />
              </div>
            </div>

            {/* Verified toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white">Verified · အတည်ပြုထား</div>
                <div className="text-xs text-surface-700">Show verified badge</div>
              </div>
              <Toggle checked={selected.is_verified}
                onChange={v => setSelected({ ...selected, is_verified: v })} />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white">Active · အသက်ဝင်</div>
                <div className="text-xs text-surface-700">Suspend account</div>
              </div>
              <Toggle checked={selected.is_active}
                onChange={v => setSelected({ ...selected, is_active: v })} />
            </div>

            <button onClick={saveUser} disabled={saving}
              className="btn btn-primary w-full justify-center">
              {saving ? 'Saving...' : 'Save Changes · သိမ်းမည်'}
            </button>

            {/* Reset Password */}
            <div className="border-t border-surface-800 pt-4 space-y-2">
              <label className="block text-xs text-surface-700 uppercase tracking-wider">Reset Password · စကားဝှက် ပြောင်းမည်</label>
              <input className="input" type="password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)} placeholder="New password" />
              <button onClick={resetPassword} disabled={!newPassword}
                className="btn btn-secondary w-full justify-center btn-sm">
                Reset Password
              </button>
              {pwMsg && <div className="text-xs text-green-400">{pwMsg}</div>}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
