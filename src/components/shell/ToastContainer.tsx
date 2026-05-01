import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react'
import { useUIStore, type ToastKind } from '@/stores/useUIStore'

const KIND_STYLE: Record<ToastKind, { icon: typeof Info; ring: string; bg: string }> = {
  info: { icon: Info, ring: 'ring-blue-500/40', bg: 'bg-blue-950/90' },
  success: { icon: CheckCircle2, ring: 'ring-emerald-500/40', bg: 'bg-emerald-950/90' },
  warning: { icon: AlertCircle, ring: 'ring-amber-500/40', bg: 'bg-amber-950/90' },
  error: { icon: XCircle, ring: 'ring-rose-500/40', bg: 'bg-rose-950/90' },
}

export function ToastContainer() {
  const { toasts, dismissToast } = useUIStore()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const style = KIND_STYLE[t.kind]
          const Icon = style.icon
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg ring-1 ${style.ring} ${style.bg} backdrop-blur-md shadow-xl text-sm text-white min-w-[260px] max-w-md`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-white/60 hover:text-white"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
