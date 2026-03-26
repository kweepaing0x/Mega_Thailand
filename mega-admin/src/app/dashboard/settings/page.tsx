'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { PageHeader, Card, Spinner } from '@/components/ui'
import { Save, RefreshCw, TrendingUp, CheckCircle, AtSign } from 'lucide-react'
import type { Settings } from '@/lib/types'

export default function SettingsPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [rate, setRate] = useState('')
  const [badgeLabel, setBadgeLabel] = useState('')
  const [fallbackTg, setFallbackTg] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('settings').select('*').single()
      if (data) {
        setSettings(data)
        setRate(String(data.exchange_rate_thb_mmk))
        setBadgeLabel(data.verified_badge_label)
        setFallbackTg(data.telegram_fallback ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const { error } = await supabase.from('settings').update({
      exchange_rate_thb_mmk: parseFloat(rate),
      verified_badge_label: badgeLabel,
      telegram_fallback: fallbackTg || null,
      rate_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', 1)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  const rateNum = parseFloat(rate) || 0
  const previewPrices = [99, 299, 599, 999, 1990]

  return (
    <div className="space-y-5 animate-slide-up max-w-2xl">
      <PageHeader title="Settings · ဆက်တင်များ" subtitle="Global app configuration" />

      <form onSubmit={handleSave} className="space-y-5">

        {/* Exchange Rate */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-800 pb-3">
            <TrendingUp size={15} className="text-brand-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">Exchange Rate · ငွေလဲနှုန်း</h2>
              <p className="text-xs text-surface-700">
                Last updated: {settings ? new Date(settings.rate_updated_at).toLocaleString() : '—'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs text-surface-700 mb-1.5 uppercase tracking-wider">
              1 THB = ? MMK · ၁ ဘတ် = ??? ကျပ်
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700 text-sm font-mono">1 ฿ =</span>
                <input
                  className="input pl-14 font-mono text-brand-400 text-lg"
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={e => setRate(e.target.value)}
                  placeholder="82.00"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-700 text-sm">MMK</span>
              </div>
            </div>
          </div>

          {/* Live preview table */}
          {rateNum > 0 && (
            <div className="bg-surface-950 rounded-xl p-4 border border-surface-800">
              <div className="text-xs text-surface-700 mb-3 uppercase tracking-wider">Price Preview · စျေးနှုန်း ကြိုကြည့်</div>
              <div className="space-y-1.5">
                {previewPrices.map(thb => (
                  <div key={thb} className="flex items-center justify-between text-sm">
                    <span className="text-surface-400 font-mono">{thb} THB</span>
                    <span className="text-surface-700">→</span>
                    <span className="text-brand-400 font-mono font-medium">
                      {Math.round(thb * rateNum).toLocaleString()} MMK
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Verified Badge */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-800 pb-3">
            <CheckCircle size={15} className="text-green-400" />
            <h2 className="text-sm font-semibold text-white">Verified Badge · အတည်ပြုတံဆိပ်</h2>
          </div>

          <div>
            <label className="block text-xs text-surface-700 mb-1.5 uppercase tracking-wider">
              Badge Label Text · တံဆိပ်စာသား
            </label>
            <input className="input" value={badgeLabel} onChange={e => setBadgeLabel(e.target.value)}
              placeholder="Verified Seller" required />
            <div className="mt-2 flex items-center gap-2">
              <span className="badge badge-green text-xs">{badgeLabel || 'Verified Seller'}</span>
              <span className="text-xs text-surface-700">preview</span>
            </div>
          </div>
        </Card>

        {/* Telegram Fallback */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-800 pb-3">
            <AtSign size={15} className="text-blue-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">Fallback Telegram · အရန် တယ်လီဂရမ်</h2>
              <p className="text-xs text-surface-700">Used when a product has no seller Telegram set</p>
            </div>
          </div>

          <div>
            <label className="block text-xs text-surface-700 mb-1.5 uppercase tracking-wider">
              Telegram Username · တယ်လီဂရမ် အမည်
            </label>
            <div className="flex items-center gap-1">
              <span className="text-surface-700 text-sm font-mono">@</span>
              <input className="input font-mono" value={fallbackTg}
                onChange={e => setFallbackTg(e.target.value.replace('@', ''))}
                placeholder="megathailand_shop" />
            </div>
            {fallbackTg && (
              <a href={`https://t.me/${fallbackTg}`} target="_blank" rel="noreferrer"
                className="text-xs text-brand-400 mt-1 block hover:underline">
                t.me/{fallbackTg}
              </a>
            )}
          </div>
        </Card>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving
              ? <><RefreshCw size={14} className="spin" /> Saving...</>
              : <><Save size={14} /> Save Settings · သိမ်းမည်</>}
          </button>
          {saved && (
            <span className="text-sm text-green-400 animate-fade-in flex items-center gap-1">
              <CheckCircle size={14} /> Saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
