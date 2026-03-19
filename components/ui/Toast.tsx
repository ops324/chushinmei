'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

type ToastType = 'success' | 'error'

type ToastItem = {
  id: number
  message: string
  type: ToastType
}

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // フェードイン
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const isError = toast.type === 'error'

  return (
    <div
      onClick={onDismiss}
      style={{ transition: 'opacity 0.2s, transform 0.2s' }}
      className={`pointer-events-auto cursor-pointer max-w-xs px-4 py-3 rounded-sm border text-sm leading-[1.6] shadow-md
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        ${isError
          ? 'bg-[#fdf2f2] border-[#e8c4c4] text-[#7a3030]'
          : 'bg-bg-card border-border text-ink'
        }`}
    >
      <span className="mr-1.5">{isError ? '✕' : '✓'}</span>
      {toast.message}
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
