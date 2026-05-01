import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'

export function ConfirmDialog() {
  const { confirm, closeConfirm } = useUIStore()

  const handleConfirm = () => {
    if (!confirm) return
    confirm.onConfirm()
    closeConfirm()
  }

  const handleCancel = () => {
    confirm?.onCancel?.()
    closeConfirm()
  }

  return (
    <AnimatePresence>
      {confirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="bg-gray-900 ring-1 ring-white/10 rounded-xl shadow-2xl max-w-md w-[92vw] p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={`p-2 rounded-lg ${confirm.destructive ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{confirm.title}</h3>
                <p className="text-sm text-white/70 mt-1">{confirm.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm rounded-md text-white/80 hover:bg-white/10"
              >
                {confirm.cancelText ?? '取消'}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm rounded-md font-medium ${
                  confirm.destructive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {confirm.confirmText ?? '确认'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
