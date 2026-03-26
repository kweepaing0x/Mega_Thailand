'use client'
import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import type { Lang } from '@/lib/i18n'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar lang={lang} onLangToggle={() => setLang(l => l === 'en' ? 'my' : 'en')} />
      <main className="flex-1 overflow-y-auto bg-surface-950">
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
