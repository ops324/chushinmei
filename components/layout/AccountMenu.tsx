'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { logout } from '@/lib/actions/auth-actions'
import Avatar from '@/components/ui/Avatar'

type Props = {
  displayName: string
  email: string
  avatarUrl: string | null
}

export default function AccountMenu({ displayName, email, avatarUrl }: Props) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus() }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKey)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKey)
      }
    }
  }, [open])

  const label = displayName || email

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded hover:bg-bg-surface transition-colors max-w-[200px]"
        aria-label="アカウントメニュー"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={avatarUrl} name={displayName || email} size={24} />
        <span className="text-xs text-ink-light tracking-wide truncate hidden sm:inline">{label}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-faint shrink-0" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1.5 bg-bg-card border border-border rounded shadow-[0_4px_20px_var(--shadow-md)] z-50 min-w-[220px] py-1 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border">
            {displayName && <p className="text-sm text-ink font-medium truncate">{displayName}</p>}
            <p className="text-xs text-ink-faint truncate">{email}</p>
          </div>
          <Link
            role="menuitem"
            href="/account"
            onClick={() => setOpen(false)}
            className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-bg-surface transition-colors flex items-center gap-2.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            アカウント設定
          </Link>
          <div className="mx-3 my-1 border-t border-border" />
          <form action={logout}>
            <button
              role="menuitem"
              type="submit"
              className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-bg-surface transition-colors flex items-center gap-2.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              ログアウト
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
