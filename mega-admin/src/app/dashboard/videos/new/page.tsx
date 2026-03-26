'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { PageHeader, Card } from '@/components/ui'
import { Upload, Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ProductForm {
  name: string; description: string; price_thb: string
  original_link: string; source_platform: string
  stock_status: string; estimated_days_min: string; estimated_days_max: string
}

const emptyProduct = (): ProductForm => ({
  name: '', description: '', price_thb: '',
  original_link: '', source_platform: 'other',
  stock_status: 'in_stock', estimated_days_min: '7', estimated_days_max: '14',
})

export default function NewVideoPage() {
  const supabase = createClient()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [products, setProducts] = useState<ProductForm[]>([emptyProduct()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateProduct(i: number, field: keyof ProductForm, value: string) {
    setProducts(ps => ps.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!videoFile) { setError('Please select a video file'); return }
    setSaving(true); setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload video
      const videoPath = `${user.id}/${Date.now()}-${videoFile.name}`
      const { error: vErr } = await supabase.storage.from('videos').upload(videoPath, videoFile)
      if (vErr) throw vErr
      const { data: { publicUrl: videoUrl } } = supabase.storage.from('videos').getPublicUrl(videoPath)

      // Upload thumbnail
      let thumbnailUrl = null
      if (thumbFile) {
        const thumbPath = `${user.id}/${Date.now()}-${thumbFile.name}`
        await supabase.storage.from('thumbnails').upload(thumbPath, thumbFile)
        const { data: { publicUrl } } = supabase.storage.from('thumbnails').getPublicUrl(thumbPath)
        thumbnailUrl = publicUrl
      }

      // Insert video
      const { data: video, error: videoInsertErr } = await supabase
        .from('videos')
        .insert({ uploader_id: user.id, title, description, video_url: videoUrl, thumbnail_url: thumbnailUrl, is_published: false })
        .select().single()
      if (videoInsertErr) throw videoInsertErr

      // Insert products
      const validProducts = products.filter(p => p.name && p.price_thb)
      if (validProducts.length > 0) {
        await supabase.from('products').insert(
          validProducts.map(p => ({
            video_id: video.id,
            seller_id: user.id,
            name: p.name,
            description: p.description || null,
            price_thb: parseFloat(p.price_thb),
            original_link: p.original_link || null,
            source_platform: p.source_platform,
            stock_status: p.stock_status,
            estimated_days_min: parseInt(p.estimated_days_min),
            estimated_days_max: parseInt(p.estimated_days_max),
          }))
        )
      }

      router.push('/dashboard/videos')
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 animate-slide-up max-w-3xl">
      <PageHeader
        title="Upload Video · ဗီဒီယို တင်မည်"
        action={
          <Link href="/dashboard/videos" className="btn btn-secondary">
            <ArrowLeft size={14} /> Back
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Video Info */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white border-b border-surface-800 pb-3">Video Info</h2>

          <div>
            <label className="block text-xs text-surface-700 mb-1.5 uppercase tracking-wider">Title · ခေါင်းစဉ်</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Nike Air Force Collection 2024" />
          </div>

          <div>
            <label className="block text-xs text-surface-700 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-surface-700 mb-1.5 uppercase tracking-wider">Video File</label>
              <label className="flex flex-col items-center justify-center border border-dashed border-surface-700 rounded-xl p-6 cursor-pointer hover:border-brand-500/50 transition-colors bg-surface-950">
                <Upload size={20} className="text-surface-700 mb-2" />
                <span className="text-xs text-surface-700">{videoFile ? videoFile.name : 'Click to upload .mp4'}</span>
                <input type="file" accept="video/*" className="hidden" onChange={e => setVideoFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div>
              <label className="block text-xs text-surface-700 mb-1.5 uppercase tracking-wider">Thumbnail · ပုံသေး</label>
              <label className="flex flex-col items-center justify-center border border-dashed border-surface-700 rounded-xl p-6 cursor-pointer hover:border-brand-500/50 transition-colors bg-surface-950">
                <Upload size={20} className="text-surface-700 mb-2" />
                <span className="text-xs text-surface-700">{thumbFile ? thumbFile.name : 'Click to upload image'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => setThumbFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </div>
        </Card>

        {/* Products */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-800 pb-3">
            <h2 className="text-sm font-semibold text-white">Tagged Products · ကုန်ပစ္စည်းများ</h2>
            <button type="button" onClick={() => setProducts(ps => [...ps, emptyProduct()])} className="btn btn-secondary btn-sm">
              <Plus size={12} /> Add Product
            </button>
          </div>

          {products.map((p, i) => (
            <div key={i} className="bg-surface-950 rounded-xl p-4 space-y-3 border border-surface-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-brand-400 font-medium">Product #{i + 1}</span>
                {products.length > 1 && (
                  <button type="button" onClick={() => setProducts(ps => ps.filter((_, idx) => idx !== i))}
                    className="text-surface-700 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-surface-700 mb-1">Product Name · ကုန်ပစ္စည်းအမည်</label>
                  <input className="input" value={p.name} onChange={e => updateProduct(i, 'name', e.target.value)} placeholder="e.g. Nike Air Force 1 White" />
                </div>
                <div>
                  <label className="block text-xs text-surface-700 mb-1">Price THB · ဘတ်</label>
                  <input className="input" type="number" step="0.01" value={p.price_thb} onChange={e => updateProduct(i, 'price_thb', e.target.value)} placeholder="399" />
                </div>
                <div>
                  <label className="block text-xs text-surface-700 mb-1">Stock · ကုန်လက်ကျန်</label>
                  <select className="input" value={p.stock_status} onChange={e => updateProduct(i, 'stock_status', e.target.value)}>
                    <option value="in_stock">In Stock · ရှိသေး</option>
                    <option value="limited">Limited · နည်းသေး</option>
                    <option value="out_of_stock">Out of Stock · ကုန်သွား</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-surface-700 mb-1">Est. Days Min</label>
                  <input className="input" type="number" value={p.estimated_days_min} onChange={e => updateProduct(i, 'estimated_days_min', e.target.value)} placeholder="7" />
                </div>
                <div>
                  <label className="block text-xs text-surface-700 mb-1">Est. Days Max</label>
                  <input className="input" type="number" value={p.estimated_days_max} onChange={e => updateProduct(i, 'estimated_days_max', e.target.value)} placeholder="14" />
                </div>
                <div>
                  <label className="block text-xs text-surface-700 mb-1">Source Platform</label>
                  <select className="input" value={p.source_platform} onChange={e => updateProduct(i, 'source_platform', e.target.value)}>
                    <option value="shopee_th">Shopee TH</option>
                    <option value="lazada_th">Lazada TH</option>
                    <option value="1688">1688</option>
                    <option value="jd_central">JD Central</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-surface-700 mb-1">Description</label>
                  <input className="input" value={p.description} onChange={e => updateProduct(i, 'description', e.target.value)} placeholder="Optional" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-surface-700 mb-1">Source Link (Admin only · Admin သာမြင်)</label>
                  <input className="input" value={p.original_link} onChange={e => updateProduct(i, 'original_link', e.target.value)} placeholder="https://shopee.co.th/..." />
                </div>
              </div>
            </div>
          ))}
        </Card>

        {error && (
          <div className="text-xs text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? <><Loader2 size={14} className="spin" /> Uploading...</> : <><Upload size={14} /> Upload & Save</>}
          </button>
          <Link href="/dashboard/videos" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
