'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { PageHeader, Card, Badge, Toggle, Spinner, EmptyState } from '@/components/ui'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Video } from '@/lib/types'

export default function VideosPage() {
  const supabase = createClient()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase
      .from('videos')
      .select('*, uploader:profiles(display_name)')
      .order('created_at', { ascending: false })
    setVideos(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function togglePublish(id: string, current: boolean) {
    await supabase.from('videos').update({ is_published: !current }).eq('id', id)
    setVideos(vs => vs.map(v => v.id === id ? { ...v, is_published: !current } : v))
  }

  async function deleteVideo(id: string) {
    if (!confirm('Delete this video?')) return
    await supabase.from('videos').delete().eq('id', id)
    setVideos(vs => vs.filter(v => v.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="space-y-4 animate-slide-up">
      <PageHeader
        title="Videos · ဗီဒီယိုများ"
        subtitle={`${videos.length} total`}
        action={
          <Link href="/dashboard/videos/new" className="btn btn-primary">
            <Plus size={14} /> Upload Video
          </Link>
        }
      />
      <Card>
        {videos.length === 0 ? <EmptyState message="No videos yet. Upload your first video." /> : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Uploader</th>
                  <th>Views</th>
                  <th>Published · ထုတ်ဝေမည်</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {v.thumbnail_url ? (
                          <img src={v.thumbnail_url} alt="" className="w-12 h-8 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-8 bg-surface-800 rounded flex items-center justify-center">
                            <Eye size={12} className="text-surface-700" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-white font-medium">{v.title}</div>
                          {v.description && (
                            <div className="text-xs text-surface-700 truncate max-w-[200px]">{v.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-surface-200 text-sm">{(v as any).uploader?.display_name ?? '—'}</td>
                    <td className="text-surface-700 text-sm">{v.view_count.toLocaleString()}</td>
                    <td>
                      <Toggle checked={v.is_published} onChange={() => togglePublish(v.id, v.is_published)} />
                    </td>
                    <td className="text-surface-700 text-xs">{new Date(v.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/videos/edit?id=${v.id}`} className="btn btn-secondary btn-sm">
                          <Pencil size={12} />
                        </Link>
                        <button onClick={() => deleteVideo(v.id)} className="btn btn-danger btn-sm">
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
    </div>
  )
}
