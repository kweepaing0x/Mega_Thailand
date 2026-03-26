'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Video, Package, Users, ShoppingBag, Settings, LogOut, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Lang } from '@/lib/i18n'
import { tx } from '@/lib/i18n'

const nav = [
  { href: '/dashboard',          icon: LayoutDashboard, key: 'dashboard'  },
  { href: '/dashboard/videos',   icon: Video,           key: 'videos'     },
  { href: '/dashboard/products', icon: Package,         key: 'products'   },
  { href: '/dashboard/users',    icon: Users,           key: 'users'      },
  { href: '/dashboard/orders',   icon: ShoppingBag,     key: 'orders'     },
  { href: '/dashboard/settings', icon: Settings,        key: 'settings'   },
] as const

interface SidebarProps { lang: Lang; onLangToggle: () => void }

export default function Sidebar({ lang, onLangToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen bg-surface-900 border-r border-surface-800">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-display font-bold text-white text-sm">M</div>
          <div>
            <div className="text-sm font-semibold text-white leading-none">Mega Thailand</div>
            <div className="text-[10px] text-surface-700 mt-0.5">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, icon: Icon, key }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-brand-500/15 text-brand-400 font-medium'
                  : 'text-surface-200 hover:bg-surface-800 hover:text-white'
              }`}>
              <Icon size={16} className={active ? 'text-brand-400' : 'text-surface-700'} />
              <span>{tx(key as any, lang)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-surface-800 space-y-1">
        <button onClick={onLangToggle}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-surface-200 hover:bg-surface-800 hover:text-white transition-all">
          <Globe size={16} className="text-surface-700" />
          <span>{lang === 'en' ? 'Myanmar (မြန်မာ)' : 'English'}</span>
        </button>
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-surface-200 hover:bg-surface-800 hover:text-white transition-all">
          <LogOut size={16} className="text-surface-700" />
          <span>{tx('logout', lang)}</span>
        </button>
      </div>
    </aside>
  )
}
